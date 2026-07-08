export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export function sm2Review(
  state: Sm2State,
  quality: number
): Sm2State & { nextReviewAt: Date } {
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);

    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, nextReviewAt };
}

export function qualityFromSwipe(direction: "left" | "right" | "up"): number {
  if (direction === "left") return 1;
  if (direction === "up") return 3;
  return 5;
}
