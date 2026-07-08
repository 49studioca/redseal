import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  ContentBlock,
  Question,
  QuestionOption,
  ReferenceChunk,
  ReviewStatus,
  RsosChapterTask,
} from "@/types";
import type {
  GeneratedFlashcard,
  GeneratedLesson,
  GeneratedQuestion,
} from "@/lib/ai/generate";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type DraftContentType = "question" | "lesson" | "flashcard";

export interface ReviewDraftItem {
  id: string;
  content_type: DraftContentType;
  trade_id: string;
  block_id?: string;
  block_code?: string;
  block_name?: string;
  chapter_tasks?: RsosChapterTask[];
  code_version?: string;
  retrieved_chunks: ReferenceChunk[];
  review_status: ReviewStatus;
  created_at: string;
  payload: GeneratedQuestion | GeneratedLesson | { flashcards: GeneratedFlashcard[] };
  related_ids?: string[];
}

const DRAFTS_PATH = path.join(process.cwd(), ".data", "admin-drafts.json");

function useSupabaseDrafts() {
  return (
    isSupabaseConfigured() &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "true"
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function readDraftFile(): Promise<ReviewDraftItem[]> {
  try {
    const raw = await readFile(DRAFTS_PATH, "utf8");
    return JSON.parse(raw) as ReviewDraftItem[];
  } catch {
    return [];
  }
}

async function writeDraftFile(items: ReviewDraftItem[]) {
  await mkdir(path.dirname(DRAFTS_PATH), { recursive: true });
  await writeFile(DRAFTS_PATH, JSON.stringify(items, null, 2), "utf8");
}

function mapLessonRow(row: Record<string, unknown>): ReviewDraftItem {
  return {
    id: String(row.id),
    content_type: "lesson",
    trade_id: String(row.trade_id),
    code_version: row.code_version ? String(row.code_version) : undefined,
    retrieved_chunks: [],
    review_status: row.review_status as ReviewStatus,
    created_at: String(row.created_at ?? new Date().toISOString()),
    payload: {
      title: String(row.title),
      summary: row.summary ? String(row.summary) : "",
      content_blocks: (row.content_blocks as ContentBlock[]) ?? [],
      estimated_minutes: Number(row.estimated_minutes ?? 15),
    },
  };
}

function mapQuestionRow(row: Record<string, unknown>): ReviewDraftItem {
  return {
    id: String(row.id),
    content_type: "question",
    trade_id: String(row.trade_id),
    block_id: row.block_id ? String(row.block_id) : undefined,
    code_version: row.code_version ? String(row.code_version) : undefined,
    retrieved_chunks: [],
    review_status: row.review_status as ReviewStatus,
    created_at: String(row.created_at ?? new Date().toISOString()),
    payload: {
      stem: String(row.stem),
      options: row.options as QuestionOption[],
      correct_option: row.correct_option as GeneratedQuestion["correct_option"],
      explanation: String(row.explanation),
      code_citations:
        (row.code_citations as GeneratedQuestion["code_citations"]) ?? [],
      requires_reference: Boolean(row.requires_reference),
    },
  };
}

function mapFlashcardRows(
  rows: Record<string, unknown>[],
  tradeId: string,
): ReviewDraftItem {
  const first = rows[0];
  return {
    id: String(first.id),
    content_type: "flashcard",
    trade_id: tradeId,
    code_version: first.code_version ? String(first.code_version) : undefined,
    retrieved_chunks: [],
    review_status: first.review_status as ReviewStatus,
    created_at: String(first.created_at ?? new Date().toISOString()),
    related_ids: rows.map((row) => String(row.id)),
    payload: {
      flashcards: rows.map((row) => ({
        front: String(row.front),
        back: String(row.back),
      })),
    },
  };
}

export async function saveGeneratedDraft(input: {
  content_type: DraftContentType;
  trade_id: string;
  block_id?: string;
  block_code?: string;
  block_name?: string;
  chapter_tasks?: RsosChapterTask[];
  code_version?: string;
  retrieved_chunks: ReferenceChunk[];
  output: GeneratedQuestion | GeneratedLesson | { flashcards: GeneratedFlashcard[] };
  question_type?: Question["question_type"];
  difficulty?: number;
}): Promise<ReviewDraftItem> {
  if (useSupabaseDrafts()) {
    return saveDraftToSupabase(input);
  }
  return saveDraftToFile(input);
}

async function saveDraftToFile(input: {
  content_type: DraftContentType;
  trade_id: string;
  block_id?: string;
  block_code?: string;
  block_name?: string;
  chapter_tasks?: RsosChapterTask[];
  code_version?: string;
  retrieved_chunks: ReferenceChunk[];
  output: GeneratedQuestion | GeneratedLesson | { flashcards: GeneratedFlashcard[] };
}): Promise<ReviewDraftItem> {
  const drafts = await readDraftFile();
  const draft: ReviewDraftItem = {
    id: randomUUID(),
    content_type: input.content_type,
    trade_id: input.trade_id,
    block_id: input.block_id,
    block_code: input.block_code,
    block_name: input.block_name,
    chapter_tasks: input.chapter_tasks,
    code_version: input.code_version,
    retrieved_chunks: input.retrieved_chunks,
    review_status: "draft",
    created_at: new Date().toISOString(),
    payload: input.output,
  };
  drafts.unshift(draft);
  await writeDraftFile(drafts);
  return draft;
}

async function saveDraftToSupabase(input: {
  content_type: DraftContentType;
  trade_id: string;
  block_id?: string;
  block_code?: string;
  block_name?: string;
  chapter_tasks?: RsosChapterTask[];
  code_version?: string;
  retrieved_chunks: ReferenceChunk[];
  output: GeneratedQuestion | GeneratedLesson | { flashcards: GeneratedFlashcard[] };
  question_type?: Question["question_type"];
  difficulty?: number;
}): Promise<ReviewDraftItem> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  if (input.content_type === "lesson") {
    const lesson = input.output as GeneratedLesson;
    const slug = `${slugify(lesson.title)}-${Date.now()}`;
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        trade_id: input.trade_id,
        block_id: input.block_id,
        title: lesson.title,
        slug,
        summary: lesson.summary,
        content_blocks: lesson.content_blocks,
        estimated_minutes: lesson.estimated_minutes,
        code_version: input.code_version,
        review_status: "draft",
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      ...mapLessonRow(data),
      block_id: input.block_id,
      block_code: input.block_code,
      block_name: input.block_name,
      chapter_tasks: input.chapter_tasks,
      retrieved_chunks: input.retrieved_chunks,
    };
  }

  if (input.content_type === "question") {
    const question = input.output as GeneratedQuestion;
    const { data, error } = await supabase
      .from("questions")
      .insert({
        trade_id: input.trade_id,
        block_id: input.block_id,
        stem: question.stem,
        options: question.options,
        correct_option: question.correct_option,
        explanation: question.explanation,
        code_citations: question.code_citations,
        question_type: input.question_type ?? "application",
        difficulty: input.difficulty ?? 3,
        code_version: input.code_version,
        requires_reference: question.requires_reference,
        review_status: "draft",
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      ...mapQuestionRow(data),
      block_name: input.block_name,
      block_code: input.block_code,
      chapter_tasks: input.chapter_tasks,
      retrieved_chunks: input.retrieved_chunks,
    };
  }

  const bundle = input.output as { flashcards: GeneratedFlashcard[] };
  const rows = bundle.flashcards.map((card) => ({
    trade_id: input.trade_id,
    front: card.front,
    back: card.back,
    code_version: input.code_version,
    review_status: "draft" as const,
  }));
  const { data, error } = await supabase
    .from("flashcards")
    .insert(rows)
    .select("*");
  if (error) throw error;

  return {
    ...mapFlashcardRows(data, input.trade_id),
    block_id: input.block_id,
    block_code: input.block_code,
    block_name: input.block_name,
    chapter_tasks: input.chapter_tasks,
    retrieved_chunks: input.retrieved_chunks,
  };
}

export async function fetchDraftQueue(): Promise<ReviewDraftItem[]> {
  if (useSupabaseDrafts()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    const [lessons, questions, flashcards] = await Promise.all([
      supabase
        .from("lessons")
        .select("*")
        .eq("review_status", "draft")
        .order("created_at", { ascending: false }),
      supabase
        .from("questions")
        .select("*")
        .eq("review_status", "draft")
        .order("created_at", { ascending: false }),
      supabase
        .from("flashcards")
        .select("*")
        .eq("review_status", "draft")
        .order("created_at", { ascending: false }),
    ]);

    const items: ReviewDraftItem[] = [
      ...(lessons.data ?? []).map((row) => mapLessonRow(row)),
      ...(questions.data ?? []).map((row) => mapQuestionRow(row)),
    ];

    const flashcardGroups = new Map<string, Record<string, unknown>[]>();
    for (const row of flashcards.data ?? []) {
      const key = `${row.trade_id}:${row.created_at?.slice(0, 16) ?? row.id}`;
      const group = flashcardGroups.get(key) ?? [];
      group.push(row);
      flashcardGroups.set(key, group);
    }
    for (const group of flashcardGroups.values()) {
      items.push(mapFlashcardRows(group, String(group[0].trade_id)));
    }

    return items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const drafts = await readDraftFile();
  return drafts
    .filter((item) => item.review_status === "draft")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export async function updateDraftStatus(
  id: string,
  content_type: DraftContentType,
  status: "approved" | "rejected",
  related_ids?: string[],
): Promise<boolean> {
  if (useSupabaseDrafts()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();
    const table =
      content_type === "lesson"
        ? "lessons"
        : content_type === "question"
          ? "questions"
          : "flashcards";

    const ids =
      content_type === "flashcard" && related_ids?.length
        ? related_ids
        : [id];

    const { error } = await supabase
      .from(table)
      .update({ review_status: status })
      .in("id", ids);
    if (error) throw error;
    return true;
  }

  const drafts = await readDraftFile();
  const index = drafts.findIndex((item) => item.id === id);
  if (index === -1) return false;
  drafts[index].review_status = status;
  await writeDraftFile(drafts);
  return true;
}

export async function fetchApprovedLessonsFromDrafts(
  tradeId: string,
): Promise<
  Array<{
    id: string;
    trade_id: string;
    title: string;
    slug: string;
    summary?: string;
    content_blocks: ContentBlock[];
    sort_order: number;
    code_version?: string;
    review_status: ReviewStatus;
    estimated_minutes: number;
  }>
> {
  if (useSupabaseDrafts()) return [];
  const drafts = await readDraftFile();
  return drafts
    .filter(
      (item) =>
        item.content_type === "lesson" &&
        item.trade_id === tradeId &&
        item.review_status === "approved",
    )
    .map((item, index) => {
      const lesson = item.payload as GeneratedLesson;
      return {
        id: item.id,
        trade_id: item.trade_id,
        title: lesson.title,
        slug: slugify(lesson.title),
        summary: lesson.summary,
        content_blocks: lesson.content_blocks as ContentBlock[],
        sort_order: 100 + index,
        code_version: item.code_version,
        review_status: "approved" as const,
        estimated_minutes: lesson.estimated_minutes,
      };
    });
}
