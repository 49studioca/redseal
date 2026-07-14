import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "images";
const MAX_UPLOAD_BYTES = 5_000_000;
const AVATAR_SIZE = 256;

function supabasePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

export async function uploadUserAvatar(input: {
  userId: string;
  bytes: Buffer;
  contentType: string;
}): Promise<string> {
  if (input.bytes.byteLength < 100) {
    throw new Error("Image is too small");
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  const mime = input.contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF image");
  }

  const fitted = await sharp(input.bytes)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const storagePath = `avatars/${input.userId}/avatar.jpg`;
  const supabase = await createServiceClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fitted, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Bust CDN/browser cache after replace
  return `${supabasePublicUrl(storagePath)}?v=${Date.now().toString(36)}`;
}
