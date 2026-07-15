/**
 * Creates one Stripe product with recurring prices per plan.
 * Run: npx tsx scripts/setup-stripe-subscriptions.ts
 *
 * Copy the printed env vars into .env
 *
 * Decoy ladder: monthly (anchor) / exam-prep 3-month (target) / annual (best $/mo).
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import Stripe from "stripe";

function loadEnvFile() {
  for (const filename of [".env.local", ".env"]) {
    try {
      const envPath = resolve(process.cwd(), filename);
      for (const line of readFileSync(envPath, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (key && process.env[key] === undefined) process.env[key] = value;
      }
    } catch {
      // file optional
    }
  }
}

loadEnvFile();

const PLANS = [
  {
    key: "MONTHLY",
    cents: 5999,
    interval: "month" as const,
    intervalCount: 1,
  },
  {
    key: "QUARTERLY",
    cents: 9999,
    interval: "month" as const,
    intervalCount: 3,
  },
  {
    key: "ANNUAL",
    cents: 19999,
    interval: "year" as const,
    intervalCount: 1,
  },
];

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error(
      "Set STRIPE_SECRET_KEY in .env before running this script.",
    );
  }

  const stripe = new Stripe(secretKey);

  const product = process.env.STRIPE_PRODUCT_ID
    ? await stripe.products.retrieve(process.env.STRIPE_PRODUCT_ID)
    : await stripe.products.create({
        name: "RedSeal AI Prep",
        description:
          "All 56 Red Seal trades — unlimited quizzes and mock exams",
        metadata: { app: "redsealguide" },
      });

  console.log(`Product: ${product.id}\n`);

  for (const plan of PLANS) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: "cad",
      unit_amount: plan.cents,
      recurring: {
        interval: plan.interval,
        interval_count: plan.intervalCount,
      },
      lookup_key: `redseal_${plan.key.toLowerCase()}_v3`,
      metadata: { plan: plan.key.toLowerCase() },
    });

    console.log(`# ${plan.key}`);
    console.log(`STRIPE_${plan.key}_PRICE_ID=${price.id}`);
    console.log("");
  }

  console.log(`STRIPE_PRODUCT_ID=${product.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
