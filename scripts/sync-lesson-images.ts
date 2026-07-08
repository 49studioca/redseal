/**
 * Download curated lesson images and upload to Supabase Storage (`images` bucket).
 * Usage: npm run db:sync-lesson-images
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadWithRetry(sourceUrl: string, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(sourceUrl);
    if (response.ok) return response;
    if (response.status === 429 && i < attempts - 1) {
      await sleep(1500 * (i + 1));
      continue;
    }
    throw new Error(`HTTP ${response.status}`);
  }
  throw new Error("download failed");
}

async function main() {
  if (!url || !key) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  let uploaded = 0;

  for (const [assetKey, asset] of Object.entries(LESSON_IMAGE_ASSETS)) {
    let response: Response;
    try {
      response = await downloadWithRetry(asset.sourceUrl);
    } catch (error) {
      console.error(
        `Failed to download ${assetKey}: ${(error as Error).message}`,
      );
      process.exitCode = 1;
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType =
      response.headers.get("content-type") ?? "image/jpeg";

    const { error } = await supabase.storage
      .from("images")
      .upload(asset.storagePath, buffer, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) {
      console.error(`Upload failed for ${assetKey}:`, error.message);
      process.exitCode = 1;
      continue;
    }

    uploaded += 1;
    const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/images/${asset.storagePath}`;
    console.log(`✓ ${assetKey} → ${publicUrl}`);
    await sleep(400);
  }

  console.log(`\nUploaded ${uploaded}/${Object.keys(LESSON_IMAGE_ASSETS).length} images.`);
}

void main();
