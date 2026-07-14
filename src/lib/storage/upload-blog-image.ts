import { createServiceClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "images";

function supabasePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

function extForContentType(contentType: string): string {
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** Upload raw image bytes (e.g. from a generation model) to the public bucket. */
export async function uploadBlogImageBytes(input: {
  bytes: Uint8Array;
  contentType: string;
  slugHint: string;
}): Promise<string> {
  if (input.bytes.byteLength < 500) {
    throw new Error("Generated image is too small");
  }
  if (input.bytes.byteLength > 10_000_000) {
    throw new Error("Generated image exceeds 10MB limit");
  }

  const ext = extForContentType(input.contentType);
  const storagePath = [
    "blog",
    (input.slugHint || "cover").replace(/[^a-z0-9-]+/gi, "-").slice(0, 60) ||
      "cover",
    `${Date.now().toString(36)}.${ext}`,
  ].join("/");

  const supabase = await createServiceClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, input.bytes, {
      contentType: input.contentType,
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return supabasePublicUrl(storagePath);
}

/** Decode a data: URL or bare base64 string into bytes + content type. */
export function decodeBase64Image(value: string): {
  bytes: Uint8Array;
  contentType: string;
} {
  const match = value.match(/^data:(image\/[a-z+]+);base64,(.*)$/i);
  const contentType = match ? match[1] : "image/png";
  const base64 = match ? match[2] : value;
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  return { bytes, contentType };
}
