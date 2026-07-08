import {
  LESSON_IMAGE_ASSETS,
  type LessonImageKey,
} from "@/data/lesson-image-assets";

const STORAGE_BUCKET = "images";

const sourceToStoragePath = new Map<string, string>(
  Object.values(LESSON_IMAGE_ASSETS).map((asset) => [
    asset.sourceUrl,
    asset.storagePath,
  ]),
);

/** Also map Wikimedia thumb URLs to the same storage object. */
for (const asset of Object.values(LESSON_IMAGE_ASSETS)) {
  const direct = asset.sourceUrl.replace(
    /\/thumb\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)\/\d+px-[^/]+$/i,
    "/$1/$2",
  );
  if (direct !== asset.sourceUrl) {
    sourceToStoragePath.set(direct, asset.storagePath);
  }
}

function supabasePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

export function lessonImageSrc(key: LessonImageKey): string {
  const asset = LESSON_IMAGE_ASSETS[key];
  return supabasePublicUrl(asset.storagePath) ?? asset.sourceUrl;
}

/** Rewrite legacy Wikimedia URLs (and DB-stored copies) to Supabase Storage. */
export function resolveLessonImageSrc(src: string): string {
  const trimmed = src.trim();
  const storagePath = sourceToStoragePath.get(trimmed);
  if (!storagePath) return trimmed;
  return supabasePublicUrl(storagePath) ?? trimmed;
}

export function isHostedLessonImage(src: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;
  return src.startsWith(`${base}/storage/v1/object/public/${STORAGE_BUCKET}/`);
}
