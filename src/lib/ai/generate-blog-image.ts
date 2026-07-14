import OpenAI from "openai";
import {
  uploadBlogImageBytes,
  decodeBase64Image,
} from "@/lib/storage/upload-blog-image";
import { uploadLessonImageFromUrl } from "@/lib/storage/upload-lesson-image";
import { hasJinaApiKey, searchJinaImages } from "@/lib/ai/jina-search";
import { findLessonImageFromContent } from "@/lib/ai/find-lesson-image";

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 60_000,
      maxRetries: 1,
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

/**
 * Image-generation model on OpenRouter (returns images via chat completions
 * with image output modality), e.g. "google/gemini-2.5-flash-image-preview".
 * Left unset by default so we fall back to sourced imagery with existing keys.
 */
const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL;

export interface BlogImageResult {
  src: string;
  alt: string;
  source: "generated" | "sourced";
}

type ChatImageResponse = {
  choices?: {
    message?: {
      images?: { image_url?: { url?: string } }[];
    };
  }[];
};

type ImageQuery = {
  searchQueries: string[];
  scenePrompt: string;
  alt: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/**
 * Ask the model for a concrete, photo-worthy subject that matches the article —
 * a real jobsite/trade scene rather than an abstract topic phrase. This is what
 * makes the sourced cover actually relevant to the content.
 */
async function buildImageQuery(input: {
  title: string;
  summary?: string;
  contentText?: string;
  keywords?: string[];
  tradeName?: string;
}): Promise<ImageQuery> {
  const fallback: ImageQuery = {
    searchQueries: [
      [input.tradeName, "tradesperson working"].filter(Boolean).join(" ").trim() ||
        "canadian tradesperson working",
    ],
    scenePrompt: `A Canadian ${input.tradeName ?? "skilled trades"} professional at work, related to "${input.title}".`,
    alt: input.title.slice(0, 120),
  };

  if (!openrouter) return fallback;

  try {
    const response = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `You choose a cover photo for a Canadian skilled-trades blog article.
Return the real, photo-worthy SUBJECT of an image that fits the article — a concrete jobsite scene, tool, equipment, or worker action — NOT an abstract phrase like "exam tips" or "career growth".
Return VALID JSON only:
{
  "searchQueries": ["2-4 word photo subject", "a broader alternate subject", "one more fallback subject"],
  "scenePrompt": "one vivid sentence describing an ideal photorealistic cover image (subject, setting, no text/logos)",
  "alt": "short accessible alt text for the chosen image"
}
Rules:
- Subjects must be things a stock/Commons photo would actually show (e.g. "electrician wiring panel", "welder mig welding", "plumber pipe wrench").
- Prefer the specific trade when known; otherwise a generic Canadian trades/jobsite scene.
- No commas inside a single search query; no site names, years, or file extensions.`,
        },
        {
          role: "user",
          content: `Trade: ${input.tradeName ?? "Canadian skilled trades"}
Title: ${input.title}
${input.summary ? `Summary: ${input.summary}` : ""}
${input.keywords?.length ? `Keywords: ${input.keywords.join(", ")}` : ""}

Content excerpt:
${(input.contentText ?? "").slice(0, 1800)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const parsed = JSON.parse(
      response.choices[0]?.message?.content ?? "{}",
    ) as Partial<ImageQuery>;

    const queries = Array.isArray(parsed.searchQueries)
      ? parsed.searchQueries
          .map((q) => String(q).replace(/[,"']/g, " ").replace(/\s+/g, " ").trim())
          .filter((q) => q.length >= 3)
          .slice(0, 4)
      : [];

    if (!queries.length) return fallback;

    return {
      searchQueries: queries,
      scenePrompt: String(parsed.scenePrompt ?? "").trim() || fallback.scenePrompt,
      alt: String(parsed.alt ?? "").trim() || fallback.alt,
    };
  } catch {
    return fallback;
  }
}

async function hostRemoteImage(
  sourceUrl: string,
  slugHint: string,
): Promise<string | null> {
  try {
    return await uploadLessonImageFromUrl({
      sourceUrl,
      storagePath: `blog/${slugify(slugHint) || "cover"}/${Date.now().toString(36)}.jpg`,
    });
  } catch {
    return null;
  }
}

/**
 * Generate a cover image from the article content. Prefers a true text-to-image
 * model when OPENROUTER_IMAGE_MODEL is configured; otherwise sources a relevant,
 * hosted photo using a content-aware search subject — so the cover actually
 * matches what the article is about.
 */
export async function generateBlogCoverImage(input: {
  title: string;
  prompt?: string;
  summary?: string;
  contentText?: string;
  keywords?: string[];
  tradeName?: string;
  slugHint: string;
}): Promise<BlogImageResult> {
  const query = await buildImageQuery({
    title: input.title,
    summary: input.summary,
    contentText: input.contentText,
    keywords: input.keywords,
    tradeName: input.tradeName,
  });

  const alt = query.alt || input.title.slice(0, 120);

  // 1) True text-to-image generation when a model is configured.
  if (openrouter && IMAGE_MODEL) {
    try {
      const scene = input.prompt?.trim() || query.scenePrompt;
      const response = (await openrouter.chat.completions.create({
        model: IMAGE_MODEL,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: `Create a high-quality, photorealistic 16:9 editorial cover image for a Canadian skilled-trades blog. No text, no logos, no watermarks. Scene: ${scene}`,
          },
        ],
      } as Parameters<typeof openrouter.chat.completions.create>[0])) as unknown as ChatImageResponse;

      const url = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (url?.startsWith("data:")) {
        const { bytes, contentType } = decodeBase64Image(url);
        const hosted = await uploadBlogImageBytes({
          bytes,
          contentType,
          slugHint: input.slugHint,
        });
        return { src: hosted, alt, source: "generated" };
      }
      if (url) {
        const hosted = await hostRemoteImage(url, input.slugHint);
        if (hosted) return { src: hosted, alt, source: "generated" };
      }
    } catch {
      // Fall through to sourced imagery.
    }
  }

  // 2) Content-aware image search (Jina) using concrete photo subjects.
  if (hasJinaApiKey()) {
    for (const q of query.searchQueries) {
      try {
        const hits = await searchJinaImages(q, { num: 8, gl: "ca", hl: "en" });
        const hit = hits[0];
        if (hit?.url) {
          const hosted = await hostRemoteImage(hit.url, input.slugHint);
          return {
            src: hosted ?? hit.url,
            alt: hit.title && hit.title.length > 3 ? hit.title.slice(0, 120) : alt,
            source: "sourced",
          };
        }
      } catch {
        // Try the next query, then fall through.
      }
    }
  }

  // 3) Last resort: reuse the lesson image finder (Wikimedia-first) with the
  // best content-derived subject as the search seed.
  const image = await findLessonImageFromContent({
    title: query.searchQueries[0] || input.title,
    summary: input.summary,
    contentText: input.contentText,
    tradeName: input.tradeName ?? "Canadian skilled trades",
    mediaKey: `blog-${input.slugHint}`,
    host: true,
  });

  return {
    src: image.src,
    alt: image.alt || alt,
    source: "sourced",
  };
}
