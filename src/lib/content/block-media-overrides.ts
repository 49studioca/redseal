import type { BlockMediaOverrideRow } from "@/lib/admin/lesson-media";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function fetchBlockMediaOverrides(
  mediaKey: string,
): Promise<BlockMediaOverrideRow[]> {
  if (!usesSupabaseData()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("block_media_overrides")
    .select(
      "media_key, media_type, video_youtube_id, video_title, image_src, image_alt, image_caption",
    )
    .eq("media_key", mediaKey);

  if (error || !data) return [];
  return data as BlockMediaOverrideRow[];
}

export async function upsertBlockMediaOverride(
  mediaKey: string,
  mediaType: "image" | "video",
  payload: {
    video_youtube_id?: string;
    video_title?: string;
    image_src?: string;
    image_alt?: string;
    image_caption?: string;
  },
  userId: string,
) {
  const supabase = await createClient();
  const row =
    mediaType === "video"
      ? {
          media_key: mediaKey,
          media_type: "video" as const,
          video_youtube_id: payload.video_youtube_id ?? null,
          video_title: payload.video_title ?? null,
          image_src: null as string | null,
          image_alt: null as string | null,
          image_caption: null as string | null,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        }
      : {
          media_key: mediaKey,
          media_type: "image" as const,
          video_youtube_id: null as string | null,
          video_title: null as string | null,
          image_src: payload.image_src ?? null,
          image_alt: payload.image_alt ?? null,
          image_caption: payload.image_caption ?? null,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        };

  const { error } = await supabase
    .from("block_media_overrides")
    .upsert(row as Record<string, unknown>, {
      onConflict: "media_key,media_type",
    });

  if (error) throw new Error(error.message);
}
