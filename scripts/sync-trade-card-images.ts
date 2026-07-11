/**
 * Find trade card images via Jina Search and upload to Supabase Storage.
 * Usage: npm run db:sync-trade-card-images
 *
 * Card image area on /trades: 16:10 aspect ratio — cropped to 800×500 px JPEG (cover fill).
 * Images are searched for modern color Red Seal trade work in Canada (no B&W or vintage).
 *
 * Options:
 *   --force       Re-fetch even if already in storage
 *   --code=442A   Process a single trade by Red Seal code (implies --force)
 *   --slug=X      Process a single trade slug
 *
 * Examples:
 *   npm run db:sync-trade-card-images -- --code=442A
 *   npm run db:sync-trade-card-images -- 442A
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
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
    // .env optional
  }
}

loadEnvFile();

import { createClient } from "@supabase/supabase-js";
import { TRADES } from "../src/data/seed";
import type { Trade } from "../src/types";
import {
  findAndHostTradeCardImage,
} from "../src/lib/ai/find-trade-card-image";
import { hasJinaApiKey } from "../src/lib/ai/jina-search";
import { TRADE_CARD_IMAGE_SIZE_LABEL } from "../src/lib/storage/trade-card-image-spec";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function readArg(prefix: string): string | undefined {
  const match = process.argv.find((a) => a.startsWith(`${prefix}=`));
  return match?.slice(prefix.length + 1);
}

const forceFlag = process.argv.includes("--force");
const onlySlug = readArg("--slug");
const onlyCode = readArg("--code") ?? readArg("--trade");
const positionalTarget = process.argv
  .slice(2)
  .find((a) => !a.startsWith("--"));

const DELAY_BETWEEN_MS = 1500;

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

function findTradeByCode(code: string): Trade | undefined {
  const normalized = normalizeCode(code);
  return TRADES.find((t) => normalizeCode(t.code) === normalized);
}

function resolveTrades(): { trades: Trade[]; force: boolean } {
  const codeInput = onlyCode ?? positionalTarget;
  if (codeInput) {
    const byCode = findTradeByCode(codeInput);
    if (byCode) {
      return { trades: [byCode], force: true };
    }
    if (onlyCode) {
      console.error(`No trade found for code "${onlyCode}"`);
      console.error("Example: npm run db:sync-trade-card-images -- --code=442A");
      process.exit(1);
    }
  }

  if (onlySlug) {
    const trades = TRADES.filter((t) => t.slug === onlySlug);
    if (!trades.length) {
      console.error(`No trade found for slug "${onlySlug}"`);
      process.exit(1);
    }
    return { trades, force: forceFlag };
  }

  if (positionalTarget) {
    const bySlug = TRADES.filter((t) => t.slug === positionalTarget);
    if (bySlug.length) {
      return { trades: bySlug, force: forceFlag };
    }
    console.error(`No trade found for "${positionalTarget}" (not a code or slug)`);
    process.exit(1);
  }

  return { trades: TRADES, force: forceFlag };
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function storageObjectExists(
  supabase: ReturnType<typeof createClient>,
  storagePath: string,
): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from("images")
    .download(storagePath);
  return !error && data !== null;
}

type TradeCardAsset = {
  sourceUrl: string;
  storagePath: string;
  alt: string;
};

function writeTradeCardImagesFile(assets: Record<string, TradeCardAsset>) {
  const sorted = Object.fromEntries(
    Object.entries(assets).sort(([a], [b]) => a.localeCompare(b)),
  );

  const body = `/** Trade card hero images — synced to Supabase Storage via npm run db:sync-trade-card-images */
export const TRADE_CARD_IMAGES: Record<
  string,
  { sourceUrl: string; storagePath: string; alt: string }
> = ${JSON.stringify(sorted, null, 2)};

export type TradeCardImageSlug = keyof typeof TRADE_CARD_IMAGES;
`;

  writeFileSync(resolve(process.cwd(), "src/data/trade-card-images.ts"), body, "utf8");
}

async function main() {
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }
  if (!hasJinaApiKey()) {
    console.warn("JINA_API_KEY not set — falling back to Wikimedia Commons search.\n");
  }

  const supabase = createClient(url, key);
  const { trades, force } = resolveTrades();

  const assets: Record<string, TradeCardAsset> = {};
  try {
    const existing = readFileSync(
      resolve(process.cwd(), "src/data/trade-card-images.ts"),
      "utf8",
    );
    const match = existing.match(
      /TRADE_CARD_IMAGES[^=]*=\s*(\{[\s\S]*?\});/,
    );
    if (match?.[1]) {
      Object.assign(assets, JSON.parse(match[1]) as Record<string, TradeCardAsset>);
    }
  } catch {
    // start fresh
  }

  let uploaded = 0;
  let skipped = 0;
  const failed: string[] = [];

  console.log(
    `Syncing trade card images for ${trades.length} trade(s) (${force ? "force" : "skip existing"})…`,
  );
  console.log(`Export size: ${TRADE_CARD_IMAGE_SIZE_LABEL} px (16:10 aspect)\n`);

  for (const trade of trades) {
    const storagePath = `trade-cards/${trade.slug}.jpg`;

    if (!force && assets[trade.slug]) {
      const exists = await storageObjectExists(supabase, storagePath);
      if (exists) {
        skipped += 1;
        console.log(`○ ${trade.code} · ${trade.slug} (already synced)`);
        continue;
      }
    }

    process.stdout.write(`… ${trade.code} · ${trade.name} (${trade.slug})`);

    try {
      const hosted = await findAndHostTradeCardImage(trade, { supabase });
      if (!hosted) {
        failed.push(trade.slug);
        console.log(" — no image found");
        await sleep(DELAY_BETWEEN_MS);
        continue;
      }

      assets[trade.slug] = {
        sourceUrl: hosted.sourceUrl,
        storagePath,
        alt: hosted.alt,
      };
      uploaded += 1;
      console.log(` ✓ ${hosted.src} (${TRADE_CARD_IMAGE_SIZE_LABEL})`);
    } catch (error) {
      failed.push(trade.slug);
      console.log(` ✗ ${(error as Error).message}`);
    }

    writeTradeCardImagesFile(assets);
    await sleep(DELAY_BETWEEN_MS);
  }

  writeTradeCardImagesFile(assets);

  console.log(
    `\nDone: ${uploaded} uploaded, ${skipped} skipped, ${failed.length} failed (${trades.length} processed).`,
  );
  if (failed.length) {
    console.log(`Failed: ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

void main();
