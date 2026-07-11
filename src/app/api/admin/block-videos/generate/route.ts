import { NextResponse } from "next/server";
import { TRADES, getBlockById, getChapterTasksForBlock } from "@/data/seed";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { generateAndPersistBlockVideos } from "@/lib/content/block-videos";
import { clampBlockVideoCount } from "@/lib/ai/find-block-learning-videos";
import { createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json(
      { error: "Supabase is required for video generation." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const { trade_id, block_id, video_count: videoCountInput } = body;
  const videoCount = clampBlockVideoCount(videoCountInput);

  const trade = TRADES.find((t) => t.id === trade_id);
  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  const block = block_id ? getBlockById(block_id) : undefined;
  if (!block || block.trade_id !== trade_id) {
    return NextResponse.json(
      { error: "Valid chapter (RSOS block) required" },
      { status: 400 },
    );
  }

  const chapterTasks = getChapterTasksForBlock(block.id);

  try {
    const supabase = await createServiceClient();
    const result = await generateAndPersistBlockVideos(supabase, {
      tradeCode: trade.code,
      tradeName: trade.name,
      tradeId: trade_id,
      blockCode: block.code,
      blockName: block.name,
      blockId: block.id,
      chapterTasks,
      adminUserId: auth.userId !== "demo-admin" ? auth.userId : undefined,
      videoCount,
    });

    return NextResponse.json({
      ok: true,
      trade_id: result.trade_id,
      block_id: result.block_id,
      block_code: block.code,
      block_name: block.name,
      video_count: result.video_count,
      video_count_requested: videoCount,
      question_count: result.question_count,
      videos: result.discovered,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Video generation failed",
      },
      { status: 500 },
    );
  }
}
