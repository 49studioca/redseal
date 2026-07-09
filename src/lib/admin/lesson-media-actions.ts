"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  buildMediaSwap,
  resolveLessonMediaContext,
} from "@/lib/admin/lesson-media";
import { upsertBlockMediaOverride } from "@/lib/content/block-media-overrides";

function parseYoutubeId(value: string): string {
  const trimmed = value.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    return url.searchParams.get("v") ?? trimmed;
  } catch {
    return trimmed;
  }
}

async function requireAdminAction() {
  if (!usesSupabaseData()) {
    return { userId: "demo-admin" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, supabase };
}

export async function regenerateLessonMediaAction(input: {
  lessonId: string;
  lessonSlug: string;
  chapterTaskCode?: string | null;
  blockCode: string;
  tradeCode: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  mode: "auto" | "manual";
  imageKey?: string;
  youtubeId?: string;
  videoTitle?: string;
}) {
  const { userId, supabase } = await requireAdminAction();

  const lesson = {
    slug: input.lessonSlug,
    chapter_task_code: input.chapterTaskCode ?? null,
    trade: { code: input.tradeCode },
    block: { code: input.blockCode },
  };

  const { tradeCode, blockCode, taskCode, mediaKey } =
    resolveLessonMediaContext(lesson);

  const swap = buildMediaSwap({
    tradeCode,
    blockCode,
    taskCode,
    mediaKey,
    mediaType: input.mediaType,
    currentSrc: input.mediaSrc,
    mode: input.mode,
    imageKey: input.imageKey,
    youtubeId: input.youtubeId
      ? parseYoutubeId(input.youtubeId)
      : undefined,
    videoTitle: input.videoTitle,
  });

  if ("error" in swap) {
    throw new Error(swap.error);
  }

  if (!usesSupabaseData()) {
    revalidatePath(`/dashboard/learn/${input.lessonSlug}`);
    return { ok: true };
  }

  if (swap.mediaType === "image" && swap.image) {
    await upsertBlockMediaOverride(
      mediaKey,
      "image",
      {
        image_src: swap.image.src,
        image_alt: swap.image.alt,
        image_caption: swap.image.caption,
      },
      userId,
    );
  } else if (swap.mediaType === "video" && swap.video) {
    await upsertBlockMediaOverride(
      mediaKey,
      "video",
      {
        video_youtube_id: swap.video.youtubeId,
        video_title: swap.video.title,
      },
      userId,
    );
  }

  await supabase!
    .from("lesson_media_reports")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      admin_notes: `Media regenerated inline (${input.mode})`,
    })
    .eq("lesson_id", input.lessonId)
    .eq("media_type", input.mediaType)
    .eq("media_src", input.mediaSrc)
    .eq("status", "open");

  revalidatePath(`/dashboard/learn/${input.lessonSlug}`);
  return { ok: true };
}
