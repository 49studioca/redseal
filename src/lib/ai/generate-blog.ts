import OpenAI from "openai";
import type { BlogFaqItem } from "@/types";

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export interface GenerateBlogInput {
  topic: string;
  /** Optional angle/notes to steer the piece. */
  brief?: string;
  /** Optional target keyword(s) the piece should rank for. */
  targetKeywords?: string[];
  tradeContext?: string;
  audience?: string;
  /** Public URL whose content should inspire a related original article. */
  sourceUrl?: string;
  /** Extracted text from sourceUrl (fetched server-side). */
  sourceContent?: string;
  sourceTitle?: string;
}

export interface GeneratedBlogDraft {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  keywords: string[];
  tags: string[];
  category: string;
  content_html: string;
  cover_image_prompt: string;
  faq: BlogFaqItem[];
}

export function hasBlogAiProvider(): boolean {
  return Boolean(openrouter);
}

const SYSTEM_PROMPT = `You are a senior SEO content strategist and Red Seal trades subject-matter expert writing for RedSealGuide, an AI-powered Red Seal exam-prep platform for Canadian tradespeople.

Write ONE complete, publish-ready blog article optimized for how search and AI answer engines work in 2026 (Google SERP, AI Overviews, ChatGPT/Perplexity-style answer engines).

FOLLOW THESE 2026 SEO / GEO (Generative Engine Optimization) RULES:
- Demonstrate real E-E-A-T: concrete, accurate, Canadian trade-specific detail. Use Canadian codes/standards only (never US NEC/IPC/OSHA unless noting the Canadian equivalent).
- Answer-first: open with a direct 2-3 sentence answer to the core query so it is easily extractable as an AI snippet, then expand.
- Semantic structure: one clear topic per H2, short H3s under them, scannable paragraphs (2-4 sentences), and bullet/numbered lists where useful.
- Include a concise, quotable definition or key-takeaways list near the top.
- Cover the topic comprehensively to satisfy search intent and related follow-up questions.
- Use natural language and entities, not keyword stuffing. Weave the target keywords in naturally (title, first paragraph, at least one H2).
- Provide a short FAQ (3-6 Q&As) targeting real "People Also Ask"-style questions in the "faq" field ONLY.
- Do NOT include an FAQ / "Frequently Asked Questions" section inside content_html — the FAQ is rendered separately from the "faq" field. Never duplicate it in the body.
- Neutral, helpful, expert tone. No fluff, no hype, no invented statistics or fake citations.
- If a source link/excerpt is provided: write an ORIGINAL related article for RedSealGuide readers — expand, localize to Canadian Red Seal context, and add exam-prep value. Do NOT copy, paraphrase closely, or reproduce large passages. Treat the source as research inspiration only. Never invent claims the source does not support without clearly framing them as general guidance.

OUTPUT — return VALID JSON ONLY with this exact shape:
{
  "title": "Compelling, specific H1 (<= 65 chars ideally)",
  "slug": "kebab-case-url-slug",
  "excerpt": "1-2 sentence summary / dek (<= 200 chars)",
  "seo_title": "Search title tag (<= 60 chars), includes primary keyword",
  "seo_description": "Meta description (140-160 chars), compelling + primary keyword",
  "keywords": ["primary keyword", "secondary", "..."],
  "tags": ["short-tag", "..."],
  "category": "one of: Exam Prep, Study Tips, Trade Guides, Career, News",
  "content_html": "The full article body as clean semantic HTML. Use <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <em>, <blockquote>, <table> where helpful. Do NOT include an <h1> (the title renders separately). Do NOT include an FAQ / Frequently Asked Questions section here. Do NOT include <html>, <head>, <body>, <script>, or <style>.",
  "cover_image_prompt": "A vivid 1-sentence description of an ideal cover image for this article (subject, setting, style).",
  "faq": [{"question": "...", "answer": "..."}]
}`;

export async function generateBlogDraft(
  input: GenerateBlogInput,
): Promise<GeneratedBlogDraft> {
  if (!openrouter) {
    return mockBlogDraft(input);
  }

  const sourceBlock =
    input.sourceUrl || input.sourceContent
      ? `
Source link: ${input.sourceUrl ?? "(not provided)"}
${input.sourceTitle ? `Source page title: ${input.sourceTitle}` : ""}
Source excerpt (research only — write an original related article, do not copy):
---
${(input.sourceContent ?? "").slice(0, 10000) || "(no extractable text — infer topic from the URL and any notes above)"}
---`
      : "";

  const userPrompt = `Topic / working title: ${input.topic}
${input.brief ? `Angle / notes: ${input.brief}` : ""}
${input.targetKeywords?.length ? `Target keywords to rank for: ${input.targetKeywords.join(", ")}` : ""}
${input.tradeContext ? `Trade focus: ${input.tradeContext}` : "Scope: General Red Seal exam prep content for all Canadian trades (not limited to one trade)."}
Audience: ${input.audience ?? "Canadian apprentices and journeypersons preparing for Red Seal certification exams"}
${sourceBlock}

Write the article now. Aim for roughly 900-1400 words of genuinely useful content.`;

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content) as Partial<GeneratedBlogDraft> & {
    faq?: unknown;
  };

  return {
    title: String(parsed.title ?? input.topic).trim(),
    slug: String(parsed.slug ?? "").trim(),
    excerpt: String(parsed.excerpt ?? "").trim(),
    seo_title: String(parsed.seo_title ?? parsed.title ?? "").trim(),
    seo_description: String(parsed.seo_description ?? parsed.excerpt ?? "").trim(),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 12)
      : [],
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
      : [],
    category: String(parsed.category ?? "Exam Prep").trim(),
    content_html: String(parsed.content_html ?? "").trim(),
    cover_image_prompt: String(parsed.cover_image_prompt ?? input.topic).trim(),
    faq: Array.isArray(parsed.faq)
      ? (parsed.faq as unknown as Record<string, unknown>[])
          .map((f) => ({
            question: String(f?.question ?? "").trim(),
            answer: String(f?.answer ?? "").trim(),
          }))
          .filter((f) => f.question && f.answer)
          .slice(0, 8)
      : [],
  };
}

export async function generateBlogFaq(input: {
  title: string;
  excerpt?: string;
  contentText?: string;
  keywords?: string[];
  tradeContext?: string;
  count?: number;
}): Promise<BlogFaqItem[]> {
  const count = Math.min(Math.max(input.count ?? 5, 3), 8);

  if (!openrouter) {
    return [
      {
        question: `What should I know about ${input.title}?`,
        answer:
          "Set OPENROUTER_API_KEY to generate real, content-aware FAQ answers.",
      },
    ];
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `You write FAQ sections for a Canadian Red Seal trades blog, optimized for Google "People Also Ask" and AI answer engines (2026).
Rules:
- Generate exactly ${count} real questions a Canadian tradesperson would search, based on the article.
- Questions must be natural-language and distinct (no duplicates or trivial rephrasings).
- Answers: 1-3 sentences, direct and accurate, Canadian codes/standards only. No fluff, no invented statistics.
- Answers should be self-contained so they work as extractable AI snippets.
Return VALID JSON only: {"faq":[{"question":"...","answer":"..."}]}`,
      },
      {
        role: "user",
        content: `Article title: ${input.title}
${input.excerpt ? `Summary: ${input.excerpt}` : ""}
${input.tradeContext ? `Trade focus: ${input.tradeContext}` : "Scope: general Red Seal exam prep (all Canadian trades)."}
${input.keywords?.length ? `Keywords: ${input.keywords.join(", ")}` : ""}

Article content:
${(input.contentText ?? "").slice(0, 4000) || "(no body yet — base the FAQ on the title, summary, and keywords)"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const parsed = JSON.parse(
    response.choices[0]?.message?.content ?? "{}",
  ) as { faq?: Record<string, unknown>[] };

  return Array.isArray(parsed.faq)
    ? parsed.faq
        .map((f) => ({
          question: String(f?.question ?? "").trim(),
          answer: String(f?.answer ?? "").trim(),
        }))
        .filter((f) => f.question && f.answer)
        .slice(0, count)
    : [];
}

function mockBlogDraft(input: GenerateBlogInput): GeneratedBlogDraft {
  const title = input.topic || "Red Seal Exam Prep Guide";
  return {
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80),
    excerpt: `A practical guide to ${title.toLowerCase()} for Canadian tradespeople.`,
    seo_title: title.slice(0, 60),
    seo_description: `Learn about ${title.toLowerCase()} with RedSealGuide — set OPENROUTER_API_KEY to generate full AI content.`,
    keywords: [title.toLowerCase(), "red seal", "exam prep"],
    tags: ["exam-prep"],
    category: "Exam Prep",
    content_html: `<p><strong>Set OPENROUTER_API_KEY to generate real content.</strong> This is placeholder text for “${title}”.</p><h2>Overview</h2><p>Configure the AI provider and click “Generate with AI” again to produce a full, SEO-optimized article.</p>`,
    cover_image_prompt: `A Canadian tradesperson working, related to ${title}.`,
    faq: [
      {
        question: `What is ${title}?`,
        answer: "Configure the AI provider to generate a real answer.",
      },
    ],
  };
}
