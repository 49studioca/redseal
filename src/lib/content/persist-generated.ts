import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedLesson, GeneratedQuestion } from "@/lib/ai/generate";
import type { Question } from "@/types";

export function stableLessonSlug(tradeCode: string, blockCode: string) {
  return `block-${blockCode.toLowerCase()}-${tradeCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
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
    lesson: GeneratedLesson;
  },
) {
  const { lesson } = input;
  const slug = stableLessonSlug(input.tradeCode, input.blockCode);

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
    review_status: "approved" as const,
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
    questions: Array<{
      generated: GeneratedQuestion;
      questionType: Question["question_type"];
      difficulty: number;
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
    code_version: input.codeVersion,
    requires_reference: q.generated.requires_reference,
    review_status: "approved" as const,
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
    questions: Array<{
      generated: GeneratedQuestion;
      questionType: Question["question_type"];
      difficulty: number;
      subtaskName: string;
    }>;
  },
) {
  await supabase
    .from("questions")
    .delete()
    .eq("trade_id", input.tradeId)
    .eq("block_id", input.blockId);

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
    code_version: input.codeVersion,
    requires_reference: q.generated.requires_reference,
    review_status: "approved" as const,
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(rows)
    .select("id");
  if (error) throw error;
  return data ?? [];
}
