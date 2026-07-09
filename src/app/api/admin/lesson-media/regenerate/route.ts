import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  buildMediaSwap,
  listImageAssetKeys,
  listVideoAlternatives,
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

type LessonContext = {
  slug: string;
  chapter_task_code: string | null;
  trade?: { code: string } | null;
  block?: { code: string } | null;
};

async function loadLessonContext(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  lessonId: string,
): Promise<LessonContext | null> {
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

  if (!lesson) return null;

  const trade = Array.isArray(lesson.trade) ? lesson.trade[0] : lesson.trade;
  const block = Array.isArray(lesson.block) ? lesson.block[0] : lesson.block;

  return {
    slug: lesson.slug,
    chapter_task_code: lesson.chapter_task_code,
    trade: trade ?? null,
    block: block ?? null,
  };
}

async function applyMediaSwap(
  userId: string,
  lesson: LessonContext,
  mediaType: "image" | "video",
  mediaSrc: string,
  mode: "auto" | "manual",
  manual: {
    imageKey?: string;
    youtubeId?: string;
    videoTitle?: string;
  },
) {
  const { tradeCode, blockCode, taskCode, mediaKey } =
    resolveLessonMediaContext(lesson);

  const swap = buildMediaSwap({
    tradeCode,
    blockCode,
    taskCode,
    mediaKey,
    mediaType,
    currentSrc: mediaSrc,
    mode,
    imageKey: manual.imageKey,
    youtubeId: manual.youtubeId,
    videoTitle: manual.videoTitle,
  });

  if ("error" in swap) {
    return { error: swap.error, status: 400 as const };
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

  return { ok: true as const, mediaKey };
}

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const reportId = String(body.report_id ?? "").trim();
  const lessonId = String(body.lesson_id ?? "").trim();
  let mediaType = String(body.media_type ?? "").trim() as "image" | "video";
  let mediaSrc = String(body.media_src ?? "").trim();
  const mode = String(body.mode ?? "auto").trim() as "auto" | "manual";
  const imageKey = body.image_key
    ? String(body.image_key).trim()
    : undefined;
  const youtubeId = body.youtube_id
    ? parseYoutubeId(String(body.youtube_id))
    : undefined;
  const videoTitle = body.video_title
    ? String(body.video_title).trim()
    : undefined;

  if (!usesSupabaseData() || !auth.supabase) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = auth.supabase;
  let lesson: LessonContext | null = null;
  let resolveReportId: string | null = null;

  if (reportId) {
    const { data: report, error: reportError } = await supabase
      .from("lesson_media_reports")
      .select(
        `
        id,
        lesson_id,
        media_type,
        media_src,
        lesson:lessons (
          slug,
          chapter_task_code,
          trade:trades ( code ),
          block:rsos_blocks ( code )
        )
      `,
      )
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const reportLesson = Array.isArray(report.lesson)
      ? report.lesson[0]
      : report.lesson;
    if (!reportLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const trade = Array.isArray(reportLesson.trade)
      ? reportLesson.trade[0]
      : reportLesson.trade;
    const block = Array.isArray(reportLesson.block)
      ? reportLesson.block[0]
      : reportLesson.block;

    lesson = {
      slug: reportLesson.slug,
      chapter_task_code: reportLesson.chapter_task_code,
      trade: trade ?? null,
      block: block ?? null,
    };
    resolveReportId = report.id;
    mediaType = report.media_type as "image" | "video";
    mediaSrc = report.media_src;
  } else if (lessonId && mediaType && mediaSrc) {
    lesson = await loadLessonContext(supabase, lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
  } else {
    return NextResponse.json(
      { error: "report_id or lesson_id + media_type + media_src required" },
      { status: 400 },
    );
  }

  const result = await applyMediaSwap(
    auth.userId,
    lesson,
    mediaType,
    mediaSrc,
    mode,
    { imageKey, youtubeId, videoTitle },
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (resolveReportId) {
    const { error: resolveError } = await supabase
      .from("lesson_media_reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        admin_notes: `Media regenerated (${mode})`,
      })
      .eq("id", resolveReportId);

    if (resolveError) {
      return NextResponse.json({ error: resolveError.message }, { status: 500 });
    }
  } else {
    await supabase
      .from("lesson_media_reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        admin_notes: `Media regenerated inline (${mode})`,
      })
      .eq("lesson_id", lessonId)
      .eq("media_type", mediaType)
      .eq("media_src", mediaSrc)
      .eq("status", "open");
  }

  return NextResponse.json({ ok: true, media_key: result.mediaKey });
}

export async function GET(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("report_id");
  const lessonId = searchParams.get("lesson_id");
  const mediaType = searchParams.get("media_type");
  const mediaSrc = searchParams.get("media_src");
  const tradeCodeParam = searchParams.get("trade_code");

  if (!usesSupabaseData() || !auth.supabase) {
    return NextResponse.json({
      image_keys: listImageAssetKeys(),
      videos: [],
    });
  }

  const supabase = auth.supabase;
  let tradeCode = tradeCodeParam ?? "";

  if (reportId) {
    const { data: report } = await supabase
      .from("lesson_media_reports")
      .select(
        `
        media_src,
        media_type,
        lesson:lessons (
          slug,
          chapter_task_code,
          trade:trades ( code )
        )
      `,
      )
      .eq("id", reportId)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const lesson = Array.isArray(report.lesson)
      ? report.lesson[0]
      : report.lesson;
    const trade = lesson
      ? Array.isArray(lesson.trade)
        ? lesson.trade[0]
        : lesson.trade
      : null;
    tradeCode = trade?.code ?? "";

    if (report.media_type === "image") {
      return NextResponse.json({ image_keys: listImageAssetKeys() });
    }

    return NextResponse.json({
      videos: listVideoAlternatives(tradeCode, report.media_src),
    });
  }

  if (lessonId && mediaType && mediaSrc) {
    if (!tradeCode) {
      const lesson = await loadLessonContext(supabase, lessonId);
      tradeCode = lesson?.trade?.code ?? "";
    }

    if (mediaType === "image") {
      return NextResponse.json({ image_keys: listImageAssetKeys() });
    }

    return NextResponse.json({
      videos: listVideoAlternatives(tradeCode, mediaSrc),
    });
  }

  return NextResponse.json(
    { error: "report_id or lesson_id + media_type + media_src required" },
    { status: 400 },
  );
}
