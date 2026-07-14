import type { Lesson, RsosBlock } from "@/types";
import { TRADES } from "@/data/seed";
import { taskCodeFromLessonSlug } from "@/lib/content/parse-content-blocks";

export function enrichLessonWithTaskCode(lesson: Lesson): Lesson {
  if (lesson.chapter_task_code) return lesson;
  const taskCode = taskCodeFromLessonSlug(lesson.slug);
  return taskCode ? { ...lesson, chapter_task_code: taskCode } : lesson;
}

/** Blocks that use one lesson per RSOS exam task instead of one lesson per block. */
export const PER_TASK_LESSON_BLOCKS: Record<string, string[]> = {
  "trade-309a": ["A", "B", "C", "D", "E"],
  "trade-442a": ["A", "B", "C", "D", "E", "F"],
  "trade-carpenter": ["A", "B", "C", "D", "E", "F", "G"],
};

export function usesPerTaskLessons(
  tradeIdOrCode: string,
  blockCode: string,
): boolean {
  const seedTrade = TRADES.find(
    (trade) =>
      trade.id === tradeIdOrCode ||
      trade.code.toUpperCase() === tradeIdOrCode.toUpperCase(),
  );
  if (!seedTrade) return false;
  const blocks = PER_TASK_LESSON_BLOCKS[seedTrade.id];
  return blocks?.includes(blockCode.toUpperCase()) ?? false;
}

export function taskLessonSortOrder(
  blockSortOrder: number,
  taskIndex: number,
): number {
  return blockSortOrder * 100 + taskIndex;
}

export function getLessonsForBlock(
  lessons: Lesson[],
  blockId: string,
): Lesson[] {
  return lessons
    .filter((lesson) => lesson.block_id === blockId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getFirstLessonForBlock(
  lessons: Lesson[],
  blockId: string,
): Lesson | undefined {
  return getLessonsForBlock(lessons, blockId)[0];
}

export function adjacentLessonsInPath(
  lessons: Lesson[],
  currentLessonId: string,
): { prev?: Lesson; next?: Lesson } {
  const sorted = [...lessons].sort((a, b) => a.sort_order - b.sort_order);
  const index = sorted.findIndex((lesson) => lesson.id === currentLessonId);
  if (index < 0) return {};

  return {
    prev: index > 0 ? sorted[index - 1] : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

export function lessonNavLabel(
  lesson: Lesson,
  block?: RsosBlock,
): string {
  if (lesson.chapter_task_code) return lesson.chapter_task_code;
  if (block) return `Block ${block.code}`;
  return lesson.title;
}
