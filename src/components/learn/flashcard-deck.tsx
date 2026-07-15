"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { qualityFromSwipe } from "@/lib/srs/sm2";
import { trackEvent } from "@/lib/analytics/track-event";
import type { FlashcardWithReview } from "@/lib/progress/flashcard-reviews";

interface FlashcardDeckProps {
  cards: FlashcardWithReview[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [queue, setQueue] = useState<string[]>(() =>
    cards.map((card) => card.id),
  );
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [saving, setSaving] = useState(false);

  const cardById = useMemo(
    () => Object.fromEntries(cards.map((card) => [card.id, card])),
    [cards],
  );

  const startedRef = useRef(false);

  useEffect(() => {
    setQueue(cards.map((card) => card.id));
    setFlipped(false);
    setReviewed(0);
    startedRef.current = false;
  }, [cards]);

  useEffect(() => {
    if (startedRef.current || cards.length === 0) return;
    startedRef.current = true;
    trackEvent("start_flashcards", { card_count: cards.length });
  }, [cards]);

  const currentId = queue[0];
  const card = currentId ? cardById[currentId] : undefined;
  const remaining = queue.length;

  const handleRate = useCallback(
    async (direction: "left" | "right" | "up") => {
      if (!card || saving) return;

      const quality = qualityFromSwipe(direction);
      setSaving(true);
      setFlipped(false);

      try {
        await fetch("/api/flashcards/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flashcard_id: card.id,
            quality,
          }),
        });
      } catch {
        // Keep session moving even if persistence fails offline.
      } finally {
        setSaving(false);
      }

      trackEvent("flashcard_review", {
        flashcard_id: card.id,
        quality,
        direction,
      });

      setReviewed((count) => count + 1);
      setQueue((current) => {
        const [activeId, ...rest] = current;
        if (!activeId) return current;

        if (direction === "left") {
          return [...rest, activeId];
        }

        if (direction === "up") {
          if (rest.length === 0) return [activeId];
          return [rest[0], activeId, ...rest.slice(1)];
        }

        return rest;
      });
    },
    [card, saving],
  );

  if (!card) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-[#E5E0D8] bg-white px-6 text-center">
        <p className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#334155]">
          {reviewed > 0 ? "Session complete!" : "No flashcards due"}
        </p>
        <p className="text-sm text-[#64748B]">
          {reviewed > 0
            ? `You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}. Check back later for the next batch.`
            : "Check back tomorrow for more review."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-4 flex justify-between text-sm text-[#64748B]">
        <span>{reviewed} reviewed</span>
        <span>{remaining} remaining</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className={cn(
          "relative flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-[#E5E0D8] bg-white p-8 text-center shadow-lg transition-transform active:scale-[0.98]",
          flipped && "border-[#C0271E] bg-[#FCEBEC]",
        )}
      >
        <div className="font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          {flipped ? "Answer" : "Question"} · Tap to flip
        </div>
        <p className="mt-4 font-[family-name:var(--font-barlow-semi)] text-xl font-semibold leading-snug">
          {flipped ? card.back : card.front}
        </p>
      </button>

      {flipped && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={(event) => {
              event.stopPropagation();
              void handleRate("left");
            }}
            className="rounded-xl bg-[#FEF2F2] py-4 text-sm font-bold text-[#B91C1C] disabled:opacity-60"
          >
            ← Again
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(event) => {
              event.stopPropagation();
              void handleRate("up");
            }}
            className="rounded-xl bg-[#FFFBEB] py-4 text-sm font-bold text-[#B45309] disabled:opacity-60"
          >
            ↑ Hard
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(event) => {
              event.stopPropagation();
              void handleRate("right");
            }}
            className="rounded-xl bg-[#ECFDF5] py-4 text-sm font-bold text-[#047857] disabled:opacity-60"
          >
            Good →
          </button>
        </div>
      )}
    </div>
  );
}
