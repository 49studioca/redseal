import { notFound } from "next/navigation";
import Link from "next/link";
import { Headphones, ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { LessonContent } from "@/components/learn/lesson-content";
import { getDashboardSession } from "@/lib/dashboard-session";
import { isFreeLesson } from "@/lib/access/subscription";
import {
  blockCodeFromLessonSlug,
  prepareLessonBlocks,
  taskCodeFromLessonSlug,
} from "@/lib/content/parse-content-blocks";
import {
  adjacentLessonsInPath,
  getFirstLessonForBlock,
  lessonNavLabel,
  usesPerTaskLessons,
} from "@/lib/content/lesson-structure";
import { getChapterTasksForBlockRef } from "@/data/seed";
import { blockMediaKey } from "@/data/block-media";
import { fetchBlockMediaOverrides } from "@/lib/content/block-media-overrides";
import {
  listImageAssetKeys,
  listVideoAlternatives,
} from "@/lib/admin/lesson-media";
import type { Lesson, RsosBlock } from "@/types";

function blockForLesson(
  blocks: RsosBlock[],
  lesson: Lesson,
): RsosBlock | undefined {
  if (lesson.block_id) {
    return blocks.find((block) => block.id === lesson.block_id);
  }
  const blockCode = blockCodeFromLessonSlug(lesson.slug);
  return blockCode
    ? blocks.find((block) => block.code === blockCode)
    : undefined;
}

function taskNameForLesson(
  lesson: Lesson,
  tradeCode: string,
  blockCode?: string,
): string | undefined {
  const taskCode =
    lesson.chapter_task_code ?? taskCodeFromLessonSlug(lesson.slug);
  if (!taskCode || !blockCode) return undefined;
  return getChapterTasksForBlockRef(tradeCode, blockCode).find(
    (task) => task.code === taskCode,
  )?.name;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { trade, province, isAdmin, isPremium } = await getDashboardSession();
  const [lessons, blocks] = await Promise.all([
    fetchLessons(trade.id, province),
    fetchBlocks(trade.id),
  ]);
  const lesson = lessons.find((l) => l.slug === slug);
  const block = lesson ? blockForLesson(blocks, lesson) : undefined;
  const { prev, next } = lesson
    ? adjacentLessonsInPath(lessons, lesson.id)
    : { prev: undefined, next: undefined };
  const prevBlock = prev ? blockForLesson(blocks, prev) : undefined;
  const nextBlock = next ? blockForLesson(blocks, next) : undefined;
  const isLastLessonInTrade =
    lessons.length > 0 &&
    lesson?.id ===
      [...lessons].sort((a, b) => a.sort_order - b.sort_order).at(-1)?.id;

  if (!slug || !lesson) {
    notFound();
  }

  const blockCode = block?.code ?? blockCodeFromLessonSlug(lesson.slug);
  const lessonUnlocked =
    isPremium || isFreeLesson(lesson, trade.code, blockCode);

  if (!lessonUnlocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard/learn">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to learning path
          </Button>
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          {lesson.title}
        </h1>
        <UpgradePrompt
          className="mt-6"
          description="This lesson is part of the full learning path. Free access includes A-1 only — upgrade to unlock all lessons."
        />
      </div>
    );
  }

  const taskCode =
    lesson.chapter_task_code ?? taskCodeFromLessonSlug(lesson.slug);
  const taskName = taskNameForLesson(lesson, trade.code, block?.code);
  const perTaskBlock = block
    ? usesPerTaskLessons(trade.code, block.code)
    : false;
  const mediaOverrides = await fetchBlockMediaOverrides(
    blockMediaKey(trade.code, blockCode ?? "", taskCode),
  );
  const preparedBlocks = prepareLessonBlocks(
    lesson.content_blocks,
    trade.code,
    blockCode,
    taskCode,
    mediaOverrides,
  );
  const videoAlternativesById = isAdmin
    ? Object.fromEntries(
        preparedBlocks
          .filter((block) => block.type === "video")
          .map((block) => [
            block.content.trim(),
            listVideoAlternatives(trade.code, block.content.trim()),
          ]),
      )
    : undefined;

  const canAccessLesson = (candidate?: Lesson) => {
    if (!candidate) return false;
    const candidateBlock = blockForLesson(blocks, candidate);
    const candidateBlockCode =
      candidateBlock?.code ?? blockCodeFromLessonSlug(candidate.slug);
    return isPremium || isFreeLesson(candidate, trade.code, candidateBlockCode);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/learn">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to learning path
          </Button>
        </Link>

        {block && (
          <div className="inline-flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-3 py-1">
              <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                Block {block.code}
              </span>
              <span className="text-xs text-[#64748B]">
                {block.exam_question_count} exam Qs · {block.exam_percentage}%
              </span>
            </div>
            {taskCode && (
              <div className="inline-flex items-center rounded-full border border-[#E5E0D8] bg-[#FFFBF7] px-3 py-1">
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                  {taskCode}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {taskName && <p className="mt-3 text-sm text-[#64748B]">{taskName}</p>}

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
          blocks={preparedBlocks}
          lessonId={lesson.id}
          lessonSlug={lesson.slug}
          chapterTaskCode={lesson.chapter_task_code}
          blockCode={blockCode}
          isAdmin={isAdmin}
          tradeCode={trade.code}
          codeVersion={lesson.code_version}
          imageAssetKeys={isAdmin ? listImageAssetKeys() : undefined}
          videoAlternativesById={videoAlternativesById}
        />
      </div>

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E0D8] pt-6">
        {prev && canAccessLesson(prev) ? (
          <Link href={`/dashboard/learn/${prev.slug}`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {lessonNavLabel(prev, prevBlock)}
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

          {next && canAccessLesson(next) ? (
            <Link href={`/dashboard/learn/${next.slug}`}>
              <Button size="sm">
                {lessonNavLabel(next, nextBlock)}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : isLastLessonInTrade && isPremium ? (
            <Link href="/dashboard/mock-exam">
              <Button size="sm">
                Start mock exam
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : !isPremium ? (
            <UpgradeButton
              label="Upgrade for more lessons"
              showLockIcon={false}
            />
          ) : nextBlock && perTaskBlock ? (
            <Link
              href={`/dashboard/learn/${getFirstLessonForBlock(lessons, nextBlock.id)?.slug ?? "/dashboard/learn"}`}
            >
              <Button variant="secondary" size="sm">
                Block {nextBlock.code}
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
