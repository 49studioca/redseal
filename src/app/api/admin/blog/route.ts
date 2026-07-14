import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createPost, listAllPostsForAdmin, slugExists } from "@/lib/blog/posts";
import { resolveBlogTradeScope } from "@/lib/blog/trades";
import {
  sanitizeHtml,
  slugify,
  estimateReadingMinutes,
  normalizeFaq,
} from "@/lib/blog/utils";
import type { BlogPostInput } from "@/types";

export async function GET() {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const posts = await listAllPostsForAdmin();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load posts" },
      { status: 500 },
    );
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || `post-${Date.now().toString(36)}`;
  let candidate = root;
  let n = 2;
  while (await slugExists(candidate)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<BlogPostInput>;
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const contentHtml = sanitizeHtml(String(body.content_html ?? ""));
  const slug = await uniqueSlug(body.slug || title);

  try {
    const trade = await resolveBlogTradeScope(body.trade_slug);
    const post = await createPost(
      {
        slug,
        title,
        excerpt: body.excerpt ?? null,
        content_html: contentHtml,
        content_json: body.content_json ?? null,
        cover_image_url: body.cover_image_url ?? null,
        cover_image_alt: body.cover_image_alt ?? null,
        seo_title: body.seo_title ?? null,
        seo_description: body.seo_description ?? null,
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        category: body.category ?? null,
        trade_slug: trade.trade_slug,
        canonical_url: body.canonical_url ?? null,
        og_image_url: body.og_image_url ?? null,
        faq: normalizeFaq(body.faq),
        author_name: body.author_name || "RedSealGuide Team",
        reading_minutes:
          body.reading_minutes || estimateReadingMinutes(contentHtml),
        status: body.status === "published" ? "published" : "draft",
        featured: Boolean(body.featured),
      },
      trade,
      auth.userId === "demo-admin" ? null : auth.userId,
    );
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create post" },
      { status: 500 },
    );
  }
}
