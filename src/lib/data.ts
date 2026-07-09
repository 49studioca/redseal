import {
  TRADES,
  ALL_BLOCKS,
  SAMPLE_FLASHCARDS,
  REFERENCE_CHUNKS,
  REFERENCE_DOCS,
  PROVINCIAL_GUIDES,
  TRADE_GENERATION_PROFILES,
  getTradeById,
  getBlocksForTrade,
  getQuestionsForTrade,
  getLessonsForTrade,
  getFlashcardsForTrade,
} from "@/data/seed";
import type { Trade, RsosBlock, Question, Lesson, Flashcard, ReferenceChunk, ReferenceDoc, ProvincialGuide } from "@/types";
import {
  buildPdfPageUrl,
  getSeedReferenceDoc,
  resolveReferenceDocPdfUrl,
} from "@/lib/reference/reference-pdf";
import {
  enrichQuestionsForProvince,
  resolveLessonsForProvince,
  resolveQuestionsForProvince,
} from "@/lib/content/province-content";
import { enrichLessonWithTaskCode } from "@/lib/content/lesson-structure";

import { usesSupabaseData } from "@/lib/supabase/config";

const useSupabase = () => usesSupabaseData();

export async function fetchTrades(): Promise<Trade[]> {
  if (!useSupabase()) return TRADES;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("trades").select("*").order("name");
  return (data as Trade[]) ?? TRADES;
}

export async function fetchTradeBySlug(slug: string): Promise<Trade | null> {
  if (!useSupabase()) return TRADES.find((t) => t.slug === slug) ?? null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("trades").select("*").eq("slug", slug).single();
  return (data as Trade) ?? null;
}

export async function fetchBlocks(tradeId: string): Promise<RsosBlock[]> {
  if (!useSupabase()) return getBlocksForTrade(tradeId);
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsos_blocks")
    .select("*")
    .eq("trade_id", tradeId)
    .order("sort_order");
  return (data as RsosBlock[]) ?? [];
}

export async function fetchQuestions(
  tradeId: string,
  filters?: {
    blockId?: string;
    type?: string;
    limit?: number;
    province?: string | null;
    tradeCode?: string;
  },
): Promise<Question[]> {
  if (!useSupabase()) return [];
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("review_status", "approved");
  if (filters?.blockId) query = query.eq("block_id", filters.blockId);
  if (filters?.type) query = query.eq("question_type", filters.type);
  const { data } = await query;
  let questions = (data as Question[]) ?? [];
  questions = resolveQuestionsForProvince(questions, filters?.province);
  if (filters?.tradeCode) {
    questions = enrichQuestionsForProvince(
      questions,
      tradeId,
      filters.tradeCode,
      filters.province,
    );
  }
  if (filters?.limit) questions = questions.slice(0, filters.limit);
  return questions;
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  if (!useSupabase()) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("questions").select("*").eq("id", id).single();
  return (data as Question) ?? null;
}

export async function fetchLessons(
  tradeId: string,
  province?: string | null,
): Promise<Lesson[]> {
  if (!useSupabase()) return [];
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("review_status", "approved")
    .order("sort_order");
  return resolveLessonsForProvince((data as Lesson[]) ?? [], province).map(
    enrichLessonWithTaskCode,
  );
}

export async function fetchFlashcards(
  tradeId: string,
  province?: string | null,
): Promise<Flashcard[]> {
  if (!useSupabase()) return [];
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("flashcards")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("review_status", "approved");

  const cards = (data as Flashcard[]) ?? [];
  if (!province) return cards.filter((card) => !card.province);

  const provincial = cards.filter((card) => card.province === province);
  const national = cards.filter((card) => !card.province);
  return provincial.length > 0 ? provincial : national;
}

function filterSeedReferenceChunks(
  query: string,
  codeVersion?: string,
): ReferenceChunk[] {
  const q = query.toLowerCase();
  return REFERENCE_CHUNKS.filter(
    (c) =>
      c.content.toLowerCase().includes(q) ||
      c.rule_number?.toLowerCase().includes(q) ||
      c.section_title?.toLowerCase().includes(q),
  ).filter((c) => !codeVersion || c.code_version === codeVersion);
}

function findSeedChunkByRuleNumber(
  ruleNumber: string,
  codeVersion?: string,
): ReferenceChunk | null {
  const normalized = ruleNumber.toLowerCase();
  return (
    REFERENCE_CHUNKS.find(
      (c) =>
        c.rule_number?.toLowerCase() === normalized &&
        (!codeVersion || c.code_version === codeVersion),
    ) ?? null
  );
}

export async function fetchReferenceDoc(
  docId: string,
): Promise<ReferenceDoc | null> {
  const seedDoc =
    REFERENCE_DOCS.find((doc) => doc.id === docId) ??
    getSeedReferenceDoc(docId);

  if (!useSupabase()) return seedDoc;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("reference_docs")
    .select("id, title, doc_type, code_version, storage_path")
    .eq("id", docId)
    .maybeSingle();

  if (!data) return seedDoc;

  return {
    id: data.id,
    title: data.title,
    doc_type: data.doc_type,
    code_version: data.code_version,
    storage_path: data.storage_path ?? seedDoc?.storage_path ?? null,
  };
}

export async function getReferencePdfViewUrl(
  docId: string,
  pageNumber?: number,
): Promise<{ url: string; title: string; page: number | null } | null> {
  const doc = await fetchReferenceDoc(docId);
  if (!doc) return null;

  const baseUrl = resolveReferenceDocPdfUrl(doc);
  if (!baseUrl) return null;

  const page = pageNumber && pageNumber > 0 ? pageNumber : null;
  return {
    url: buildPdfPageUrl(baseUrl, page ?? undefined),
    title: doc.title,
    page,
  };
}

function ruleNumberCandidates(ruleNumber: string): string[] {
  const normalized = ruleNumber.trim();
  const candidates = [normalized];
  // Lesson text often cites clauses like 8-102(1)(a); chunks may store 8-102.
  const base = normalized.replace(/\(.*$/, "").trim();
  if (base && base !== normalized) candidates.push(base);
  return candidates;
}

function preferIngestedChunk(
  chunks: ReferenceChunk[],
): ReferenceChunk | null {
  if (chunks.length === 0) return null;
  const scored = [...chunks].sort((a, b) => {
    const score = (c: ReferenceChunk) => {
      const meta = c.metadata as { source?: string } | undefined;
      const ingested = meta?.source === "ingest-cec-section" ? 1000 : 0;
      return ingested + (c.content?.length ?? 0);
    };
    return score(b) - score(a);
  });
  return scored[0] ?? null;
}

export async function lookupReferenceChunkByRuleNumber(
  ruleNumber: string,
  codeVersion?: string,
): Promise<ReferenceChunk | null> {
  const candidates = ruleNumberCandidates(ruleNumber);
  const seedMatch =
    candidates
      .map((c) => findSeedChunkByRuleNumber(c, codeVersion))
      .find(Boolean) ?? null;

  if (!useSupabase()) return seedMatch;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  let dbQuery = supabase
    .from("reference_chunks")
    .select("*")
    .in("rule_number", candidates)
    .limit(10);
  if (codeVersion) dbQuery = dbQuery.eq("code_version", codeVersion);
  const { data } = await dbQuery;
  const dbChunks = (data as ReferenceChunk[] | null) ?? [];

  // Prefer ingested / longer excerpts over short seed stubs, even if the
  // lesson cites a clause like 8-102(1)(a) and we only stored 8-102.
  const preferred = preferIngestedChunk(dbChunks);
  if (preferred) return preferred;

  return seedMatch;
}

export async function searchReferenceChunks(
  query: string,
  codeVersion?: string
): Promise<ReferenceChunk[]> {
  const seedResults = filterSeedReferenceChunks(query, codeVersion);

  if (!useSupabase()) {
    return seedResults;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  let dbQuery = supabase
    .from("reference_chunks")
    .select("*")
    .or(`content.ilike.%${query}%,rule_number.ilike.%${query}%,section_title.ilike.%${query}%`)
    .limit(20);
  if (codeVersion) dbQuery = dbQuery.eq("code_version", codeVersion);
  const { data } = await dbQuery;
  const dbResults = (data as ReferenceChunk[]) ?? [];

  const seen = new Set(
    dbResults.map((chunk) => chunk.rule_number?.toLowerCase()).filter(Boolean),
  );
  const merged = [...dbResults];
  for (const chunk of seedResults) {
    const key = chunk.rule_number?.toLowerCase();
    if (key && !seen.has(key)) merged.push(chunk);
  }
  return merged;
}

export async function fetchProvincialGuides(tradeSlug: string): Promise<ProvincialGuide[]> {
  const trade = TRADES.find((t) => t.slug === tradeSlug);
  if (!trade) return [];
  if (!useSupabase()) return PROVINCIAL_GUIDES.filter((g) => g.trade_id === trade.id);
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("provincial_guides")
    .select("*")
    .eq("trade_id", trade.id)
    .eq("published", true);
  return (data as ProvincialGuide[]) ?? [];
}

export async function fetchProvincialGuide(
  tradeSlug: string,
  provinceSlug: string
): Promise<ProvincialGuide | null> {
  const trade = TRADES.find((t) => t.slug === tradeSlug);
  if (!trade) return null;
  if (!useSupabase()) {
    return (
      PROVINCIAL_GUIDES.find(
        (g) => g.trade_id === trade.id && g.slug === provinceSlug
      ) ?? null
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("provincial_guides")
    .select("*")
    .eq("trade_id", trade.id)
    .eq("slug", provinceSlug)
    .single();
  return (data as ProvincialGuide) ?? null;
}

export async function getUserProfile(userId: string) {
  if (!useSupabase()) {
    return {
      id: userId,
      email: "demo@redsealguide.com",
      full_name: "Demo User",
      selected_trade_id: "trade-309a",
      subscription_tier: "free" as const,
      onboarding_completed: true,
      is_admin: true,
      province: "ON",
    };
  }
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function getTradeGenerationProfile(tradeId: string) {
  if (useSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("trade_generation_profiles")
      .select("*")
      .eq("trade_id", tradeId)
      .maybeSingle();
    if (data) {
      return {
        glossary: data.glossary as Record<string, string>,
        code_standards: data.code_standards as string[],
        calculation_templates: data.calculation_templates as string[],
        distractor_patterns: data.distractor_patterns as string[],
      };
    }
  }
  return TRADE_GENERATION_PROFILES[tradeId as keyof typeof TRADE_GENERATION_PROFILES] ?? null;
}

export { getTradeById, getBlocksForTrade, TRADES, ALL_BLOCKS };
