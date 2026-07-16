import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedLesson, GeneratedQuestion } from "@/lib/ai/generate";
import type { Question } from "@/types";

export function stableLessonSlug(
  tradeCode: string,
  blockCode: string,
  province?: string,
  taskCode?: string,
) {
  const trade = tradeCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  const block = blockCode.toLowerCase();
  const task = taskCode ? `-${taskCode.toLowerCase()}` : "";
  const base = `block-${block}${task}-${trade}`;
  return province ? `${base}-${province.toLowerCase()}` : base;
}

export async function removeLegacyBlockLesson(
  supabase: SupabaseClient,
  input: {
    tradeId: string;
    blockId: string;
  },
) {
  // Per-task generation replaces the single block-level lesson with one lesson
  // per RSOS task. Remove any legacy block-level lessons (no task code) for this
  // block across every province so they don't shadow the per-task lessons in the
  // province-resolved learning path.
  await supabase
    .from("lessons")
    .delete()
    .eq("trade_id", input.tradeId)
    .eq("block_id", input.blockId)
    .is("chapter_task_code", null);
}

export async function resolveTradeId(
  supabase: SupabaseClient,
  tradeCode: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("trades")
    .select("id")
    .eq("code", tradeCode)
    .maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id as string;
  throw new Error(
    `Trade not found in database: ${tradeCode}. Run npm run db:seed first to load trades and RSOS blocks.`,
  );
}

export async function resolveBlockId(
  supabase: SupabaseClient,
  tradeId: string,
  blockCode: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("rsos_blocks")
    .select("id")
    .eq("trade_id", tradeId)
    .eq("code", blockCode)
    .single();
  if (error || !data) {
    throw new Error(
      `Block not found in database: ${blockCode} (trade ${tradeId}). Run npm run db:seed first.`,
    );
  }
  return data.id as string;
}

export async function upsertApprovedLesson(
  supabase: SupabaseClient,
  input: {
    tradeId: string;
    blockId: string;
    blockCode: string;
    tradeCode: string;
    sortOrder: number;
    codeVersion?: string;
    province?: string;
    taskCode?: string;
    reviewStatus?: "draft" | "approved";
    lesson: GeneratedLesson;
  },
) {
  const { lesson } = input;
  const slug = stableLessonSlug(
    input.tradeCode,
    input.blockCode,
    input.province,
    input.taskCode,
  );

  const { data: existing } = await supabase
    .from("lessons")
    .select("id")
    .eq("trade_id", input.tradeId)
    .eq("slug", slug)
    .maybeSingle();

  const row = {
    trade_id: input.tradeId,
    block_id: input.blockId,
    title: lesson.title,
    slug,
    summary: lesson.summary,
    content_blocks: lesson.content_blocks,
    estimated_minutes: lesson.estimated_minutes,
    sort_order: input.sortOrder,
    code_version: input.codeVersion,
    province: input.province ?? null,
    chapter_task_code: input.taskCode ?? null,
    review_status: input.reviewStatus ?? "approved",
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("lessons")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function appendBlockQuestions(
  supabase: SupabaseClient,
  input: {
    tradeId: string;
    blockId: string;
    codeVersion?: string;
    province?: string;
    reviewStatus?: "draft" | "approved";
    questions: Array<{
      generated: GeneratedQuestion;
      questionType: Question["question_type"];
      difficulty: number;
      taskCode?: string;
      subtaskName: string;
    }>;
  },
) {
  if (input.questions.length === 0) return [];

  const rows = input.questions.map((q) => ({
    trade_id: input.tradeId,
    block_id: input.blockId,
    stem: q.generated.stem,
    options: q.generated.options,
    correct_option: q.generated.correct_option,
    explanation: q.generated.explanation,
    code_citations: q.generated.code_citations,
    question_type: q.questionType,
    difficulty: q.difficulty,
    chapter_task_code: q.taskCode ?? null,
    code_version: input.codeVersion,
    province: input.province ?? null,
    requires_reference: q.generated.requires_reference,
    review_status: input.reviewStatus ?? "approved",
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(rows)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function replaceBlockQuestions(
  supabase: SupabaseClient,
  input: {
    tradeId: string;
    blockId: string;
    codeVersion?: string;
    province?: string;
    reviewStatus?: "draft" | "approved";
    questions: Array<{
      generated: GeneratedQuestion;
      questionType: Question["question_type"];
      difficulty: number;
      taskCode?: string;
      subtaskName: string;
    }>;
  },
) {
  let existingQuery = supabase
    .from("questions")
    .select("id")
    .eq("trade_id", input.tradeId)
    .eq("block_id", input.blockId);
  existingQuery = input.province
    ? existingQuery.eq("province", input.province)
    : existingQuery.is("province", null);
  const { data: existingRows, error: existingError } = await existingQuery;
  if (existingError) throw existingError;

  if (input.questions.length === 0) return [];

  const rows = input.questions.map((q) => ({
    trade_id: input.tradeId,
    block_id: input.blockId,
    stem: q.generated.stem,
    options: q.generated.options,
    correct_option: q.generated.correct_option,
    explanation: q.generated.explanation,
    code_citations: q.generated.code_citations,
    question_type: q.questionType,
    difficulty: q.difficulty,
    chapter_task_code: q.taskCode ?? null,
    code_version: input.codeVersion,
    province: input.province ?? null,
    requires_reference: q.generated.requires_reference,
    review_status: input.reviewStatus ?? "approved",
  }));

  // Insert replacements first so a failed insert leaves the live bank intact.
  // If the subsequent delete fails, roll back the new rows to avoid duplicates.
  const { data, error } = await supabase
    .from("questions")
    .insert(rows)
    .select("id");
  if (error) throw error;

  const insertedIds = (data ?? []).map((row) => row.id as string);
  const existingIds = (existingRows ?? []).map((row) => row.id as string);
  if (existingIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .in("id", existingIds);
    if (deleteError) {
      if (insertedIds.length > 0) {
        const { error: rollbackError } = await supabase
          .from("questions")
          .delete()
          .in("id", insertedIds);
        if (rollbackError) {
          throw new Error(
            `Failed to delete replaced questions (${deleteError.message}); also failed to roll back inserted questions (${rollbackError.message}).`,
          );
        }
      }
      throw deleteError;
    }
  }
  return data ?? [];
}

export async function fetchLessonForBlock(
  supabase: SupabaseClient,
  tradeId: string,
  blockId: string,
  tradeCode: string,
  blockCode: string,
  province?: string,
) {
  const slug = stableLessonSlug(tradeCode, blockCode, province);
  const { data: bySlug } = await supabase
    .from("lessons")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("slug", slug)
    .maybeSingle();
  if (bySlug) return bySlug;

  if (province) {
    const nationalSlug = stableLessonSlug(tradeCode, blockCode);
    const { data: byNationalSlug } = await supabase
      .from("lessons")
      .select("*")
      .eq("trade_id", tradeId)
      .eq("slug", nationalSlug)
      .maybeSingle();
    if (byNationalSlug) return byNationalSlug;
  }

  const { data: byBlock } = await supabase
    .from("lessons")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("block_id", blockId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return byBlock;
}

export async function replaceLessonFlashcards(
  supabase: SupabaseClient,
  input: {
    tradeId: string;
    lessonId: string;
    codeVersion?: string;
    province?: string;
    cards: Array<{ front: string; back: string }>;
    reviewStatus?: "draft" | "approved";
  },
) {
  await supabase.from("flashcards").delete().eq("lesson_id", input.lessonId);

  if (input.cards.length === 0) return [];

  const { data, error } = await supabase
    .from("flashcards")
    .insert(
      input.cards.map((card) => ({
        trade_id: input.tradeId,
        lesson_id: input.lessonId,
        front: card.front,
        back: card.back,
        code_version: input.codeVersion,
        province: input.province ?? null,
        review_status: input.reviewStatus ?? "approved",
      })),
    )
    .select("id");
  if (error) throw error;
  return data ?? [];
}
