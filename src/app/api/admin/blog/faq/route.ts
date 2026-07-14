import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { generateBlogFaq } from "@/lib/ai/generate-blog";
import { htmlToPlainText } from "@/lib/blog/utils";

export const maxDuration = 120;

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json(
      { error: "Add a title before generating an FAQ." },
      { status: 400 },
    );
  }

  const contentText = body.content_html
    ? htmlToPlainText(String(body.content_html)).slice(0, 6000)
    : undefined;

  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean)
    : typeof body.keywords === "string"
      ? body.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

  try {
    const faq = await generateBlogFaq({
      title,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      contentText,
      keywords,
      tradeContext: body.tradeContext ? String(body.tradeContext) : undefined,
    });
    return NextResponse.json({ faq });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "FAQ generation failed" },
      { status: 500 },
    );
  }
}
