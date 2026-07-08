import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TRADES, ALL_BLOCKS, getChapterTasksForBlock } from "@/data/seed";
import { fetchQuestions, fetchTradeBySlug, fetchBlocks } from "@/lib/data";
import { computePracticeQuestionCount } from "@/lib/content/practice-questions";

export default async function AdminCoveragePage() {
  const coverage = await Promise.all(
    TRADES.map(async (trade) => {
      const dbTrade = await fetchTradeBySlug(trade.slug);
      const questions = dbTrade ? await fetchQuestions(dbTrade.id) : [];
      const dbBlocks = dbTrade ? await fetchBlocks(dbTrade.id) : [];
      const seedBlocks = ALL_BLOCKS.filter((b) => b.trade_id === trade.id);
      return { trade, seedBlocks, dbBlocks, questions, dbTrade };
    }),
  );

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Coverage Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Practice bank targets cover all RSOS tasks per block. Mock exams use
          the exam column only.
        </p>

        {coverage.map(({ trade, seedBlocks, dbBlocks, questions, dbTrade }) => (
          <Card key={trade.id} className="mt-6 p-6">
            <h2 className="font-semibold">
              {trade.icon} {trade.name}
              {!dbTrade && (
                <span className="ml-2 text-xs text-[#B45309]">
                  (not seeded)
                </span>
              )}
            </h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[#64748B]">
                  <th className="pb-2">Block</th>
                  <th className="pb-2">Exam</th>
                  <th className="pb-2">Practice target</th>
                  <th className="pb-2">In bank</th>
                  <th className="pb-2">Gap</th>
                </tr>
              </thead>
              <tbody>
                {seedBlocks.map((block) => {
                  const dbBlock = dbBlocks.find((b) => b.code === block.code);
                  const count = dbBlock
                    ? questions.filter((q) => q.block_id === dbBlock.id).length
                    : 0;
                  const practiceTarget = computePracticeQuestionCount(
                    getChapterTasksForBlock(block.id),
                    block.exam_question_count,
                  );
                  const gap = practiceTarget - count;
                  return (
                    <tr key={block.id} className="border-b border-[#E5E0D8]/50">
                      <td className="py-2">
                        {block.code} — {block.name.slice(0, 35)}
                      </td>
                      <td>{block.exam_question_count}</td>
                      <td>{practiceTarget}</td>
                      <td
                        className={
                          count === 0 ? "font-bold text-[#B91C1C]" : ""
                        }
                      >
                        {count}
                      </td>
                      <td
                        className={
                          gap > 0
                            ? "font-semibold text-[#B45309]"
                            : "text-[#047857]"
                        }
                      >
                        {gap > 0 ? `+${gap} needed` : "OK"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
