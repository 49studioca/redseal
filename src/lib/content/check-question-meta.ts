import type { ContentBlock } from "@/types";

const ANSWER_META_ALIASES = [
  "answer",
  "solution",
  "correct_answer",
  "explanation",
  "response",
] as const;

export function hasCheckAnswer(meta?: Record<string, unknown>): boolean {
  return typeof meta?.answer === "string" && meta.answer.trim().length > 0;
}

/** Normalize AI/DB shapes into check_question meta.answer / meta.steps. */
export function coalesceCheckQuestionMeta(
  entry: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const meta: Record<string, unknown> =
    entry.meta && typeof entry.meta === "object"
      ? { ...(entry.meta as Record<string, unknown>) }
      : {};

  if (typeof entry.answer === "string" && !meta.answer) {
    meta.answer = entry.answer;
  }
  if (typeof entry.steps === "string" && !meta.steps) {
    meta.steps = entry.steps;
  }

  if (!meta.answer) {
    for (const key of ANSWER_META_ALIASES) {
      const value = meta[key];
      if (typeof value === "string" && value.trim()) {
        meta.answer = value;
        break;
      }
    }
  }

  if (typeof meta.answer === "number") {
    meta.answer = String(meta.answer);
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

export function normalizeCheckQuestionBlock(block: ContentBlock): ContentBlock {
  if (block.type !== "check_question") return block;

  const meta = coalesceCheckQuestionMeta(
    block as ContentBlock & Record<string, unknown>,
  );
  return meta ? { ...block, meta } : block;
}

export function lessonBlocksMissingCheckAnswers(
  blocks: ContentBlock[],
): ContentBlock[] {
  return blocks.filter(
    (block) => block.type === "check_question" && !hasCheckAnswer(block.meta),
  );
}
