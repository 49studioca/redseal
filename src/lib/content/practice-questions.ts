import type { RsosChapterTask } from "@/types";

/** Floor per RSOS task so practice drills cover every subtopic in a block. */
export const PRACTICE_QUESTIONS_PER_TASK_MIN = 4;

/**
 * Practice bank size — larger than the exam blueprint so learners can drill
 * all block content. Mock exams still sample `block.exam_question_count` per block.
 */
export function computePracticeQuestionCount(
  chapterTasks: RsosChapterTask[],
  examQuestionCount: number,
): number {
  if (chapterTasks.length === 0) {
    return Math.max(examQuestionCount, PRACTICE_QUESTIONS_PER_TASK_MIN * 3);
  }

  const fromTasks = chapterTasks.reduce((total, task) => {
    const depth = Math.max(
      PRACTICE_QUESTIONS_PER_TASK_MIN,
      Math.ceil(task.exam_question_count * 1.25),
    );
    return total + depth;
  }, 0);

  return Math.max(fromTasks, examQuestionCount);
}
