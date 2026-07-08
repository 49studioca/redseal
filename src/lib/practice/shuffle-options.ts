import type { Question, QuestionOption } from "@/types";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;

  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1_103_515_245 + 12_345) & 0x7fffffff;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/** Shuffle option order and re-key A–D so the correct answer isn't always B. */
export function shuffleQuestionOptions(
  question: Question,
  seed = hashString(question.id),
): Question {
  const correctOption = question.options.find(
    (option) => option.key === question.correct_option,
  );
  if (!correctOption) return question;

  const distractors = question.options.filter(
    (option) => option.key !== question.correct_option,
  );
  const shuffledDistractors = seededShuffle(distractors, seed);
  const correctIndex = seed % OPTION_KEYS.length;

  const slots: QuestionOption[] = [];
  let distractorIndex = 0;
  for (let i = 0; i < OPTION_KEYS.length; i++) {
    const source =
      i === correctIndex ? correctOption : shuffledDistractors[distractorIndex++];
    slots.push({
      ...source,
      key: OPTION_KEYS[i],
    });
  }

  return {
    ...question,
    options: slots,
    correct_option: OPTION_KEYS[correctIndex],
  };
}
