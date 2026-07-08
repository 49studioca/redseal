export const DEMO_FLASHCARD_REVIEWS_COOKIE = "demo_flashcard_reviews";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type FlashcardReviewRecord = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_quality?: number;
};

export type DemoFlashcardReviewStore = Record<string, FlashcardReviewRecord>;

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set?: (
    name: string,
    value: string,
    options?: {
      path?: string;
      maxAge?: number;
      sameSite?: "lax" | "strict" | "none";
    },
  ) => void;
};

export function readDemoFlashcardReviews(
  cookies: CookieStore,
): DemoFlashcardReviewStore {
  const raw = cookies.get(DEMO_FLASHCARD_REVIEWS_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as DemoFlashcardReviewStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDemoFlashcardReviews(
  cookies: CookieStore,
  store: DemoFlashcardReviewStore,
): void {
  if (!cookies.set) return;
  cookies.set(
    DEMO_FLASHCARD_REVIEWS_COOKIE,
    encodeURIComponent(JSON.stringify(store)),
    {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    },
  );
}

export function upsertDemoFlashcardReview(
  cookies: CookieStore,
  flashcardId: string,
  record: FlashcardReviewRecord,
): FlashcardReviewRecord {
  const store = readDemoFlashcardReviews(cookies);
  store[flashcardId] = record;
  writeDemoFlashcardReviews(cookies, store);
  return record;
}

export function getDemoDueFlashcardIds(
  cookies: CookieStore,
  flashcardIds: string[],
): string[] {
  const store = readDemoFlashcardReviews(cookies);
  const now = Date.now();
  return flashcardIds.filter((id) => {
    const review = store[id];
    if (!review) return true;
    return new Date(review.next_review_at).getTime() <= now;
  });
}
