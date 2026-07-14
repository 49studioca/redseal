import { taskCodeFromLessonSlug } from "@/lib/content/parse-content-blocks";
import { usesPerTaskLessons } from "@/lib/content/lesson-structure";
import type { Lesson, Profile } from "@/types";

export const FREE_LIMITS = {
  learningTaskCode: "A-1",
  mockExamQuestions: 5,
  flashcards: 5,
  translations: 5,
} as const;

export function isPremiumTier(tier: Profile["subscription_tier"]): boolean {
  return tier !== "free";
}

export function isFreeLesson(
  lesson: Lesson,
  tradeCode: string,
  blockCode?: string,
): boolean {
  // Only Block A is part of the free tier.
  if (blockCode !== "A") return false;

  const taskCode =
    lesson.chapter_task_code ?? taskCodeFromLessonSlug(lesson.slug);
  const perTask = usesPerTaskLessons(tradeCode, blockCode);

  // Per-task Block A lessons: keep only Task 1 (A-1) free.
  if (perTask && taskCode) {
    return taskCode === FREE_LIMITS.learningTaskCode;
  }

  // Block-level Block A lesson (no per-task split, or missing task code):
  // this is the Block A intro/first task, free for all trades.
  return true;
}

export function limitForFreeTier<T>(items: T[], limit: number, isPremium: boolean): T[] {
  return isPremium ? items : items.slice(0, limit);
}
