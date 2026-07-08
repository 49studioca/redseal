import {
  TRADES,
  ALL_BLOCKS,
  SAMPLE_FLASHCARDS,
  REFERENCE_CHUNKS,
  PROVINCIAL_GUIDES,
  TRADE_GENERATION_PROFILES,
  getTradeById,
  getBlocksForTrade,
  getQuestionsForTrade,
  getLessonsForTrade,
  getFlashcardsForTrade,
} from "@/data/seed";
import type { Trade, RsosBlock, Question, Lesson, Flashcard, ReferenceChunk, ProvincialGuide } from "@/types";
import {
  enrichQuestionsForProvince,
  resolveLessonsForProvince,
  resolveQuestionsForProvince,
} from "@/lib/content/province-content";

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
  return resolveLessonsForProvince((data as Lesson[]) ?? [], province);
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

export async function searchReferenceChunks(
  query: string,
  codeVersion?: string
): Promise<ReferenceChunk[]> {
  if (!useSupabase()) {
    const q = query.toLowerCase();
    return REFERENCE_CHUNKS.filter(
      (c) =>
        c.content.toLowerCase().includes(q) ||
        c.rule_number?.toLowerCase().includes(q) ||
        c.section_title?.toLowerCase().includes(q)
    ).filter((c) => !codeVersion || c.code_version === codeVersion);
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
  return (data as ReferenceChunk[]) ?? [];
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
