import { createServiceClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "images";

const WIKIMEDIA_USER_AGENT =
  process.env.LESSON_IMAGE_SYNC_USER_AGENT ??
  "RedSealGuide/1.0 (lesson image search; contact: admin@redsealguide.ca)";

function supabasePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

function contentTypeToExt(contentType: string): string {
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function uploadLessonImageFromUrl(input: {
  sourceUrl: string;
  storagePath: string;
}): Promise<string> {
  const response = await fetch(input.sourceUrl, {
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

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 1_000) {
    throw new Error("Downloaded image is too small");
  }
  if (bytes.byteLength > 10_000_000) {
    throw new Error("Downloaded image exceeds 10MB limit");
  }

  const ext = contentTypeToExt(contentType);
  const storagePath = input.storagePath.replace(/\.[a-z0-9]+$/i, `.${ext}`);

  const supabase = await createServiceClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return supabasePublicUrl(storagePath);
}
