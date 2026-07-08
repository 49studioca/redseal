import Link from "next/link";
import { Headphones, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import { getProvincialStudyContext } from "@/lib/content/province-content";
import { ProvincialStudyBanner } from "@/components/dashboard/provincial-study-banner";
import {
  getWeakBlocksForTrade,
  MIN_ATTEMPTS_FOR_WEAK_BLOCKS,
  WEAK_BLOCK_SCORE_THRESHOLD,
} from "@/lib/progress/block-mastery";
import { getChapterTasksForBlock, getTradeDetailContent } from "@/data/seed";

export default async function LearnPage() {
  const { trade, province } = await getDashboardSession();
  const lessons = await fetchLessons(trade.id, province);
  const blocks = await fetchBlocks(trade.id);
  const provincialContext = getProvincialStudyContext(
    trade.id,
    trade.code,
    province,
  );
  const tradeDetail = getTradeDetailContent(trade.id);
  const rsosPdfLink = tradeDetail?.official_links?.find((link) =>
    /rsos|occupational standard/i.test(link.label),
  );
  const { weakBlocks, hasData } = await getWeakBlocksForTrade(
    trade.id,
    trade.pass_percentage ?? WEAK_BLOCK_SCORE_THRESHOLD,
  );
  const primaryWeakBlock = weakBlocks[0]?.block;

  return (
    <div className="mx-auto max-w-[1180px]">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Learning Path
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Zero-to-pass flow: block lessons → block quizzes → mock exams ·{" "}
        {provincialContext.provinceName}
      </p>

      <div className="mt-6">
        <ProvincialStudyBanner
          context={provincialContext}
          tradeSlug={trade.slug}
        />
      </div>

      {rsosPdfLink && (
        <Card className="mt-6 border-[#E5E0D8] bg-[#FFFBF7] p-5">
          <p className="text-sm text-[#64748B]">
            Lessons are aligned to the official{" "}
            <a
              href={rsosPdfLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#C0271E] underline-offset-2 hover:underline"
            >
              {rsosPdfLink.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            . Each block below maps to the RSOS major work activities and exam
            tasks used on the Red Seal exam.
          </p>
        </Card>
      )}

      {blocks.length > 0 ? (
        <div className="mt-8 space-y-8">
          {blocks.map((block) => {
            const blockLessons = lessons.filter((l) => l.block_id === block.id);
            const chapterTasks = getChapterTasksForBlock(block.id);

            return (
              <section key={block.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                      Block {block.code}
                    </span>
                    <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
                      {block.name}
                    </h2>
                  </div>
                  <span className="shrink-0 font-[family-name:var(--font-ibm-mono)] text-xs text-[#64748B]">
                    {block.exam_question_count} Qs
                    {block.exam_percentage != null &&
                      ` · ${block.exam_percentage}%`}
                  </span>
                </div>

                {block.exam_percentage != null && (
                  <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-[#F1F5F9]">
                    <div
                      className="h-full rounded-full bg-[#C0271E]"
                      style={{ width: `${block.exam_percentage}%` }}
                    />
                  </div>
                )}

                {chapterTasks.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {chapterTasks.map((task) => (
                      <li
                        key={task.code}
                        className="rounded-full border border-[#E5E0D8] bg-white px-2.5 py-1 text-xs text-[#64748B]"
                        title={task.name}
                      >
                        <span className="font-[family-name:var(--font-ibm-mono)] font-medium text-[#C0271E]">
                          {task.code}
                        </span>{" "}
                        {task.name}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 grid gap-4">
                  {blockLessons.length > 0 ? (
                    blockLessons.map((lesson) => (
                      <Card key={lesson.id} className="p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEBEC]">
                                <BookOpen className="h-4 w-4 text-[#C0271E]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold">
                                  {lesson.title}
                                </h3>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                              <Link href={`/dashboard/learn/${lesson.slug}`}>
                                <Button size="sm">
                                  Start lesson{" "}
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                              {lesson.audio_url && (
                                <Button variant="secondary" size="sm">
                                  <Headphones className="h-4 w-4" /> Audio only
                                </Button>
                              )}
                              <Link
                                href={`/dashboard/practice?block=${block.id}`}
                              >
                                <Button variant="secondary" size="sm">
                                  Practice Block {block.code}
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <p className="text-sm text-[#64748B]">
                            {lesson.summary}
                          </p>
                          <p className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                            ~{lesson.estimated_minutes} min ·{" "}
                            {lesson.content_blocks.length} sections
                          </p>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-5">
                      <p className="text-sm text-[#64748B]">
                        Lesson not generated yet. Run{" "}
                        <code className="rounded bg-[#F1F5F9] px-1">
                          npm run db:generate-content -- --trade={trade.code}{" "}
                          --block={block.code}
                        </code>
                      </p>
                      <Link
                        href={`/dashboard/practice?block=${block.id}`}
                        className="mt-3 inline-block"
                      >
                        <Button variant="secondary" size="sm">
                          Practice Block {block.code}
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Card className="mt-8 p-5">
          <p className="text-sm text-[#64748B]">
            No lessons yet for {trade.name}. Run{" "}
            <code className="rounded bg-[#F1F5F9] px-1">
              npm run db:generate-content
            </code>{" "}
            to create AI-generated lessons in the database.
          </p>
        </Card>
      )}

      <h2 className="mt-10 font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
        Weak-area drills
      </h2>
      <Card className="mt-4 p-5">
        {hasData ? (
          <>
            <p className="text-sm text-[#64748B]">
              Based on your practice and mock exam results, focus on{" "}
              {weakBlocks.map((entry, i) => (
                <span key={entry.block.id}>
                  {i > 0 && " and "}
                  <b className="text-[#C0271E]">
                    Block {entry.block.code} — {entry.block.name}
                  </b>
                  <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                    {" "}
                    ({Math.round(entry.mastery_score)}%)
                  </span>
                </span>
              ))}
              .
            </p>
            <Link
              href={
                primaryWeakBlock
                  ? `/dashboard/practice?block=${primaryWeakBlock.id}`
                  : "/dashboard/practice"
              }
              className="mt-4 inline-block"
            >
              <Button variant="secondary" size="sm">
                {primaryWeakBlock
                  ? `Practice Block ${primaryWeakBlock.code}`
                  : "Start weak-area drill"}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-[#64748B]">
              Answer at least {MIN_ATTEMPTS_FOR_WEAK_BLOCKS} practice questions
              per block (or finish a mock exam) to unlock personalized focus
              areas.
            </p>
            <Link href="/dashboard/practice" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Start practicing
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
