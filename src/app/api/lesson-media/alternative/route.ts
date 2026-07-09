import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  imageFromAssetKey,
  listImageAssetKeys,
  listVideoAlternatives,
  pickAlternativeImage,
  pickAlternativeVideo,
  resolveLessonMediaContext,
} from "@/lib/admin/lesson-media";
import { getBlockMedia } from "@/data/block-media";
import type { LessonImageKey } from "@/data/lesson-image-assets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lesson_id")?.trim();
  const mediaType = searchParams.get("media_type")?.trim();
  const mediaSrc = searchParams.get("media_src")?.trim();

  if (!lessonId || !mediaType || !mediaSrc) {
    return NextResponse.json(
      { error: "lesson_id, media_type, and media_src are required" },
      { status: 400 },
    );
  }

  if (mediaType !== "image" && mediaType !== "video") {
    return NextResponse.json({ error: "invalid media_type" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    if (mediaType === "image") {
      const key = listImageAssetKeys()[0];
      const image = imageFromAssetKey(key);
      return NextResponse.json({
        alternative: image,
        image_keys: listImageAssetKeys(),
      });
    }
    return NextResponse.json({ alternative: null, videos: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      slug,
      chapter_task_code,
      trade:trades ( code ),
      block:rsos_blocks ( code )
    `,
    )
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const trade = Array.isArray(lesson.trade) ? lesson.trade[0] : lesson.trade;
  const block = Array.isArray(lesson.block) ? lesson.block[0] : lesson.block;

  const { tradeCode, blockCode, taskCode } = resolveLessonMediaContext({
    slug: lesson.slug,
    chapter_task_code: lesson.chapter_task_code,
    trade: trade ?? undefined,
    block: block ?? undefined,
  });

  const curated = getBlockMedia(tradeCode, blockCode, taskCode);
  const existingCaption = curated?.images?.[0]?.caption;

  if (mediaType === "image") {
    const alternative = pickAlternativeImage(tradeCode, mediaSrc, existingCaption);
    return NextResponse.json({
      alternative,
      image_keys: listImageAssetKeys().filter((key) => {
        const image = imageFromAssetKey(key, existingCaption);
        return image.src !== mediaSrc;
      }),
    });
  }

  const videos = listVideoAlternatives(tradeCode, mediaSrc);
  const alternative = pickAlternativeVideo(tradeCode, mediaSrc);

  return NextResponse.json({ alternative, videos });
}

export async function POST(request: Request) {
  const body = await request.json();
  const lessonId = String(body.lesson_id ?? "").trim();
  const mediaType = String(body.media_type ?? "").trim();
  const mediaSrc = String(body.media_src ?? "").trim();
  const imageKey = body.image_key ? String(body.image_key).trim() : undefined;
  const youtubeId = body.youtube_id ? String(body.youtube_id).trim() : undefined;

  if (!lessonId || !mediaType || !mediaSrc) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ alternative: null });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      slug,
      chapter_task_code,
      trade:trades ( code ),
      block:rsos_blocks ( code )
    `,
    )
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const trade = Array.isArray(lesson.trade) ? lesson.trade[0] : lesson.trade;
  const block = Array.isArray(lesson.block) ? lesson.block[0] : lesson.block;

  const { tradeCode, blockCode, taskCode } = resolveLessonMediaContext({
    slug: lesson.slug,
    chapter_task_code: lesson.chapter_task_code,
    trade: trade ?? undefined,
    block: block ?? undefined,
  });

  const curated = getBlockMedia(tradeCode, blockCode, taskCode);
  const existingCaption = curated?.images?.[0]?.caption;

  if (mediaType === "image") {
    const alternative =
      imageKey && listImageAssetKeys().includes(imageKey as LessonImageKey)
        ? imageFromAssetKey(imageKey as LessonImageKey, existingCaption)
        : pickAlternativeImage(tradeCode, mediaSrc, existingCaption);

    if (!alternative || alternative.src === mediaSrc) {
      return NextResponse.json(
        { error: "No other image available" },
        { status: 404 },
      );
    }

    return NextResponse.json({ alternative });
  }

  if (mediaType === "video") {
    const videos = listVideoAlternatives(tradeCode, mediaSrc);
    const currentIndex = youtubeId
      ? videos.findIndex((video) => video.youtubeId === youtubeId)
      : -1;
    const next =
      currentIndex >= 0
        ? videos[(currentIndex + 1) % videos.length]
        : pickAlternativeVideo(tradeCode, mediaSrc);

    if (!next) {
      return NextResponse.json(
        { error: "No other video available" },
        { status: 404 },
      );
    }

    return NextResponse.json({ alternative: next });
  }

  return NextResponse.json({ error: "invalid media_type" }, { status: 400 });
}
