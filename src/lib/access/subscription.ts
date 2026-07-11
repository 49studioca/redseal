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
  const taskCode =
    lesson.chapter_task_code ?? taskCodeFromLessonSlug(lesson.slug);
  const perTask = blockCode
    ? usesPerTaskLessons(tradeCode, blockCode)
    : false;

  if (perTask) {
    return taskCode === FREE_LIMITS.learningTaskCode;
  }

  return blockCode === "A";
}

export function limitForFreeTier<T>(items: T[], limit: number, isPremium: boolean): T[] {
  return isPremium ? items : items.slice(0, limit);
}
