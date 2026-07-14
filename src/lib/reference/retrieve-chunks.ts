import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReferenceChunk } from "@/types";
import { embedText, hasEmbeddingProvider } from "@/lib/ai/embeddings";

/**
 * RAG retrieval for content generation.
 *
 * Embeds the query (block/task scope) and pulls the most relevant reference
 * chunks from the DB via the match_reference_chunks pgvector RPC, scoped to the
 * given trade's reference docs plus any shared (trade_id IS NULL) code books.
 *
 * Returns [] when retrieval isn't possible (no OpenAI key, no docs, or error),
 * so callers can fall back to the static seed chunks.
 */
export async function retrieveReferenceChunks(
  supabase: SupabaseClient,
  input: {
    tradeCode: string;
    queryText: string;
    matchCount?: number;
    includeShared?: boolean;
  },
): Promise<ReferenceChunk[]> {
  if (!hasEmbeddingProvider()) return [];
  const query = input.queryText.trim();
  if (!query) return [];

  try {
    const docIds = await resolveTradeDocIds(
      supabase,
      input.tradeCode,
      input.includeShared ?? true,
    );
    if (docIds.length === 0) return [];

    const embedding = await embedText(query.slice(0, 7000));
    if (!embedding || embedding.length === 0) return [];

    const { data, error } = await supabase.rpc("match_reference_chunks", {
      query_embedding: embedding,
      match_count: input.matchCount ?? 8,
      filter_doc_ids: docIds,
    });
    if (error || !data) return [];

    return (data as MatchRow[]).map((row) => ({
      id: row.id,
      doc_id: row.doc_id,
      rule_number: row.rule_number ?? undefined,
      section_title: row.section_title ?? undefined,
      content: row.content,
      page_number: row.page_number ?? undefined,
      code_version: row.code_version,
      metadata: { source: "rag-retrieval", similarity: row.similarity },
    }));
  } catch {
    return [];
  }
}

async function resolveTradeDocIds(
  supabase: SupabaseClient,
  tradeCode: string,
  includeShared: boolean,
): Promise<string[]> {
  const { data: trade } = await supabase
    .from("trades")
    .select("id")
    .eq("code", tradeCode)
    .maybeSingle();
  const tradeId = trade?.id as string | undefined;

  const orFilters: string[] = [];
  if (tradeId) orFilters.push(`trade_id.eq.${tradeId}`);
  if (includeShared) orFilters.push("trade_id.is.null");
  if (orFilters.length === 0) return [];

  const { data, error } = await supabase
    .from("reference_docs")
    .select("id")
    .or(orFilters.join(","));
  if (error || !data) return [];
  return data.map((row) => row.id as string);
}

type MatchRow = {
  id: string;
  doc_id: string;
  rule_number: string | null;
  section_title: string | null;
  content: string;
  page_number: number | null;
  code_version: string;
  similarity: number;
};
