import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { fetchFlashcards } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import { fetchDueFlashcards } from "@/lib/progress/flashcard-reviews";

export default async function FlashcardsPage() {
  const { trade, province } = await getDashboardSession();
  const [allCards, dueCards] = await Promise.all([
    fetchFlashcards(trade.id, province),
    fetchDueFlashcards(trade.id, province),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Flashcards
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Spaced repetition — one-handed, truck-friendly review for{" "}
        {trade.short_name}
      </p>
      <div className="mt-8">
        {allCards.length === 0 ? (
          <p className="text-sm text-[#64748B]">
            Flashcards are generated with lessons. Run{" "}
            <code className="rounded bg-[#F1F5F9] px-1">
              npm run db:generate-content
            </code>
            .
          </p>
        ) : dueCards.length > 0 ? (
          <FlashcardDeck cards={dueCards} />
        ) : (
          <div className="rounded-2xl border border-[#E5E0D8] bg-white px-6 py-10 text-center">
            <p className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#334155]">
              All caught up!
            </p>
            <p className="mt-2 text-sm text-[#64748B]">
              No flashcards are due right now. Check back later for your next
              review session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
