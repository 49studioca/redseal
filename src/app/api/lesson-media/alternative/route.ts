import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { resolveLessonMediaContext } from "@/lib/admin/lesson-media";
import { findLessonImageFromContent } from "@/lib/ai/find-lesson-image";
import { findLessonVideoFromContent } from "@/lib/ai/find-lesson-video";
import { getBlockMedia } from "@/data/block-media";

async function loadLesson(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const, status: 401 as const };

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      `
      slug,
      title,
      summary,
      content_blocks,
      chapter_task_code,
      trade:trades ( code, name ),
      block:rsos_blocks ( code )
    `,
    )
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    return { error: "Lesson not found" as const, status: 404 as const };
  }

  return { lesson, user };
}

async function findAlternative(input: {
  lesson: {
    slug: string;
    title: string;
    summary: string | null;
    content_blocks: unknown;
    chapter_task_code: string | null;
    trade?: { code: string; name?: string } | { code: string; name?: string }[] | null;
    block?: { code: string } | { code: string }[] | null;
  };
  mediaType: "image" | "video";
  mediaSrc: string;
}) {
  const trade = Array.isArray(input.lesson.trade)
    ? input.lesson.trade[0]
    : input.lesson.trade;
  const block = Array.isArray(input.lesson.block)
    ? input.lesson.block[0]
    : input.lesson.block;

  const { tradeCode, blockCode, taskCode, mediaKey } = resolveLessonMediaContext({
    slug: input.lesson.slug,
    chapter_task_code: input.lesson.chapter_task_code,
    trade: trade ?? undefined,
    block: block ?? undefined,
  });

  const contentBlocks = (input.lesson.content_blocks as {
    type?: string;
    content?: string;
    meta?: Record<string, unknown>;
  }[]) ?? [];
  const curated = getBlockMedia(tradeCode, blockCode, taskCode);

  if (input.mediaType === "image") {
    const alternative = await findLessonImageFromContent({
      title: input.lesson.title,
      summary: input.lesson.summary ?? undefined,
      contentBlocks,
      tradeName: trade?.name,
      currentSrc: input.mediaSrc,
      currentAlt: curated?.images?.[0]?.alt,
      mediaKey,
      host: false,
    });
    return { alternative, ai_search: true };
  }

  const alternative = await findLessonVideoFromContent({
    title: input.lesson.title,
    summary: input.lesson.summary ?? undefined,
    contentBlocks,
    tradeName: trade?.name,
    currentYoutubeId: input.mediaSrc,
    currentTitle: curated?.video?.title,
  });
  return { alternative, ai_search: true };
}

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
    return NextResponse.json({ alternative: null });
  }

  const loaded = await loadLesson(lessonId);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  try {
    const result = await findAlternative({
      lesson: loaded.lesson,
      mediaType,
      mediaSrc,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : `Could not find an alternative ${mediaType}`,
      },
      { status: 404 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const lessonId = String(body.lesson_id ?? "").trim();
  const mediaType = String(body.media_type ?? "").trim();
  const mediaSrc = String(body.media_src ?? "").trim();

  if (!lessonId || !mediaType || !mediaSrc) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (mediaType !== "image" && mediaType !== "video") {
    return NextResponse.json({ error: "invalid media_type" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ alternative: null });
  }

  const loaded = await loadLesson(lessonId);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  try {
    const result = await findAlternative({
      lesson: loaded.lesson,
      mediaType,
      mediaSrc,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : `Could not find an alternative ${mediaType}`,
      },
      { status: 404 },
    );
  }
}
