import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import {
  TRADE_CARD_IMAGE_HEIGHT,
  TRADE_CARD_IMAGE_WIDTH,
} from "@/lib/storage/trade-card-image-spec";

const STORAGE_BUCKET = "images";

const WIKIMEDIA_USER_AGENT =
  process.env.LESSON_IMAGE_SYNC_USER_AGENT ??
  "RedSealGuide/1.0 (trade card image upload; contact: admin@redsealguide.ca)";

const REJECTED_SOURCE_URL_RE =
  /macleans\.|\/_next\/image|news|article|blog|shortage of|high paying jobs/i;

export function tradeCardPublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/** Unwrap CDN URLs and reject magazine/news proxy links. */
export function normalizeTradeCardSourceUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.includes("/_next/image")) {
      const embedded = parsed.searchParams.get("url");
      if (embedded) {
        const decoded = decodeURIComponent(embedded);
        if (REJECTED_SOURCE_URL_RE.test(decoded)) return null;
        return decoded;
      }
      return null;
    }
    if (REJECTED_SOURCE_URL_RE.test(`${parsed.hostname}${parsed.pathname}`)) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

/** Crop source image to exactly fill the trade card area (16:10, cover). */
export async function assertColorTradeCardImage(bytes: Uint8Array): Promise<void> {
  const meta = await sharp(bytes).metadata();
  if (meta.channels === 1 || meta.space === "b-w") {
    throw new Error("Black-and-white image rejected");
  }

  const stats = await sharp(bytes)
    .resize(240, 150, { fit: "inside", withoutEnlargement: true })
    .stats();

  if (stats.channels.length < 3) {
    throw new Error("Black-and-white image rejected");
  }

  const [r, g, b] = stats.channels;
  const meanSpread = Math.max(
    Math.abs(r.mean - g.mean),
    Math.abs(g.mean - b.mean),
    Math.abs(r.mean - b.mean),
  );
  const stdevSpread = Math.max(
    Math.abs(r.stdev - g.stdev),
    Math.abs(g.stdev - b.stdev),
    Math.abs(r.stdev - b.stdev),
  );

  // Effectively grayscale RGB — very little color separation between channels.
  if (meanSpread < 5 && stdevSpread < 4) {
    throw new Error("Black-and-white or sepia-style image rejected");
  }
}

export async function fitTradeCardImage(bytes: Uint8Array): Promise<Buffer> {
  await assertColorTradeCardImage(bytes);
  return sharp(bytes)
    .rotate()
    .resize(TRADE_CARD_IMAGE_WIDTH, TRADE_CARD_IMAGE_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

export async function downloadAndFitTradeCardImage(sourceUrl: string): Promise<Buffer> {
  const normalized = normalizeTradeCardSourceUrl(sourceUrl);
  if (!normalized) {
    throw new Error("Rejected trade card image source URL");
  }

  const response = await fetch(normalized, {
    headers: {
      "User-Agent": WIKIMEDIA_USER_AGENT,
      Accept: "image/*",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status})`);
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim() ||
    "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Downloaded file is not an image");
  }

  const raw = new Uint8Array(await response.arrayBuffer());
  if (raw.byteLength < 1_000) {
    throw new Error("Downloaded image is too small");
  }
  if (raw.byteLength > 12_000_000) {
    throw new Error("Downloaded image exceeds 12MB limit");
  }

  return fitTradeCardImage(raw);
}

export async function uploadTradeCardImageBuffer(
  supabase: SupabaseClient,
  storagePath: string,
  bytes: Buffer,
): Promise<string> {
  const path = storagePath.replace(/\.[a-z0-9]+$/i, ".jpg");
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return tradeCardPublicUrl(path);
}

export async function uploadTradeCardImageFromUrl(input: {
  sourceUrl: string;
  storagePath: string;
  supabase?: SupabaseClient;
}): Promise<string> {
  const fitted = await downloadAndFitTradeCardImage(input.sourceUrl);
  const supabase = input.supabase ?? (await createServiceClient());
  return uploadTradeCardImageBuffer(supabase, input.storagePath, fitted);
}
