import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { fetchFlashcards } from "@/lib/data";
import { sm2Review, type Sm2State } from "@/lib/srs/sm2";
import {
  readDemoFlashcardReviews,
  upsertDemoFlashcardReview,
  type FlashcardReviewRecord,
} from "@/lib/demo-flashcard-reviews";
import type { Flashcard } from "@/types";

export type FlashcardWithReview = Flashcard & {
  review?: FlashcardReviewRecord;
};

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!usesSupabaseData()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getSupabaseReviews(
  userId: string,
  flashcardIds: string[],
): Promise<Record<string, FlashcardReviewRecord>> {
  if (flashcardIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("flashcard_reviews")
    .select(
      "flashcard_id, ease_factor, interval_days, repetitions, next_review_at, last_quality",
    )
    .eq("user_id", userId)
    .in("flashcard_id", flashcardIds);

  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.flashcard_id,
      {
        ease_factor: Number(row.ease_factor),
        interval_days: row.interval_days,
        repetitions: row.repetitions,
        next_review_at: row.next_review_at,
        last_quality: row.last_quality ?? undefined,
      },
    ]),
  );
}

function isDue(review: FlashcardReviewRecord | undefined, now: number): boolean {
  if (!review) return true;
  return new Date(review.next_review_at).getTime() <= now;
}

export async function fetchDueFlashcards(
  tradeId: string,
): Promise<FlashcardWithReview[]> {
  const cards = await fetchFlashcards(tradeId);
  if (cards.length === 0) return [];

  const cookieStore = await cookies();
  const userId = await getAuthenticatedUserId();
  const now = Date.now();

  let reviews: Record<string, FlashcardReviewRecord> = {};
  if (userId) {
    reviews = await getSupabaseReviews(
      userId,
      cards.map((card) => card.id),
    );
  } else {
    reviews = readDemoFlashcardReviews(cookieStore);
  }

  return cards
    .filter((card) => isDue(reviews[card.id], now))
    .map((card) => ({
      ...card,
      review: reviews[card.id],
    }));
}

function toSm2State(review?: FlashcardReviewRecord): Sm2State {
  return {
    easeFactor: review?.ease_factor ?? 2.5,
    intervalDays: review?.interval_days ?? 0,
    repetitions: review?.repetitions ?? 0,
  };
}

function toReviewRecord(
  next: Sm2State & { nextReviewAt: Date },
  quality: number,
): FlashcardReviewRecord {
  return {
    ease_factor: next.easeFactor,
    interval_days: next.intervalDays,
    repetitions: next.repetitions,
    next_review_at: next.nextReviewAt.toISOString(),
    last_quality: quality,
  };
}

export async function recordFlashcardReview(
  flashcardId: string,
  quality: number,
): Promise<FlashcardReviewRecord | null> {
  const cookieStore = await cookies();
  const userId = await getAuthenticatedUserId();

  let existing: FlashcardReviewRecord | undefined;
  if (userId) {
    const reviews = await getSupabaseReviews(userId, [flashcardId]);
    existing = reviews[flashcardId];
  } else {
    existing = readDemoFlashcardReviews(cookieStore)[flashcardId];
  }

  const next = sm2Review(toSm2State(existing), quality);
  const record = toReviewRecord(next, quality);

  if (userId) {
    const supabase = await createClient();
    const { error } = await supabase.from("flashcard_reviews").upsert(
      {
        user_id: userId,
        flashcard_id: flashcardId,
        ease_factor: record.ease_factor,
        interval_days: record.interval_days,
        repetitions: record.repetitions,
        next_review_at: record.next_review_at,
        last_review_at: new Date().toISOString(),
        last_quality: quality,
      },
      { onConflict: "user_id,flashcard_id" },
    );
    if (error) return null;
    return record;
  }

  return upsertDemoFlashcardReview(cookieStore, flashcardId, record);
}

export async function countDueFlashcards(tradeId: string): Promise<number> {
  const due = await fetchDueFlashcards(tradeId);
  return due.length;
}
