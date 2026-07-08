import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import {
  getTradeMasteryMap,
  MIN_ATTEMPTS_FOR_WEAK_BLOCKS,
} from "@/lib/progress/block-mastery";
import { buildExamReadinessSummary } from "@/lib/progress/exam-readiness";
import { ExamReadinessCard } from "@/components/dashboard/readiness-display";

export default async function DashboardPage() {
  const { trade, province } = await getDashboardSession();
  const [blocks, lessons, mastery] = await Promise.all([
    fetchBlocks(trade.id),
    fetchLessons(trade.id, province),
    getTradeMasteryMap(trade.id),
  ]);
  const readinessSummary = buildExamReadinessSummary(
    blocks,
    mastery,
    trade.pass_percentage,
  );
  const totalQuestionsAttempted = readinessSummary.questionsAttempted;
  const assessedBlockCount = blocks.filter(
    (block) =>
      (mastery[block.id]?.questions_attempted ?? 0) >=
      MIN_ATTEMPTS_FOR_WEAK_BLOCKS,
  ).length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Dashboard
          </div>
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[#64748B]">
            Here&apos;s where you stand on the{" "}
            <b className="text-[#1F2A37]">{trade.name}</b> Red Seal exam.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[11px] border border-[#E5E0D8] bg-white px-3.5 py-2">
          <ClipboardCheck className="h-5 w-5 text-[#C0271E]" />
          <div>
            <div className="font-[family-name:var(--font-ibm-mono)] text-lg font-semibold">
              {totalQuestionsAttempted}
            </div>
            <div className="text-[11px] font-semibold text-[#94A3B8]">
              questions answered
            </div>
          </div>
        </div>
      </div>

      <ExamReadinessCard trade={trade} summary={readinessSummary} />

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          {
            label: "Questions answered",
            value: String(totalQuestionsAttempted),
            icon: ClipboardCheck,
          },
          {
            label: "Blocks assessed",
            value: `${assessedBlockCount}/${blocks.length}`,
            icon: Gauge,
          },
          {
            label: "Lessons available",
            value: String(lessons.length),
            icon: BookOpen,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs font-semibold text-[#64748B]">
              {s.label}
            </div>
            <div className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
          <BookOpen className="h-5 w-5 text-[#C0271E]" /> RSOS Block Mastery
        </h2>
        <Link href="/dashboard/learn">
          <Button variant="secondary" size="sm">
            View learning path <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => {
          const blockStats = mastery[block.id];
          const attempts = blockStats?.questions_attempted ?? 0;
          const isAssessed = attempts >= MIN_ATTEMPTS_FOR_WEAK_BLOCKS;
          const blockMastery = Math.round(blockStats?.mastery_score ?? 0);

          return (
            <Link
              key={block.id}
              href={`/dashboard/practice?block=${block.id}`}
              className="block h-full"
            >
              <Card className="flex h-full cursor-pointer flex-col p-4 transition hover:border-[#C0271E] hover:shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-bold text-[#C0271E]">
                    Block {block.code}
                  </span>
                  {!isAssessed && (
                    <Badge className="bg-[#F1F5F9] text-[#64748B]">
                      {attempts === 0 ? "Not started" : "Needs more data"}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug">
                    {block.name}
                  </h3>
                  <span className="shrink-0 text-xs text-[#94A3B8]">
                    {block.exam_question_count} exam Qs
                  </span>
                </div>
                <div className="mt-auto pt-3">
                  <div className="h-2 overflow-hidden rounded bg-[#ECE6DC]">
                    <div
                      className="h-full rounded bg-[#C0271E] transition-all"
                      style={{ width: `${isAssessed ? blockMastery : 0}%` }}
                    />
                  </div>
                  {isAssessed && (
                    <div className="mt-1 flex items-center justify-between font-[family-name:var(--font-ibm-mono)] text-xs text-[#64748B]">
                      <span>{blockMastery}% mastered</span>
                      <span>
                        {blockStats?.questions_correct ?? 0}/{attempts} correct
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/practice">
          <Card className="cursor-pointer p-6 transition hover:border-[#C0271E] hover:shadow-lg">
            <ClipboardCheck className="h-8 w-8 text-[#C0271E]" />
            <h3 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold">
              Start Practice
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Filter by block, question type, and difficulty
            </p>
          </Card>
        </Link>
        <Link href="/dashboard/mock-exam">
          <Card className="cursor-pointer p-6 transition hover:border-[#C0271E] hover:shadow-lg">
            <Gauge className="h-8 w-8 text-[#C0271E]" />
            <h3 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold">
              Take Mock Exam
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              {trade.exam_question_count} questions ·{" "}
              {trade.exam_time_minutes / 60}h · {trade.pass_percentage}% to pass
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
