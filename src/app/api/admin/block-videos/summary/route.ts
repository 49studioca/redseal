import { NextResponse } from "next/server";
import { TRADES, getBlocksForTrade } from "@/data/seed";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { resolveBlockId, resolveTradeId } from "@/lib/content/persist-generated";

export async function GET(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ summaries: [] });
  }

  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("trade_id");
  const trade = TRADES.find((t) => t.id === tradeId);
  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  try {
    const supabase = await createServiceClient();
    const dbTradeId = await resolveTradeId(supabase, trade.code);
    const blocks = getBlocksForTrade(trade.id);

    const blockIdMap = new Map<string, string>();
    for (const block of blocks) {
      try {
        const dbBlockId = await resolveBlockId(supabase, dbTradeId, block.code);
        blockIdMap.set(block.id, dbBlockId);
      } catch {
        // block not seeded yet
      }
    }

    const dbBlockIds = [...blockIdMap.values()];
    if (!dbBlockIds.length) {
      return NextResponse.json({ summaries: [] });
    }

    const { data: videos } = await supabase
      .from("block_learning_videos")
      .select("id, block_id")
      .in("block_id", dbBlockIds);

    const videoIds = (videos ?? []).map((v) => v.id as string);
    const { data: questions } = videoIds.length
      ? await supabase
          .from("block_video_questions")
          .select("id, video_id")
          .in("video_id", videoIds)
      : { data: [] };

    const questionsByVideo = new Map<string, number>();
    for (const q of questions ?? []) {
      const vid = q.video_id as string;
      questionsByVideo.set(vid, (questionsByVideo.get(vid) ?? 0) + 1);
    }

    const videosByBlock = new Map<string, string[]>();
    for (const v of videos ?? []) {
      const bid = v.block_id as string;
      const list = videosByBlock.get(bid) ?? [];
      list.push(v.id as string);
      videosByBlock.set(bid, list);
    }

    const reverseBlockMap = new Map(
      [...blockIdMap.entries()].map(([seedId, dbId]) => [dbId, seedId]),
    );

    const summaries = [...videosByBlock.entries()].map(([dbBlockId, vids]) => {
      const seedBlockId = reverseBlockMap.get(dbBlockId) ?? dbBlockId;
      const questionCount = vids.reduce(
        (sum, vid) => sum + (questionsByVideo.get(vid) ?? 0),
        0,
      );
      return {
        block_id: seedBlockId,
        video_count: vids.length,
        question_count: questionCount,
      };
    });

    return NextResponse.json({ summaries });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load summary",
      },
      { status: 500 },
    );
  }
}
