import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { generateBlogDraft } from "@/lib/ai/generate-blog";
import {
  sanitizeHtml,
  slugify,
  estimateReadingMinutes,
  stripInlineFaqSection,
} from "@/lib/blog/utils";

export const maxDuration = 120;

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim();
  if (!topic) {
    return NextResponse.json(
      { error: "Enter a topic or working title." },
      { status: 400 },
    );
  }

  const targetKeywords = Array.isArray(body.targetKeywords)
    ? body.targetKeywords.map((k: unknown) => String(k).trim()).filter(Boolean)
    : typeof body.targetKeywords === "string"
      ? body.targetKeywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

  try {
    const draft = await generateBlogDraft({
      topic,
      brief: body.brief ? String(body.brief) : undefined,
      targetKeywords,
      tradeContext: body.tradeContext ? String(body.tradeContext) : undefined,
      audience: body.audience ? String(body.audience) : undefined,
    });

    // FAQ is stored/rendered as structured data, so keep it out of the body.
    const contentHtml = stripInlineFaqSection(sanitizeHtml(draft.content_html));

    return NextResponse.json({
      draft: {
        ...draft,
        slug: slugify(draft.slug || draft.title),
        content_html: contentHtml,
        reading_minutes: estimateReadingMinutes(contentHtml),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
