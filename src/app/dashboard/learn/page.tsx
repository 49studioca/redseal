import Link from "next/link";
import { Headphones, ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";

export default async function LearnPage() {
  const { trade } = await getDashboardSession();
  const lessons = await fetchLessons(trade.id);
  const blocks = await fetchBlocks(trade.id);
  const focusBlocks = blocks.slice(2, 4);

  return (
    <div className="mx-auto max-w-[1180px]">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Learning Path
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Zero-to-pass flow: block lessons → block quizzes → mock exams
      </p>

      {blocks.length > 0 ? (
        <div className="mt-8 space-y-8">
          {blocks.map((block) => {
            const blockLessons = lessons.filter((l) => l.block_id === block.id);

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

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {blockLessons.length > 0 ? (
                    blockLessons.map((lesson) => (
                      <Card key={lesson.id} className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEBEC]">
                            <BookOpen className="h-4 w-4 text-[#C0271E]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{lesson.title}</h3>
                            <p className="mt-1 text-sm text-[#64748B]">
                              {lesson.summary}
                            </p>
                            <p className="mt-2 font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                              ~{lesson.estimated_minutes} min ·{" "}
                              {lesson.content_blocks.length} sections
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/dashboard/learn/${lesson.slug}`}>
                            <Button size="sm">
                              Start lesson <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          {lesson.audio_url && (
                            <Button variant="secondary" size="sm">
                              <Headphones className="h-4 w-4" /> Audio only
                            </Button>
                          )}
                          <Link href={`/dashboard/practice?block=${block.id}`}>
                            <Button variant="secondary" size="sm">
                              Practice Block {block.code}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-5 md:col-span-2">
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
        <p className="text-sm text-[#64748B]">
          Recommended focus areas:{" "}
          {focusBlocks.length > 0 ? (
            focusBlocks.map((block, i) => (
              <span key={block.id}>
                {i > 0 && " and "}
                <b className="text-[#C0271E]">
                  Block {block.code} — {block.name}
                </b>
              </span>
            ))
          ) : (
            <b className="text-[#C0271E]">all RSOS blocks</b>
          )}
          .
        </p>
        <Link href="/dashboard/practice" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Start weak-area drill
          </Button>
        </Link>
      </Card>
    </div>
  );
}
