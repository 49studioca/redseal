import { NextResponse } from "next/server";
import { recordFlashcardReview } from "@/lib/progress/flashcard-reviews";

export async function POST(request: Request) {
  const body = await request.json();
  const flashcardId = String(body.flashcard_id ?? "").trim();
  const quality = Number(body.quality);

  if (!flashcardId) {
    return NextResponse.json(
      { error: "flashcard_id is required" },
      { status: 400 },
    );
  }

  if (!Number.isFinite(quality) || quality < 0 || quality > 5) {
    return NextResponse.json(
      { error: "quality must be between 0 and 5" },
      { status: 400 },
    );
  }

  const review = await recordFlashcardReview(flashcardId, quality);
  if (!review) {
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 },
    );
  }

  return NextResponse.json({ flashcard_id: flashcardId, review });
}
