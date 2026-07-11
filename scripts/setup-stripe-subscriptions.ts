/**
 * Creates one Stripe product with intro + regular prices per plan.
 * Run: npx tsx scripts/setup-stripe-subscriptions.ts
 *
 * Copy the printed env vars into .env
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
    key: "WEEKLY",
    introCents: 999,
    regularCents: 1999,
    regularInterval: "week" as const,
    regularIntervalCount: 1,
  },
  {
    key: "MONTHLY",
    introCents: 799,
    regularCents: 5999,
    regularInterval: "month" as const,
    regularIntervalCount: 1,
  },
  {
    key: "QUARTERLY",
    introCents: 599,
    regularCents: 9999,
    regularInterval: "month" as const,
    regularIntervalCount: 3,
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
    const introPrice = await stripe.prices.create({
      product: product.id,
      currency: "cad",
      unit_amount: plan.introCents,
      recurring: { interval: "week", interval_count: 1 },
      lookup_key: `redseal_${plan.key.toLowerCase()}_intro_week`,
      metadata: { plan: plan.key.toLowerCase(), billing: "intro" },
    });

    const regularPrice = await stripe.prices.create({
      product: product.id,
      currency: "cad",
      unit_amount: plan.regularCents,
      recurring: {
        interval: plan.regularInterval,
        interval_count: plan.regularIntervalCount,
      },
      lookup_key: `redseal_${plan.key.toLowerCase()}_regular`,
      metadata: { plan: plan.key.toLowerCase(), billing: "regular" },
    });

    console.log(`# ${plan.key}`);
    console.log(`STRIPE_${plan.key}_INTRO_PRICE_ID=${introPrice.id}`);
    console.log(`STRIPE_${plan.key}_PRICE_ID=${regularPrice.id}`);
    console.log("");
  }

  console.log(`STRIPE_PRODUCT_ID=${product.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
