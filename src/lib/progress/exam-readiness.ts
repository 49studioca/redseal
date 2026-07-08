import { fetchBlocks } from "@/lib/data";
import type { TradeBlockMastery } from "@/lib/demo-progress";
import {
  getTradeMasteryMap,
  MIN_ATTEMPTS_FOR_WEAK_BLOCKS,
} from "@/lib/progress/block-mastery";
import type { RsosBlock } from "@/types";

export const MIN_ATTEMPTS_FOR_READINESS = MIN_ATTEMPTS_FOR_WEAK_BLOCKS;

export type ReadinessConfidence = "none" | "partial" | "full";

export type ExamReadinessSummary = {
  /** Weighted score across all RSOS blocks; unpracticed blocks count as 0%. */
  score: number;
  confidence: ReadinessConfidence;
  blocksAssessed: number;
  totalBlocks: number;
  questionsAttempted: number;
  questionsCorrect: number;
  passThreshold: number;
  statusLabel: string;
  statusDetail: string;
  showScore: boolean;
  /** Average accuracy on blocks with enough attempts. */
  practiceAccuracy: number | null;
};

export function clampReadinessScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function isBlockAssessed(
  mastery: TradeBlockMastery,
  blockId: string,
): boolean {
  const stats = mastery[blockId];
  return (stats?.questions_attempted ?? 0) >= MIN_ATTEMPTS_FOR_READINESS;
}

function weightedBlockScore(
  blocks: RsosBlock[],
  getScore: (block: RsosBlock) => number,
): number {
  const totalWeight = blocks.reduce(
    (sum, block) => sum + Math.max(0, block.exam_question_count),
    0,
  );

  if (totalWeight === 0) {
    const scores = blocks.map((block) => getScore(block));
    if (!scores.length) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  const weighted = blocks.reduce((sum, block) => {
    return sum + getScore(block) * block.exam_question_count;
  }, 0);

  return weighted / totalWeight;
}

/** Weighted by each block's share of official exam questions. */
export function computeExamReadiness(
  blocks: RsosBlock[],
  mastery: TradeBlockMastery,
): number {
  return clampReadinessScore(
    weightedBlockScore(blocks, (block) => mastery[block.id]?.mastery_score ?? 0),
  );
}

export function buildExamReadinessSummary(
  blocks: RsosBlock[],
  mastery: TradeBlockMastery,
  passThreshold = 70,
): ExamReadinessSummary {
  let questionsAttempted = 0;
  let questionsCorrect = 0;
  let blocksAssessed = 0;
  let practiceAccuracyTotal = 0;

  for (const block of blocks) {
    const stats = mastery[block.id];
    if (!stats) continue;

    questionsAttempted += stats.questions_attempted;
    questionsCorrect += stats.questions_correct;

    if (isBlockAssessed(mastery, block.id)) {
      blocksAssessed += 1;
      practiceAccuracyTotal += stats.mastery_score;
    }
  }

  const totalBlocks = blocks.length;
  const score = computeExamReadiness(blocks, mastery);
  const practiceAccuracy =
    blocksAssessed > 0
      ? clampReadinessScore(practiceAccuracyTotal / blocksAssessed)
      : null;

  let confidence: ReadinessConfidence = "none";
  if (blocksAssessed === 0) {
    confidence = "none";
  } else if (blocksAssessed < totalBlocks) {
    confidence = "partial";
  } else {
    confidence = "full";
  }

  const showScore = confidence !== "none";

  let statusLabel = "Not started";
  let statusDetail =
    "Answer at least 3 practice questions in a block to unlock your readiness score.";

  if (confidence === "partial") {
    statusLabel = score >= passThreshold ? "On track so far" : "Early estimate";
    statusDetail = `Based on ${blocksAssessed} of ${totalBlocks} exam blocks and ${questionsAttempted} questions answered. Unpracticed blocks count as 0% until you train them.`;
  } else if (confidence === "full") {
    statusLabel =
      score >= passThreshold ? "Exam ready" : "Keep building mastery";
    statusDetail = `Based on practice across all ${totalBlocks} RSOS exam blocks (${questionsAttempted} questions answered). Weighted by each block's share of the official exam.`;
  }

  return {
    score,
    confidence,
    blocksAssessed,
    totalBlocks,
    questionsAttempted,
    questionsCorrect,
    passThreshold,
    statusLabel,
    statusDetail,
    showScore,
    practiceAccuracy,
  };
}

export async function getExamReadinessSummaryForTrade(
  tradeId: string,
  passThreshold = 70,
): Promise<ExamReadinessSummary> {
  const [blocks, mastery] = await Promise.all([
    fetchBlocks(tradeId),
    getTradeMasteryMap(tradeId),
  ]);

  return buildExamReadinessSummary(blocks, mastery, passThreshold);
}

export async function getExamReadinessForTrade(
  tradeId: string,
  passThreshold = 70,
): Promise<number> {
  const summary = await getExamReadinessSummaryForTrade(tradeId, passThreshold);
  return summary.score;
}
