import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { fetchBlocks } from "@/lib/data";
import {
  applyDemoBlockExamResults,
  getDemoTradeMastery,
  recordDemoBlockAnswer,
  type BlockMasteryStats,
  type TradeBlockMastery,
} from "@/lib/demo-progress";
import type { RsosBlock } from "@/types";

export const MIN_ATTEMPTS_FOR_WEAK_BLOCKS = 3;
export const WEAK_BLOCK_SCORE_THRESHOLD = 70;
export const MAX_WEAK_BLOCKS = 2;

export type WeakBlockResult = {
  block: RsosBlock;
  mastery_score: number;
  questions_attempted: number;
};

export type WeakBlocksSummary = {
  weakBlocks: WeakBlockResult[];
  hasData: boolean;
};

function toMasteryStats(
  attempted: number,
  correct: number,
): BlockMasteryStats {
  return {
    questions_attempted: attempted,
    questions_correct: correct,
    mastery_score: attempted ? (correct / attempted) * 100 : 0,
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!usesSupabaseData()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function filterMasteryToBlocks(
  blocks: RsosBlock[],
  mastery: TradeBlockMastery,
): TradeBlockMastery {
  const blockIds = new Set(blocks.map((block) => block.id));
  const filtered: TradeBlockMastery = {};

  for (const [blockId, stats] of Object.entries(mastery)) {
    if (blockIds.has(blockId)) {
      filtered[blockId] = stats;
    }
  }

  return filtered;
}

async function getSupabaseTradeMastery(
  userId: string,
): Promise<TradeBlockMastery> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("block_mastery")
    .select("block_id, mastery_score, questions_attempted, questions_correct")
    .eq("user_id", userId);

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((row) => [
      row.block_id,
      {
        mastery_score: Number(row.mastery_score),
        questions_attempted: row.questions_attempted,
        questions_correct: row.questions_correct,
      },
    ]),
  );
}

async function upsertSupabaseBlockAnswer(
  userId: string,
  blockId: string,
  isCorrect: boolean,
): Promise<BlockMasteryStats | null> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("block_mastery")
    .select("questions_attempted, questions_correct")
    .eq("user_id", userId)
    .eq("block_id", blockId)
    .maybeSingle();

  const questions_attempted = (existing?.questions_attempted ?? 0) + 1;
  const questions_correct =
    (existing?.questions_correct ?? 0) + (isCorrect ? 1 : 0);
  const mastery_score = (questions_correct / questions_attempted) * 100;

  const { error } = await supabase.from("block_mastery").upsert(
    {
      user_id: userId,
      block_id: blockId,
      questions_attempted,
      questions_correct,
      mastery_score,
    },
    { onConflict: "user_id,block_id" },
  );

  if (error) return null;
  return { questions_attempted, questions_correct, mastery_score };
}

async function applySupabaseBlockExamResults(
  userId: string,
  blockScores: Record<string, { correct: number; total: number }>,
): Promise<void> {
  const supabase = await createClient();

  for (const [blockId, { correct, total }] of Object.entries(blockScores)) {
    if (total <= 0) continue;

    const { data: existing } = await supabase
      .from("block_mastery")
      .select("questions_attempted, questions_correct")
      .eq("user_id", userId)
      .eq("block_id", blockId)
      .maybeSingle();

    const questions_attempted = (existing?.questions_attempted ?? 0) + total;
    const questions_correct = (existing?.questions_correct ?? 0) + correct;
    const mastery_score = (questions_correct / questions_attempted) * 100;

    await supabase.from("block_mastery").upsert(
      {
        user_id: userId,
        block_id: blockId,
        questions_attempted,
        questions_correct,
        mastery_score,
      },
      { onConflict: "user_id,block_id" },
    );
  }
}

export async function getTradeMasteryMap(
  tradeId: string,
): Promise<TradeBlockMastery> {
  const cookieStore = await cookies();
  const userId = await getAuthenticatedUserId();
  const blocks = await fetchBlocks(tradeId);

  if (!userId) {
    return filterMasteryToBlocks(
      blocks,
      getDemoTradeMastery(cookieStore, tradeId),
    );
  }

  const dbMastery = await getSupabaseTradeMastery(userId);
  return filterMasteryToBlocks(blocks, dbMastery);
}

export async function recordBlockAnswer(
  tradeId: string,
  blockId: string,
  isCorrect: boolean,
): Promise<BlockMasteryStats> {
  const cookieStore = await cookies();
  const userId = await getAuthenticatedUserId();

  if (userId) {
    const saved = await upsertSupabaseBlockAnswer(userId, blockId, isCorrect);
    if (saved) return saved;
  }

  return recordDemoBlockAnswer(cookieStore, tradeId, blockId, isCorrect);
}

export async function recordMockExamBlockScores(
  tradeId: string,
  blockScores: Record<string, { correct: number; total: number }>,
): Promise<void> {
  const cookieStore = await cookies();
  const userId = await getAuthenticatedUserId();

  if (userId) {
    await applySupabaseBlockExamResults(userId, blockScores);
    return;
  }

  applyDemoBlockExamResults(cookieStore, tradeId, blockScores);
}

export function computeWeakBlocks(
  blocks: RsosBlock[],
  mastery: TradeBlockMastery,
  passThreshold = WEAK_BLOCK_SCORE_THRESHOLD,
): WeakBlocksSummary {
  const scored = blocks
    .map((block) => {
      const stats = mastery[block.id];
      if (!stats || stats.questions_attempted < MIN_ATTEMPTS_FOR_WEAK_BLOCKS) {
        return null;
      }
      return {
        block,
        mastery_score: stats.mastery_score,
        questions_attempted: stats.questions_attempted,
      };
    })
    .filter((entry): entry is WeakBlockResult => entry !== null)
    .sort((a, b) => {
      if (a.mastery_score !== b.mastery_score) {
        return a.mastery_score - b.mastery_score;
      }
      return b.questions_attempted - a.questions_attempted;
    });

  if (scored.length === 0) {
    return { weakBlocks: [], hasData: false };
  }

  const weakBlocks = scored
    .filter((entry) => entry.mastery_score < passThreshold)
    .slice(0, MAX_WEAK_BLOCKS);

  if (weakBlocks.length > 0) {
    return { weakBlocks, hasData: true };
  }

  return {
    weakBlocks: scored.slice(0, MAX_WEAK_BLOCKS),
    hasData: true,
  };
}

export async function getWeakBlocksForTrade(
  tradeId: string,
  passThreshold = WEAK_BLOCK_SCORE_THRESHOLD,
): Promise<WeakBlocksSummary> {
  const [blocks, mastery] = await Promise.all([
    fetchBlocks(tradeId),
    getTradeMasteryMap(tradeId),
  ]);

  return computeWeakBlocks(blocks, mastery, passThreshold);
}
