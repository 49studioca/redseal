import { TRADE_CARD_IMAGES } from "@/data/trade-card-images";

const STORAGE_BUCKET = "images";

function supabasePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

export function tradeCardImageSrc(slug: string): string | null {
  const asset = TRADE_CARD_IMAGES[slug];
  if (!asset) return null;
  return supabasePublicUrl(asset.storagePath) ?? asset.sourceUrl;
}

export function tradeCardImageAlt(slug: string): string | null {
  return TRADE_CARD_IMAGES[slug]?.alt ?? null;
}
