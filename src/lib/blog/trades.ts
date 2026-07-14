import { createServiceClient } from "@/lib/supabase/server";
import { TRADES } from "@/data/seed";

export { blogTradeLabel, isGeneralBlogPost } from "@/lib/blog/trade-label";

export type BlogTradeScope = {
  trade_id: string | null;
  trade_slug: string | null;
  trade_name: string | null;
};

/** Resolve a trade slug (from the admin picker) to DB + display fields. */
export async function resolveBlogTradeScope(
  tradeSlug: string | null | undefined,
): Promise<BlogTradeScope> {
  const slug = tradeSlug?.trim() || null;
  if (!slug) {
    return { trade_id: null, trade_slug: null, trade_name: null };
  }

  const seedTrade = TRADES.find((t) => t.slug === slug);
  if (!seedTrade) {
    throw new Error(`Unknown trade slug: ${slug}`);
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("trades")
      .select("id, slug, name")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) {
      return {
        trade_id: String(data.id),
        trade_slug: String(data.slug ?? slug),
        trade_name: String(data.name ?? seedTrade.name),
      };
    }
  } catch {
    // Fall through when DB trade row is missing (e.g. local mock).
  }

  return {
    trade_id: null,
    trade_slug: slug,
    trade_name: seedTrade.name,
  };
}
