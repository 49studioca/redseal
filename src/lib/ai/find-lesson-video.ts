import OpenAI from "openai";
import type { BlockMediaVideo } from "@/data/block-media";

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 20_000,
      maxRetries: 1,
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY?.trim() || null;

type VideoBrief = {
  searchQuery: string;
  altQueries?: string[];
  titleHint: string;
};

type SearchHit = {
  youtubeId: string;
  title: string;
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
  }
  return parts.join("\n");
}

function fallbackBrief(input: {
  title: string;
  summary?: string;
  tradeName?: string;
}): VideoBrief {
  const topic = truncate(
    [input.tradeName, input.title].filter(Boolean).join(" "),
    80,
  );
  return {
    searchQuery: `${topic} tutorial`,
    altQueries: [
      `${input.title} electrician`,
      `${input.title} how to`,
      "electrical trade training",
    ],
    titleHint: input.title,
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

async function generateVideoBrief(input: {
  title: string;
  summary?: string;
  contentText: string;
  tradeName?: string;
  currentTitle?: string;
}): Promise<VideoBrief> {
  if (!openrouter) return fallbackBrief(input);

  const systemPrompt = `You help find a YouTube training video for a Canadian Red Seal trade lesson.
Return JSON only:
{
  "searchQuery": "4-8 word YouTube search query",
  "altQueries": ["broader alternate query", "another synonym query"],
  "titleHint": "short expected video title theme"
}

Rules:
- Prefer practical how-to / demo videos for apprentices
- Include trade context (electrician, plumbing, welding, etc.) when helpful
- Prefer Canadian / CEC / Red Seal wording when relevant
- Avoid music, ads, movie clips, and unrelated entertainment
- No commas in searchQuery`;

  const userPrompt = `Trade: ${input.tradeName ?? "trades"}
Lesson title: ${input.title}
Summary: ${input.summary ?? ""}
${input.currentTitle ? `Current video title (replace this): ${input.currentTitle}` : ""}

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
      "OpenRouter video brief",
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return fallbackBrief(input);

    const parsed = JSON.parse(content) as Partial<VideoBrief> & {
      altQueries?: unknown;
    };
    const searchQuery = String(parsed.searchQuery ?? "").trim();
    const titleHint = String(parsed.titleHint ?? "").trim();
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
      titleHint: titleHint || input.title,
    };
  } catch {
    return fallbackBrief(input);
  }
}

function normalizeQueries(primary: string, altQueries: string[] = []): string[] {
  const clean = (value: string) =>
    value.replace(/[,"']/g, " ").replace(/\s+/g, " ").trim();
  return [primary, ...altQueries]
    .map(clean)
    .filter((q, i, arr) => q.length >= 3 && arr.indexOf(q) === i)
    .slice(0, 6);
}

function scoreVideoTitle(title: string, query: string, titleHint: string): number {
  const hay = title.toLowerCase();
  const terms = `${query} ${titleHint}`
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 1;
  }
  if (/\b(music|official video|trailer|movie|gameplay|asmr)\b/i.test(title)) {
    score -= 8;
  }
  if (/\b(how to|tutorial|training|install|wiring|electrician|plumbing|welding)\b/i.test(title)) {
    score += 2;
  }
  return score;
}

async function searchYouTubeDataApi(
  query: string,
  excludeId?: string,
): Promise<SearchHit[]> {
  if (!YOUTUBE_API_KEY) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("q", query);
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`YouTube API search failed (${res.status})`);
  }

  const data = (await res.json()) as {
    items?: {
      id?: { videoId?: string };
      snippet?: { title?: string };
    }[];
  };

  return (data.items ?? [])
    .map((item) => ({
      youtubeId: item.id?.videoId?.trim() ?? "",
      title: item.snippet?.title?.trim() ?? "",
    }))
    .filter(
      (hit) =>
        hit.youtubeId.length === 11 &&
        hit.title &&
        hit.youtubeId !== excludeId,
    );
}

async function searchPiped(
  query: string,
  excludeId?: string,
): Promise<SearchHit[]> {
  const instances = [
    "https://api.piped.private.coffee",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.kavin.rocks",
  ];

  for (const base of instances) {
    try {
      const url = new URL("/search", base);
      url.searchParams.set("q", query);
      url.searchParams.set("filter", "videos");

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        items?: {
          type?: string;
          url?: string;
          title?: string;
        }[];
      };

      const hits = (data.items ?? [])
        .filter((item) => item.type === "stream" || !!item.url)
        .map((item) => {
          const match = String(item.url ?? "").match(/[?&]v=([\w-]{11})|\/watch\/([\w-]{11})|\/([\w-]{11})$/);
          const youtubeId = match?.[1] || match?.[2] || match?.[3] || "";
          return {
            youtubeId,
            title: String(item.title ?? "").trim(),
          };
        })
        .filter(
          (hit) =>
            hit.youtubeId.length === 11 &&
            hit.title &&
            hit.youtubeId !== excludeId,
        )
        .slice(0, 8);

      if (hits.length) return hits;
    } catch {
      // try next instance
    }
  }

  return [];
}

async function searchInvidious(
  query: string,
  excludeId?: string,
): Promise<SearchHit[]> {
  const instances = [
    "https://yewtu.be",
    "https://vid.puffyan.us",
    "https://invidious.fdn.fr",
  ];

  for (const base of instances) {
    try {
      const url = new URL("/api/v1/search", base);
      url.searchParams.set("q", query);
      url.searchParams.set("type", "video");

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        type?: string;
        videoId?: string;
        title?: string;
      }[];

      const hits = (Array.isArray(data) ? data : [])
        .filter((item) => item.type === "video" || !!item.videoId)
        .map((item) => ({
          youtubeId: String(item.videoId ?? "").trim(),
          title: String(item.title ?? "").trim(),
        }))
        .filter(
          (hit) =>
            hit.youtubeId.length === 11 &&
            hit.title &&
            hit.youtubeId !== excludeId,
        )
        .slice(0, 8);

      if (hits.length) return hits;
    } catch {
      // try next instance
    }
  }

  return [];
}

async function searchVideos(
  query: string,
  excludeId?: string,
): Promise<SearchHit[]> {
  const fromApi = await searchYouTubeDataApi(query, excludeId);
  if (fromApi.length) return fromApi;

  const fromPiped = await searchPiped(query, excludeId);
  if (fromPiped.length) return fromPiped;

  return searchInvidious(query, excludeId);
}

export async function findLessonVideoFromContent(input: {
  title: string;
  summary?: string;
  contentBlocks?: {
    type?: string;
    content?: string;
    meta?: Record<string, unknown>;
  }[];
  contentText?: string;
  tradeName?: string;
  currentYoutubeId?: string;
  currentTitle?: string;
}): Promise<BlockMediaVideo> {
  const contentText =
    input.contentText?.trim() ||
    lessonTextFromBlocks(input.contentBlocks ?? []) ||
    [input.title, input.summary].filter(Boolean).join("\n");

  const brief = await generateVideoBrief({
    title: input.title,
    summary: input.summary,
    contentText,
    tradeName: input.tradeName,
    currentTitle: input.currentTitle,
  });

  const queries = normalizeQueries(brief.searchQuery, brief.altQueries ?? []);
  let best: SearchHit | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const query of queries) {
    const hits = await searchVideos(query, input.currentYoutubeId);
    for (const hit of hits) {
      const score = scoreVideoTitle(hit.title, query, brief.titleHint);
      if (score > bestScore) {
        best = hit;
        bestScore = score;
      }
    }
    if (best && bestScore >= 3) break;
  }

  if (!best) {
    throw new Error(
      `No YouTube video found for “${brief.searchQuery}”. Try again or paste a YouTube URL.`,
    );
  }

  return {
    youtubeId: best.youtubeId,
    title: best.title,
  };
}
