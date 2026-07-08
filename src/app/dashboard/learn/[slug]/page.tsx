import { notFound } from "next/navigation";
import Link from "next/link";
import { Headphones, ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { LessonContent } from "@/components/learn/lesson-content";
import { getDashboardSession } from "@/lib/dashboard-session";
import {
  blockCodeFromLessonSlug,
  prepareLessonBlocks,
} from "@/lib/content/parse-content-blocks";
import type { Lesson, RsosBlock } from "@/types";

function lessonForBlock(lessons: Lesson[], blockId: string) {
  return lessons.find((l) => l.block_id === blockId);
}

function adjacentBlockLessons(
  blocks: RsosBlock[],
  lessons: Lesson[],
  currentBlockId?: string,
) {
  const index = currentBlockId
    ? blocks.findIndex((b) => b.id === currentBlockId)
    : -1;
  if (index < 0) return { prev: undefined, next: undefined };

  const prev =
    index > 0
      ? {
          block: blocks[index - 1],
          lesson: lessonForBlock(lessons, blocks[index - 1].id),
        }
      : undefined;
  const next =
    index < blocks.length - 1
      ? {
          block: blocks[index + 1],
          lesson: lessonForBlock(lessons, blocks[index + 1].id),
        }
      : undefined;

  return { prev, next };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { trade, province } = await getDashboardSession();
  const [lessons, blocks] = await Promise.all([
    fetchLessons(trade.id, province),
    fetchBlocks(trade.id),
  ]);
  const lesson = lessons.find((l) => l.slug === slug);
  const block = lesson?.block_id
    ? blocks.find((b) => b.id === lesson.block_id)
    : undefined;
  const { prev, next } = adjacentBlockLessons(blocks, lessons, block?.id);
  const blockIndex = block ? blocks.findIndex((b) => b.id === block.id) : -1;
  const isLastBlock = blockIndex >= 0 && blockIndex === blocks.length - 1;

  if (!slug || !lesson) {
    notFound();
  }

  const blockCode = block?.code ?? blockCodeFromLessonSlug(lesson.slug);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/learn">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to learning path
          </Button>
        </Link>

        {block && (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-3 py-1">
            <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
              Block {block.code}
            </span>
            <span className="text-xs text-[#64748B]">
              {block.exam_question_count} exam Qs · {block.exam_percentage}%
            </span>
          </div>
        )}
      </div>

      <h1 className="mt-4 font-[family-name:var(--font-barlow-semi)] text-3xl font-bold">
        {lesson.title}
      </h1>
      <p className="mt-2 text-[#64748B]">{lesson.summary}</p>

      {lesson.audio_url && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E5E0D8] bg-[#1F2A37] p-4 text-white">
          <Headphones className="h-6 w-6 text-[#F4A11A]" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Audio-only mode</div>
            <div className="text-xs text-[#9FBBD2]">
              Truck-friendly — listen while commuting
            </div>
          </div>
          <Button variant="white" size="sm">
            <PlayCircle className="h-4 w-4" /> Play
          </Button>
        </div>
      )}

      <div className="mt-8">
        <LessonContent
          blocks={prepareLessonBlocks(
            lesson.content_blocks,
            trade.code,
            blockCode,
          )}
          lessonId={lesson.id}
        />
      </div>

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E0D8] pt-6">
        {prev?.lesson ? (
          <Link href={`/dashboard/learn/${prev.lesson.slug}`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Block {prev.block.code}
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/learn">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Learning path
            </Button>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {block && (
            <Link href={`/dashboard/practice?block=${block.id}`}>
              <Button variant="secondary" size="sm">
                Practice Block {block.code}
              </Button>
            </Link>
          )}

          {next?.lesson ? (
            <Link href={`/dashboard/learn/${next.lesson.slug}`}>
              <Button size="sm">
                Block {next.block.code}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : next?.block ? (
            <Link href="/dashboard/learn">
              <Button variant="secondary" size="sm">
                Block {next.block.code}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : isLastBlock ? (
            <Link href="/dashboard/mock-exam">
              <Button size="sm">
                Start mock exam
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/learn">
              <Button size="sm">
                Learning path <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
