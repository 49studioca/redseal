import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { generateBlogCoverImage } from "@/lib/ai/generate-blog-image";
import { slugify, htmlToPlainText } from "@/lib/blog/utils";

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
      { error: "A title is required to generate an image." },
      { status: 400 },
    );
  }

  const contentText = body.content_html
    ? htmlToPlainText(String(body.content_html)).slice(0, 2500)
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
    const result = await generateBlogCoverImage({
      title,
      prompt: body.prompt ? String(body.prompt) : undefined,
      summary: body.excerpt ? String(body.excerpt) : undefined,
      contentText,
      keywords,
      tradeName: body.tradeName ? String(body.tradeName) : undefined,
      slugHint: slugify(body.slug || title),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Image generation failed",
      },
      { status: 500 },
    );
  }
}
