import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  deletePost,
  getPostByIdForAdmin,
  slugExists,
  updatePost,
} from "@/lib/blog/posts";
import { resolveBlogTradeScope } from "@/lib/blog/trades";
import {
  sanitizeHtml,
  slugify,
  estimateReadingMinutes,
  normalizeFaq,
} from "@/lib/blog/utils";
import type { BlogPostInput } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;
  try {
    const post = await getPostByIdForAdmin(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load post" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as Partial<BlogPostInput>;
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const contentHtml = sanitizeHtml(String(body.content_html ?? ""));

  let slug = slugify(body.slug || title) || `post-${Date.now().toString(36)}`;
  if (await slugExists(slug, id)) {
    let n = 2;
    let candidate = `${slug}-${n}`;
    while (await slugExists(candidate, id)) {
      candidate = `${slug}-${++n}`;
    }
    slug = candidate;
  }

  try {
    const trade = await resolveBlogTradeScope(body.trade_slug);
    const post = await updatePost(
      id,
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
    );
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;
  try {
    await deletePost(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete post" },
      { status: 500 },
    );
  }
}
