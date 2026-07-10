"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  buildMediaSwap,
  resolveLessonMediaContext,
} from "@/lib/admin/lesson-media";
import { upsertBlockMediaOverride } from "@/lib/content/block-media-overrides";
import { findLessonImageFromContent } from "@/lib/ai/find-lesson-image";
import { findLessonVideoFromContent } from "@/lib/ai/find-lesson-video";
import { getBlockMedia } from "@/data/block-media";

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
    return { userId: "demo-admin" as const, supabase: null };
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
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
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

  let imageSrc = input.imageSrc;
  let imageAlt = input.imageAlt;
  let imageCaption = input.imageCaption;
  let youtubeId = input.youtubeId
    ? parseYoutubeId(input.youtubeId)
    : undefined;
  let videoTitle = input.videoTitle;
  let mode = input.mode;

  if (input.mode === "auto") {
    if (!usesSupabaseData() || !supabase) {
      throw new Error("AI media search requires Supabase to be configured");
    }

    const { data: lessonRow, error: lessonError } = await supabase
      .from("lessons")
      .select(
        `
        title,
        summary,
        content_blocks,
        trade:trades ( name )
      `,
      )
      .eq("id", input.lessonId)
      .single();

    if (lessonError || !lessonRow) {
      throw new Error("Lesson not found");
    }

    const trade = Array.isArray(lessonRow.trade)
      ? lessonRow.trade[0]
      : lessonRow.trade;
    const curated = getBlockMedia(tradeCode, blockCode, taskCode);
    const contentBlocks = (lessonRow.content_blocks as {
      type?: string;
      content?: string;
      meta?: Record<string, unknown>;
    }[]) ?? [];

    if (input.mediaType === "image") {
      const found = await findLessonImageFromContent({
        title: lessonRow.title,
        summary: lessonRow.summary ?? undefined,
        contentBlocks,
        tradeName: trade?.name,
        currentSrc: input.mediaSrc,
        currentAlt: curated?.images?.[0]?.alt,
        mediaKey,
      });
      imageSrc = found.src;
      imageAlt = found.alt;
      imageCaption = found.caption;
    } else {
      const found = await findLessonVideoFromContent({
        title: lessonRow.title,
        summary: lessonRow.summary ?? undefined,
        contentBlocks,
        tradeName: trade?.name,
        currentYoutubeId: input.mediaSrc,
        currentTitle: curated?.video?.title,
      });
      youtubeId = found.youtubeId;
      videoTitle = found.title;
    }
    mode = "manual";
  }

  const swap = buildMediaSwap({
    tradeCode,
    blockCode,
    taskCode,
    mediaKey,
    mediaType: input.mediaType,
    currentSrc: input.mediaSrc,
    mode,
    imageKey: input.imageKey,
    imageSrc,
    imageAlt,
    imageCaption,
    youtubeId,
    videoTitle,
  });

  if ("error" in swap) {
    throw new Error(swap.error);
  }

  if (!usesSupabaseData() || !supabase) {
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

  await supabase
    .from("lesson_media_reports")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      admin_notes: `Media regenerated inline (${input.mode}${
        input.mode === "auto" ? ", AI search" : ""
      })`,
    })
    .eq("lesson_id", input.lessonId)
    .eq("media_type", input.mediaType)
    .eq("media_src", input.mediaSrc)
    .eq("status", "open");

  revalidatePath(`/dashboard/learn/${input.lessonSlug}`);
  return { ok: true };
}
