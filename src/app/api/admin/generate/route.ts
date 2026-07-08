import { NextResponse } from "next/server";
import {
  generateQuestion,
  generateChapterLesson,
  generateFlashcardsFromLesson,
  type GeneratedQuestion,
  type GeneratedLesson,
  type GeneratedFlashcard,
} from "@/lib/ai/generate";
import {
  TRADES,
  getBlockById,
  getChapterTasksForBlock,
  getDefaultCodeVersion,
} from "@/data/seed";
import { REFERENCE_CHUNKS } from "@/data/seed";
import { getTradeGenerationProfile } from "@/lib/data";
import { saveGeneratedDraft } from "@/lib/admin/draft-queue";
import { computePracticeQuestionCount } from "@/lib/content/practice-questions";
import { generateAndPersistBlockContent } from "@/lib/content/generate-block-content";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    trade_id,
    job_type,
    block_id,
    block_name,
    subtask_name,
    question_type = "application",
    difficulty = 3,
    code_version,
    question_count,
    append_questions = false,
  } = body;

  const trade = TRADES.find((t) => t.id === trade_id);
  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  const block = block_id ? getBlockById(block_id) : undefined;
  if (!block || block.trade_id !== trade_id) {
    return NextResponse.json(
      { error: "Valid chapter (RSOS block) required" },
      { status: 400 },
    );
  }

  const resolvedCodeVersion =
    code_version ?? getDefaultCodeVersion(trade_id);
  const profile = await getTradeGenerationProfile(trade_id);
  const chunks = REFERENCE_CHUNKS.filter(
    (c) => !resolvedCodeVersion || c.code_version === resolvedCodeVersion,
  );
  const chapterTasks = getChapterTasksForBlock(block.id);
  const resolvedBlockName = block_name ?? block.name;
  const resolvedSubtask =
    subtask_name ?? chapterTasks[0]?.name ?? "General subtask";

  let output: GeneratedQuestion | GeneratedLesson | { flashcards: GeneratedFlashcard[] };
  try {
    if (job_type === "practice_bank") {
      const supabase = await createServiceClient();
      const practiceCount =
        typeof question_count === "number" && question_count > 0
          ? question_count
          : computePracticeQuestionCount(
              chapterTasks,
              block.exam_question_count,
            );

      const result = await generateAndPersistBlockContent({
        supabase,
        trade,
        block,
        chapterTasks,
        codeVersion: resolvedCodeVersion,
        tradeProfile: profile ?? undefined,
        retrievedChunks: chunks,
        options: {
          skipLesson: true,
          skipFlashcards: true,
          questionCount: practiceCount,
          appendQuestions: append_questions,
        },
      });

      return NextResponse.json({
        job_type,
        trade_id,
        block_id: block.id,
        block_code: block.code,
        exam_question_count: block.exam_question_count,
        practice_question_count: practiceCount,
        append: append_questions,
        question_ids: result.questionIds,
        review_status: "approved",
      });
    }

    if (job_type === "question") {
      output = await generateQuestion({
        tradeCode: trade.code,
        tradeName: trade.name,
        subtaskName: resolvedSubtask,
        blockName: resolvedBlockName,
        questionType: question_type,
        difficulty,
        codeVersion: resolvedCodeVersion,
        retrievedChunks: chunks,
        tradeProfile: profile ?? undefined,
      });
    } else if (job_type === "lesson") {
      output = await generateChapterLesson({
        tradeCode: trade.code,
        tradeName: trade.name,
        blockCode: block.code,
        blockName: resolvedBlockName,
        blockId: block.id,
        chapterTasks,
        retrievedChunks: chunks,
        codeVersion: resolvedCodeVersion,
        tradeProfile: profile ?? undefined,
      });
    } else if (job_type === "flashcard") {
      const lesson = await generateChapterLesson({
        tradeCode: trade.code,
        tradeName: trade.name,
        blockCode: block.code,
        blockName: resolvedBlockName,
        blockId: block.id,
        chapterTasks,
        retrievedChunks: chunks,
        codeVersion: resolvedCodeVersion,
        tradeProfile: profile ?? undefined,
      });
      const lessonText = lesson.content_blocks
        .map((b) => b.content)
        .join("\n");
      output = {
        flashcards: await generateFlashcardsFromLesson(
          lesson.title,
          lessonText,
        ),
      };
    } else {
      return NextResponse.json({ error: "Unknown job type" }, { status: 400 });
    }

    const draft = await saveGeneratedDraft({
      content_type: job_type,
      trade_id,
      block_id: block.id,
      block_code: block.code,
      block_name: resolvedBlockName,
      chapter_tasks: chapterTasks,
      code_version: resolvedCodeVersion,
      retrieved_chunks: chunks,
      output,
      question_type,
      difficulty,
    });

    return NextResponse.json({
      job_type,
      trade_id,
      block_id: block.id,
      block_code: block.code,
      block_name: resolvedBlockName,
      chapter_tasks: chapterTasks,
      code_version: resolvedCodeVersion,
      retrieved_chunks: chunks,
      output,
      draft_id: draft.id,
      review_status: "draft",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}
