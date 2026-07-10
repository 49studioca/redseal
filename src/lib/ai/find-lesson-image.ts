import OpenAI from "openai";
import type { BlockMediaImage } from "@/data/block-media";
import { uploadLessonImageFromUrl } from "@/lib/storage/upload-lesson-image";

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 20_000,
      maxRetries: 1,
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const WIKIMEDIA_USER_AGENT =
  process.env.LESSON_IMAGE_SYNC_USER_AGENT ??
  "RedSealGuide/1.0 (lesson image search; contact: admin@redsealguide.ca)";

type ImageBrief = {
  searchQuery: string;
  altQueries?: string[];
  alt: string;
  caption: string;
};

type WikimediaSearchHit = {
  title: string;
  pageid: number;
};

type WikimediaImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
  size?: number;
};

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function lessonTextFromBlocks(
  blocks: { type?: string; content?: string; meta?: Record<string, unknown> }[],
): string {
  const parts: string[] = [];
  for (const block of blocks) {
    const type = block.type ?? "";
    if (type === "video" || type === "image") continue;
    const content = typeof block.content === "string" ? block.content.trim() : "";
    if (content) parts.push(content);
    const caption =
      typeof block.meta?.caption === "string" ? block.meta.caption.trim() : "";
    if (caption) parts.push(caption);
  }
  return parts.join("\n");
}

function fallbackBrief(input: {
  title: string;
  summary?: string;
  tradeName?: string;
}): ImageBrief {
  const topic = truncate(
    [input.tradeName, input.title].filter(Boolean).join(" "),
    80,
  );
  return {
    searchQuery: topic || "industrial electrical equipment",
    altQueries: ["cable tray", "electrical conduit", "industrial equipment"],
    alt: truncate(input.title, 120),
    caption: truncate(
      input.summary || `Reference image for ${input.title}.`,
      200,
    ),
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateImageBrief(input: {
  title: string;
  summary?: string;
  contentText: string;
  tradeName?: string;
  currentAlt?: string;
}): Promise<ImageBrief> {
  if (!openrouter) {
    return fallbackBrief(input);
  }

  const systemPrompt = `You help find a Wikimedia Commons photo for a Canadian Red Seal trade lesson.
Return JSON only:
{
  "searchQuery": "2-4 word Commons search phrase with NO commas",
  "altQueries": ["shorter or broader alternate phrases", "another common synonym"],
  "alt": "short accessible alt text",
  "caption": "one sentence caption tied to the lesson topic"
}

Rules:
- Prefer names Wikimedia is likely to index (e.g. "unistrut", "cable tray", "proximity sensor") over narrow product phrases
- Prefer one specific trade object over listing several topics
- Prefer photo-worthy equipment over rare accessory names
- Do not include site names, years, or file extensions
- No people faces as the main subject when avoidable
- Canadian trade context when relevant`;

  const userPrompt = `Trade: ${input.tradeName ?? "trades"}
Lesson title: ${input.title}
Summary: ${input.summary ?? ""}
${input.currentAlt ? `Current image alt (replace this): ${input.currentAlt}` : ""}

Lesson content excerpt:
${truncate(input.contentText, 2500)}`;

  try {
    const response = await withTimeout(
      openrouter.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
      20_000,
      "OpenRouter image brief",
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return fallbackBrief(input);

    const parsed = JSON.parse(content) as Partial<ImageBrief> & {
      altQueries?: unknown;
    };
    const searchQuery = String(parsed.searchQuery ?? "").trim();
    const alt = String(parsed.alt ?? "").trim();
    const caption = String(parsed.caption ?? "").trim();
    const altQueries = Array.isArray(parsed.altQueries)
      ? parsed.altQueries
          .map((q) => String(q ?? "").trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];
    if (!searchQuery) return fallbackBrief(input);
    return {
      searchQuery,
      altQueries,
      alt: alt || fallbackBrief(input).alt,
      caption: caption || fallbackBrief(input).caption,
    };
  } catch {
    return fallbackBrief(input);
  }
}

async function searchWikimediaFiles(
  query: string,
  limit = 8,
): Promise<WikimediaSearchHit[]> {
  // Prefer bitmaps; fall back to unrestricted search if the filter yields nothing.
  const attempts = [`${query} filetype:bitmap`, query];

  for (const srsearch of attempts) {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", srsearch);
    url.searchParams.set("srnamespace", "6");
    url.searchParams.set("srlimit", String(limit));
    url.searchParams.set("format", "json");

    const res = await fetch(url, {
      headers: {
        "User-Agent": WIKIMEDIA_USER_AGENT,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new Error(`Wikimedia search failed (${res.status})`);
    }

    const data = (await res.json()) as {
      query?: { search?: WikimediaSearchHit[] };
    };
    const hits = data.query?.search ?? [];
    if (hits.length) return hits;
  }

  return [];
}

async function getWikimediaImageInfo(
  titles: string[],
): Promise<Map<string, WikimediaImageInfo>> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titles.join("|"));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size");
  url.searchParams.set("iiurlwidth", "1280");
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { "User-Agent": WIKIMEDIA_USER_AGENT, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Wikimedia imageinfo failed (${res.status})`);
  }

  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        { title?: string; imageinfo?: WikimediaImageInfo[] }
      >;
    };
  };

  const map = new Map<string, WikimediaImageInfo>();
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (!page.title || !page.imageinfo?.[0]) continue;
    map.set(page.title, page.imageinfo[0]);
  }
  return map;
}

function isUsableImage(
  info: WikimediaImageInfo,
  excludeUrls: Set<string>,
): boolean {
  const mime = (info.mime ?? "").toLowerCase();
  if (!mime.startsWith("image/")) return false;
  if (mime.includes("svg") || mime.includes("tiff")) return false;
  const candidate = info.thumburl || info.url;
  if (!candidate) return false;
  if (excludeUrls.has(candidate) || (info.url && excludeUrls.has(info.url))) {
    return false;
  }
  if ((info.size ?? 0) > 12_000_000) return false;
  return true;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Prefer short indexed terms before long phrases that mostly match unrelated PDFs/photos. */
function normalizeSearchQueries(
  primary: string,
  title: string,
  altQueries: string[] = [],
): string[] {
  const clean = (value: string) =>
    value.replace(/[,"']/g, " ").replace(/\s+/g, " ").trim();

  const cleanedPrimary = clean(primary);
  const words = cleanedPrimary.split(/\s+/).filter(Boolean);

  // Shortest first: "unistrut" before "unistrut support bracket"
  const progressive = words
    .map((_, i) => words.slice(0, i + 1).join(" "))
    .filter((q) => q.length >= 3);

  const fromCommas = primary
    .split(/[,;/|]+/)
    .map((part) => clean(part))
    .filter((part) => part.length >= 3 && part.length <= 60);

  const titleQuery = clean(title.replace(/[()]/g, " ")).slice(0, 80);
  const cleanedAlts = altQueries.map(clean).filter((q) => q.length >= 3);

  const synonymBoost: string[] = [];
  const joined = cleanedPrimary.toLowerCase();
  if (joined.includes("unistrut") || joined.includes("strut")) {
    synonymBoost.push("unistrut", "strut channel");
  }
  if (joined.includes("cable") && joined.includes("tray")) {
    synonymBoost.push("cable tray");
  }

  // Short branded/generic nouns first so we hit Commons-indexed terms early.
  return [
    ...progressive.filter((q) => q.split(/\s+/).length <= 2),
    ...synonymBoost,
    ...progressive,
    ...fromCommas,
    ...cleanedAlts,
    titleQuery,
  ]
    .filter((q, i, arr) => q.length >= 3 && arr.indexOf(q) === i)
    .slice(0, 10);
}

function scoreHitTitle(fileTitle: string, query: string): number {
  const title = fileTitle
    .replace(/^File:/i, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  if (!terms.length) return 0;

  // Trade synonyms Commons often uses instead of brand names.
  const aliases: Record<string, string[]> = {
    unistrut: ["unistrut", "strut", "strutchannel", "channel strut"],
    strut: ["strut", "unistrut", "strutchannel"],
    tray: ["tray", "cable tray"],
  };

  let score = 0;
  for (const term of terms) {
    const variants = aliases[term] ?? [term];
    if (variants.some((v) => title.includes(v))) score += 3;
  }

  // Prefer photos of equipment; demote documents / architecture stock.
  if (/\.pdf$/i.test(fileTitle)) score -= 10;
  if (/\b(balcony|museum|plaka|statue|painting)\b/i.test(title)) score -= 8;
  return score;
}

export async function findLessonImageFromContent(input: {
  title: string;
  summary?: string;
  contentBlocks?: {
    type?: string;
    content?: string;
    meta?: Record<string, unknown>;
  }[];
  contentText?: string;
  tradeName?: string;
  currentSrc?: string;
  currentAlt?: string;
  mediaKey?: string;
  /** When false, return the Wikimedia URL without uploading to storage. */
  host?: boolean;
}): Promise<BlockMediaImage> {
  const contentText =
    input.contentText?.trim() ||
    lessonTextFromBlocks(input.contentBlocks ?? []) ||
    [input.title, input.summary].filter(Boolean).join("\n");

  const brief = await generateImageBrief({
    title: input.title,
    summary: input.summary,
    contentText,
    tradeName: input.tradeName,
    currentAlt: input.currentAlt,
  });

  const excludeUrls = new Set<string>();
  if (input.currentSrc) excludeUrls.add(input.currentSrc);

  const queries = normalizeSearchQueries(
    brief.searchQuery,
    input.title,
    brief.altQueries ?? [],
  );

  let sourceUrl: string | null = null;

  for (const query of queries) {
    const hits = await searchWikimediaFiles(query);
    if (!hits.length) continue;

    const ranked = [...hits].sort(
      (a, b) => scoreHitTitle(b.title, query) - scoreHitTitle(a.title, query),
    );

    const infoByTitle = await getWikimediaImageInfo(
      ranked.map((h) => h.title),
    );

    const bestScore = scoreHitTitle(ranked[0]?.title ?? "", query);

    for (const hit of ranked) {
      const info = infoByTitle.get(hit.title);
      if (!info || !isUsableImage(info, excludeUrls)) continue;
      const score = scoreHitTitle(hit.title, query);

      // For distinctive product terms, require a positive relevance score.
      // Commons already ranked these results, so score 0 is still acceptable
      // only when nothing better scored positively.
      if (bestScore > 0 && score <= 0) continue;
      if (score < 0) continue;

      sourceUrl = info.thumburl || info.url || null;
      if (sourceUrl) break;
    }
    if (sourceUrl) break;
  }

  if (!sourceUrl) {
    throw new Error(
      `No Wikimedia image found for “${brief.searchQuery}”. Try again or paste an image URL.`,
    );
  }

  if (input.host === false) {
    return {
      src: sourceUrl,
      alt: brief.alt,
      caption: brief.caption,
    };
  }

  try {
    const storageKey = [
      "lesson-media/ai",
      slugify(input.mediaKey || input.title) || "lesson",
      `${Date.now().toString(36)}.jpg`,
    ].join("/");

    const hosted = await withTimeout(
      uploadLessonImageFromUrl({
        sourceUrl,
        storagePath: storageKey,
      }),
      45_000,
      "Image upload",
    );

    return {
      src: hosted,
      alt: brief.alt,
      caption: brief.caption,
    };
  } catch {
    // Still usable if hosting fails — lesson image component supports Wikimedia URLs.
    return {
      src: sourceUrl,
      alt: brief.alt,
      caption: brief.caption,
    };
  }
}
