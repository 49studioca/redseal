import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { fetchFlashcards } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";

export default async function FlashcardsPage() {
  const { trade } = await getDashboardSession();
  const cards = await fetchFlashcards(trade.id);

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
        {cards.length > 0 ? (
          <FlashcardDeck cards={cards} />
        ) : (
          <p className="text-sm text-[#64748B]">
            Flashcards are generated with lessons. Run{" "}
            <code className="rounded bg-[#F1F5F9] px-1">
              npm run db:generate-content
            </code>
            .
          </p>
        )}
      </div>
    </div>
  );
}
