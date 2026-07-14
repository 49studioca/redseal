import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { normalizeFaq } from "@/lib/blog/utils";
import type { BlogPost, BlogPostInput } from "@/types";

const SELECT_COLUMNS =
  "id, slug, title, excerpt, content_html, content_json, cover_image_url, cover_image_alt, seo_title, seo_description, keywords, tags, category, trade_id, trade_slug, trade_name, canonical_url, og_image_url, faq, author_name, reading_minutes, status, featured, published_at, created_by, created_at, updated_at";

type BlogRow = Record<string, unknown>;

function mapRow(row: BlogRow): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    excerpt: (row.excerpt as string | null) ?? null,
    content_html: String(row.content_html ?? ""),
    content_json: (row.content_json as Record<string, unknown> | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    cover_image_alt: (row.cover_image_alt as string | null) ?? null,
    seo_title: (row.seo_title as string | null) ?? null,
    seo_description: (row.seo_description as string | null) ?? null,
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    category: (row.category as string | null) ?? null,
    trade_id: (row.trade_id as string | null) ?? null,
    trade_slug: (row.trade_slug as string | null) ?? null,
    trade_name: (row.trade_name as string | null) ?? null,
    canonical_url: (row.canonical_url as string | null) ?? null,
    og_image_url: (row.og_image_url as string | null) ?? null,
    faq: normalizeFaq(row.faq),
    author_name: String(row.author_name ?? "RedSealGuide Team"),
    reading_minutes: Number(row.reading_minutes ?? 3),
    status: row.status === "published" ? "published" : "draft",
    featured: Boolean(row.featured),
    published_at: (row.published_at as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

/** Public: published posts, newest first. Optionally filter by trade slug. */
export async function getPublishedPosts(
  limit = 50,
  tradeSlug?: string | null,
): Promise<BlogPost[]> {
  if (!usesSupabaseData()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("blog_posts")
      .select(SELECT_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (tradeSlug) {
      query = query.eq("trade_slug", tradeSlug);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  if (!usesSupabaseData()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");
    if (error || !data) return [];
    return data.map((row) => String(row.slug));
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  if (!usesSupabaseData()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SELECT_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
  } catch {
    return null;
  }
}

/** Related posts: same trade first, then shared tags/category. */
export async function getRelatedPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  const all = await getPublishedPosts(50);
  const scored = all
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const sameTrade =
        post.trade_slug && p.trade_slug === post.trade_slug ? 4 : 0;
      const bothGeneral = !post.trade_slug && !p.trade_slug ? 2 : 0;
      const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
      const sameCategory = p.category && p.category === post.category ? 1 : 0;
      return {
        post: p,
        score: sameTrade + bothGeneral + sharedTags * 2 + sameCategory,
      };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

/** Admin: every post (drafts included). Uses the service role. */
export async function listAllPostsForAdmin(): Promise<BlogPost[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getPostByIdForAdmin(id: string): Promise<BlogPost | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function slugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createServiceClient();
  let query = supabase.from("blog_posts").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

function inputToRow(
  input: BlogPostInput,
  trade: { trade_id: string | null; trade_slug: string | null; trade_name: string | null },
  createdBy?: string | null,
) {
  const now = new Date().toISOString();
  const publishing = input.status === "published";
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    content_html: input.content_html ?? "",
    content_json: input.content_json ?? null,
    cover_image_url: input.cover_image_url ?? null,
    cover_image_alt: input.cover_image_alt ?? null,
    seo_title: input.seo_title ?? null,
    seo_description: input.seo_description ?? null,
    keywords: input.keywords ?? [],
    tags: input.tags ?? [],
    category: input.category ?? null,
    trade_id: trade.trade_id,
    trade_slug: trade.trade_slug,
    trade_name: trade.trade_name,
    canonical_url: input.canonical_url ?? null,
    og_image_url: input.og_image_url ?? null,
    faq: input.faq ?? [],
    author_name: input.author_name ?? "RedSealGuide Team",
    reading_minutes: input.reading_minutes ?? 3,
    status: publishing ? "published" : "draft",
    featured: input.featured ?? false,
    published_at: publishing ? now : null,
    ...(createdBy ? { created_by: createdBy } : {}),
  };
}

export async function createPost(
  input: BlogPostInput,
  trade: { trade_id: string | null; trade_slug: string | null; trade_name: string | null },
  createdBy?: string | null,
): Promise<BlogPost> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(inputToRow(input, trade, createdBy))
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updatePost(
  id: string,
  input: BlogPostInput,
  trade: { trade_id: string | null; trade_slug: string | null; trade_name: string | null },
): Promise<BlogPost> {
  const supabase = await createServiceClient();
  // Preserve original published_at when a post is already published.
  const row = inputToRow(input, trade);
  if (input.status === "published") {
    const existing = await getPostByIdForAdmin(id);
    if (existing?.published_at) {
      row.published_at = existing.published_at;
    }
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .update(row)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
