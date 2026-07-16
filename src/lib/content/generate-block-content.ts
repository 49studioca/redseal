import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generateChapterLesson,
  generateTaskLesson,
  generateQuestion,
  generateFlashcardsFromLesson,
} from "@/lib/ai/generate";
import type { Question } from "@/types";
import type { RsosBlock, RsosChapterTask } from "@/types";
import {
  resolveTradeId,
  resolveBlockId,
  upsertApprovedLesson,
  removeLegacyBlockLesson,
  appendBlockQuestions,
  replaceBlockQuestions,
  replaceLessonFlashcards,
  fetchLessonForBlock,
} from "./persist-generated";
import {
  usesPerTaskLessons,
  taskLessonSortOrder,
} from "./lesson-structure";
import { computePracticeQuestionCount } from "./practice-questions";
import { shuffleQuestionOptions } from "@/lib/practice/shuffle-options";
import { buildQuestionBlueprints } from "@/lib/ai/generation-quality";

export interface GenerateBlockContentInput {
  supabase: SupabaseClient;
  trade: { id: string; code: string; name: string };
  block: RsosBlock;
  chapterTasks: RsosChapterTask[];
  codeVersion: string;
  province?: string;
  tradeProfile?: {
    glossary?: Record<string, string>;
    code_standards?: string[];
    calculation_templates?: string[];
    distractor_patterns?: string[];
  };
  retrievedChunks: import("@/types").ReferenceChunk[];
  options?: {
    skipLesson?: boolean;
    skipQuestions?: boolean;
    skipFlashcards?: boolean;
    /** Override practice bank size (default: computed from RSOS tasks, not exam count). */
    questionCount?: number;
    /** When true, add questions without deleting the existing block bank. */
    appendQuestions?: boolean;
  };
}

export function distributeQuestionCounts(
  tasks: RsosChapterTask[],
  total: number,
): Array<{ task: RsosChapterTask; count: number }> {
  if (tasks.length === 0) {
    return [{ task: { code: "?", name: "General", exam_question_count: total }, count: total }];
  }
  const safeTotal = Math.max(0, Math.floor(total));
  const taskWeightTotal = tasks.reduce(
    (sum, task) => sum + Math.max(0, task.exam_question_count),
    0,
  );
  const basePerTask = safeTotal >= tasks.length ? 1 : 0;
  const remaining = safeTotal - basePerTask * tasks.length;
  const weighted = tasks.map((task, index) => {
    const weight =
      taskWeightTotal > 0
        ? Math.max(0, task.exam_question_count) / taskWeightTotal
        : 1 / tasks.length;
    const exactExtra = remaining * weight;
    const extra = Math.floor(exactExtra);
    return {
      task,
      index,
      count: basePerTask + extra,
      remainder: exactExtra - extra,
    };
  });
  let assigned = weighted.reduce((sum, entry) => sum + entry.count, 0);
  for (const entry of [...weighted].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  })) {
    if (assigned >= safeTotal) break;
    entry.count += 1;
    assigned += 1;
  }
  return weighted.map(({ task, count }) => ({ task, count }));
}

export async function generateAndPersistBlockContent(
  input: GenerateBlockContentInput,
) {
  const tradeId = await resolveTradeId(input.supabase, input.trade.code);
  const blockId = await resolveBlockId(
    input.supabase,
    tradeId,
    input.block.code,
  );

  const reviewStatus =
    input.retrievedChunks.length > 0 ? "approved" : "draft";
  const result: {
    lessonId?: string;
    questionIds: string[];
    flashcardIds: string[];
    reviewStatus: "draft" | "approved";
  } = { questionIds: [], flashcardIds: [], reviewStatus };

  let lessonText = "";

  if (!input.options?.skipLesson) {
    const perTask = usesPerTaskLessons(input.trade.id, input.block.code);

    if (perTask) {
      await removeLegacyBlockLesson(input.supabase, {
        tradeId,
        blockId,
      });

      for (let i = 0; i < input.chapterTasks.length; i++) {
        const task = input.chapterTasks[i];
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        console.log(
          `  … lesson ${i + 1}/${input.chapterTasks.length}: ${task.code} ${task.name}`,
        );
        const lesson = await generateTaskLesson({
          tradeName: input.trade.name,
          tradeCode: input.trade.code,
          blockCode: input.block.code,
          blockName: input.block.name,
          task,
          retrievedChunks: input.retrievedChunks,
          codeVersion: input.codeVersion,
          province: input.province,
          tradeProfile: input.tradeProfile,
        });

        const saved = await upsertApprovedLesson(input.supabase, {
          tradeId,
          blockId,
          blockCode: input.block.code,
          tradeCode: input.trade.code,
          sortOrder: taskLessonSortOrder(input.block.sort_order, i),
          codeVersion: input.codeVersion,
          province: input.province,
          taskCode: task.code,
          reviewStatus,
          lesson,
        });
        if (!result.lessonId) result.lessonId = saved.id as string;

        if (!input.options?.skipFlashcards) {
          console.log(`  … flashcards for ${task.code}`);
          const taskText = lesson.content_blocks.map((b) => b.content).join("\n");
          const cards = await generateFlashcardsFromLesson(
            `${task.code}: ${lesson.title}`,
            taskText,
          );
          const flashcardIds = await replaceLessonFlashcards(input.supabase, {
            tradeId,
            lessonId: saved.id as string,
            codeVersion: input.codeVersion,
            province: input.province,
            cards,
            reviewStatus,
          });
          result.flashcardIds.push(
            ...flashcardIds.map((row) => row.id as string),
          );
        }
      }
    } else {
      const lesson = await generateChapterLesson({
        tradeName: input.trade.name,
        tradeCode: input.trade.code,
        blockCode: input.block.code,
        blockName: input.block.name,
        blockId: input.block.id,
        chapterTasks: input.chapterTasks,
        retrievedChunks: input.retrievedChunks,
        codeVersion: input.codeVersion,
        province: input.province,
        tradeProfile: input.tradeProfile,
      });

      const saved = await upsertApprovedLesson(input.supabase, {
        tradeId,
        blockId,
        blockCode: input.block.code,
        tradeCode: input.trade.code,
        sortOrder: input.block.sort_order,
        codeVersion: input.codeVersion,
        province: input.province,
        reviewStatus,
        lesson,
      });
      result.lessonId = saved.id as string;
      lessonText = lesson.content_blocks.map((b) => b.content).join("\n");
    }
  }

  if (!input.options?.skipQuestions) {
    const total =
      input.options?.questionCount ??
      computePracticeQuestionCount(
        input.chapterTasks,
        input.block.exam_question_count,
      );
    const plan = distributeQuestionCounts(input.chapterTasks, total);
    const generated: Array<{
      generated: Awaited<ReturnType<typeof generateQuestion>>;
      questionType: Question["question_type"];
      difficulty: number;
      taskCode?: string;
      subtaskName: string;
    }> = [];

    let questionIndex = 0;
    for (const { task, count } of plan) {
      const previousStems: string[] = [];
      const blueprints = buildQuestionBlueprints(count);
      for (let i = 0; i < blueprints.length; i++) {
        const { questionType, difficulty, focus } = blueprints[i];
        questionIndex += 1;
        console.log(
          `  … question ${questionIndex}/${total}: ${task.code} (${questionType}, d${difficulty})`,
        );
        const gq = await generateQuestion({
          tradeCode: input.trade.code,
          tradeName: input.trade.name,
          subtaskName: task.name,
          taskCode: task.code === "?" ? undefined : task.code,
          blockName: input.block.name,
          questionType,
          difficulty,
          learningFocus: focus,
          previousStems,
          codeVersion: input.codeVersion,
          province: input.province,
          retrievedChunks: input.retrievedChunks,
          tradeProfile: input.tradeProfile,
        });
        previousStems.push(gq.stem);
        generated.push({
          generated: shuffleQuestionOptions({
            id: `gen-${task.code}-${i}`,
            trade_id: input.trade.id,
            block_id: input.block.id,
            stem: gq.stem,
            options: gq.options,
            correct_option: gq.correct_option,
            explanation: gq.explanation,
            code_citations: gq.code_citations,
            question_type: questionType,
            difficulty,
            code_version: input.codeVersion,
            province: input.province,
            requires_reference: gq.requires_reference,
            review_status: "approved",
          }),
          questionType,
          difficulty,
          taskCode: task.code === "?" ? undefined : task.code,
          subtaskName: task.name,
        });
      }
    }

    const persist = input.options?.appendQuestions
      ? appendBlockQuestions
      : replaceBlockQuestions;

    const saved = await persist(input.supabase, {
      tradeId,
      blockId,
      codeVersion: input.codeVersion,
      province: input.province,
      reviewStatus,
      questions: generated.map((q) => ({
        generated: {
          stem: q.generated.stem,
          options: q.generated.options,
          correct_option: q.generated.correct_option,
          explanation: q.generated.explanation,
          code_citations: q.generated.code_citations,
          requires_reference: q.generated.requires_reference,
        },
        questionType: q.questionType,
        difficulty: q.difficulty,
        taskCode: q.taskCode,
        subtaskName: q.subtaskName,
      })),
    });
    result.questionIds = saved.map((r) => r.id as string);
  }

  if (
    !input.options?.skipFlashcards &&
    !usesPerTaskLessons(input.trade.id, input.block.code)
  ) {
    let lessonId = result.lessonId;
    if (!lessonText) {
      const existing = await fetchLessonForBlock(
        input.supabase,
        tradeId,
        blockId,
        input.trade.code,
        input.block.code,
        input.province,
      );
      if (existing) {
        lessonId = String(existing.id);
        lessonText = (
          (existing.content_blocks as { content: string }[]) ?? []
        )
          .map((part) => part.content)
          .filter(Boolean)
          .join("\n");
      }
    }

    if (lessonText && lessonId) {
      const cards = await generateFlashcardsFromLesson(
        input.block.name,
        lessonText,
      );
      const saved = await replaceLessonFlashcards(input.supabase, {
        tradeId,
        lessonId,
        codeVersion: input.codeVersion,
        province: input.province,
        cards,
        reviewStatus,
      });
      result.flashcardIds = saved.map((r) => r.id as string);
    }
  }

  return result;
}
