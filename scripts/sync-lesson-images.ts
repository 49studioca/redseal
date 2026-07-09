/**
 * Download curated lesson images and upload to Supabase Storage (`images` bucket).
 * Usage: npm run db:sync-lesson-images
 * Options: --force (re-download even if already in storage)
 *
 * Wikimedia requires a descriptive User-Agent — set LESSON_IMAGE_SYNC_USER_AGENT in .env
 * or we use a default project contact string.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { LESSON_IMAGE_ASSETS } from "../src/data/lesson-image-assets";

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const force = process.argv.includes("--force");

const WIKIMEDIA_USER_AGENT =
  process.env.LESSON_IMAGE_SYNC_USER_AGENT ??
  "RedSealGuide/1.0 (lesson image sync; contact: admin@redsealguide.ca)";

/** Wikimedia rate-limits aggressively — wait between every download. */
const DELAY_BETWEEN_MS = 2500;

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function retryAfterMs(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number.parseInt(header, 10);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

async function downloadWithRetry(sourceUrl: string, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": WIKIMEDIA_USER_AGENT,
        Accept: "image/*",
      },
    });

    if (response.ok) return response;

    if (response.status === 429 && i < attempts - 1) {
      const retryAfter = retryAfterMs(response) ?? 5000 * 2 ** i;
      const waitMs = Math.min(retryAfter, 120_000);
      console.warn(
        `  Rate limited — waiting ${Math.round(waitMs / 1000)}s before retry ${i + 2}/${attempts}…`,
      );
      await sleep(waitMs);
      continue;
    }

    throw new Error(`HTTP ${response.status}`);
  }

  throw new Error("download failed");
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

async function main() {
  if (!url || !key) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const entries = Object.entries(LESSON_IMAGE_ASSETS);
  let uploaded = 0;
  let skipped = 0;
  const failed: string[] = [];

  console.log(`Syncing ${entries.length} lesson images (${force ? "force" : "skip existing"})…`);
  console.log(`User-Agent: ${WIKIMEDIA_USER_AGENT}\n`);

  for (const [assetKey, asset] of entries) {
    if (!force) {
      const exists = await storageObjectExists(supabase, asset.storagePath);
      if (exists) {
        skipped += 1;
        console.log(`○ ${assetKey} (already in storage)`);
        continue;
      }
    }

    let response: Response;
    try {
      response = await downloadWithRetry(asset.sourceUrl);
    } catch (error) {
      console.error(
        `Failed to download ${assetKey}: ${(error as Error).message}`,
      );
      failed.push(assetKey);
      process.exitCode = 1;
      await sleep(DELAY_BETWEEN_MS);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    const { error } = await supabase.storage
      .from("images")
      .upload(asset.storagePath, buffer, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) {
      console.error(`Upload failed for ${assetKey}:`, error.message);
      failed.push(assetKey);
      process.exitCode = 1;
      await sleep(DELAY_BETWEEN_MS);
      continue;
    }

    uploaded += 1;
    const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/images/${asset.storagePath}`;
    console.log(`✓ ${assetKey} → ${publicUrl}`);
    await sleep(DELAY_BETWEEN_MS);
  }

  console.log(
    `\nDone: ${uploaded} uploaded, ${skipped} skipped, ${failed.length} failed (${entries.length} total).`,
  );

  if (failed.length > 0) {
    console.log(`Failed assets: ${failed.join(", ")}`);
    console.log("Re-run later (existing uploads are skipped): npm run db:sync-lesson-images");
  }
}

void main();
