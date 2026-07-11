import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { fetchFlashcards } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import { fetchDueFlashcards } from "@/lib/progress/flashcard-reviews";
import { FREE_LIMITS, limitForFreeTier } from "@/lib/access/subscription";

export default async function FlashcardsPage() {
  const { trade, province, isPremium } = await getDashboardSession();
  const [allCards, dueCards] = await Promise.all([
    fetchFlashcards(trade.id, province),
    fetchDueFlashcards(trade.id, province),
  ]);

  const availableCards = limitForFreeTier(
    dueCards.length > 0 ? dueCards : allCards,
    FREE_LIMITS.flashcards,
    isPremium,
  );
  const lockedCount = isPremium
    ? 0
    : Math.max(
        0,
        (dueCards.length > 0 ? dueCards : allCards).length -
          FREE_LIMITS.flashcards,
      );

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
        ) : availableCards.length > 0 ? (
          <>
            <FlashcardDeck cards={availableCards} />
            {lockedCount > 0 && (
              <UpgradePrompt
                className="mt-6"
                compact
                description={`${lockedCount} more flashcard${lockedCount === 1 ? "" : "s"} available with a subscription.`}
              />
            )}
          </>
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
