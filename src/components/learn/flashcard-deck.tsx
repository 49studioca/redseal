"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";
import { sm2Review, qualityFromSwipe } from "@/lib/srs/sm2";

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, due: cards.length });

  const card = cards[index];

  const handleSwipe = useCallback(
    (direction: "left" | "right" | "up") => {
      const quality = qualityFromSwipe(direction);
      sm2Review({ easeFactor: 2.5, intervalDays: 0, repetitions: 0 }, quality);
      setFlipped(false);
      setStats((s) => ({
        reviewed: s.reviewed + 1,
        due: Math.max(0, s.due - 1),
      }));
      setIndex((i) => (i + 1) % cards.length);
    },
    [cards.length],
  );

  if (!card) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E0D8] bg-white">
        <p className="text-[#64748B]">
          No flashcards due. Check back tomorrow!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-4 flex justify-between text-sm text-[#64748B]">
        <span>{stats.reviewed} reviewed</span>
        <span>{stats.due} remaining</span>
      </div>

      <button
        onClick={() => setFlipped(!flipped)}
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
            onClick={() => handleSwipe("left")}
            className="rounded-xl bg-[#FEF2F2] py-4 text-sm font-bold text-[#B91C1C]"
          >
            ← Again
          </button>
          <button
            onClick={() => handleSwipe("up")}
            className="rounded-xl bg-[#FFFBEB] py-4 text-sm font-bold text-[#B45309]"
          >
            ↑ Hard
          </button>
          <button
            onClick={() => handleSwipe("right")}
            className="rounded-xl bg-[#ECFDF5] py-4 text-sm font-bold text-[#047857]"
          >
            Good →
          </button>
        </div>
      )}
    </div>
  );
}
