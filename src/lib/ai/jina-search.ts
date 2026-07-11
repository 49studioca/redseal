/**
 * Jina Search API helpers for lesson media discovery.
 * Images: POST https://svip.jina.ai/ { type: "images" }
 * Videos: web search scoped to YouTube, then extract video IDs.
 *
 * Requires JINA_API_KEY (https://jina.ai/?sui=apikey).
 */

import { cleanYoutubeTitle } from "@/lib/youtube/title";
import { isYoutubeShortVideo } from "@/lib/youtube/shorts";

function getJinaApiKey(): string | null {
  return process.env.JINA_API_KEY?.trim() || null;
}

const JINA_SEARCH_URLS = [
  "https://svip.jina.ai/",
  "https://s.jina.ai/",
] as const;

export type JinaImageHit = {
  url: string;
  title: string;
  sourceUrl?: string;
  description?: string;
};

export type JinaVideoHit = {
  youtubeId: string;
  title: string;
  url: string;
  description?: string;
};

export function hasJinaApiKey(): boolean {
  return Boolean(getJinaApiKey());
}

function authHeaders(): HeadersInit {
  const apiKey = getJinaApiKey();
  if (!apiKey) {
    throw new Error(
      "JINA_API_KEY is not set. Get a key at https://jina.ai/?sui=apikey",
    );
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function collectResultRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  if (!root) return [];

  const candidates = [root.data, root.results, root.items];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => Boolean(row));
    }
  }

  // Some responses nest under data.results
  const data = asRecord(root.data);
  if (data) {
    for (const key of ["results", "items", "images"] as const) {
      const nested = data[key];
      if (Array.isArray(nested)) {
        return nested
          .map((row) => asRecord(row))
          .filter((row): row is Record<string, unknown> => Boolean(row));
      }
    }
  }

  return [];
}

function extractImageUrl(row: Record<string, unknown>): string {
  const directKeys = [
    "imageUrl",
    "image_url",
    "thumbnailUrl",
    "thumbnail_url",
    "thumbnail",
    "image",
    "url",
  ];
  for (const key of directKeys) {
    const value = asString(row[key]);
    if (/^https?:\/\//i.test(value) && !/\.(html?|php|asp)(\?|$)/i.test(value)) {
      // Prefer bitmap-looking URLs; still allow CDN paths without extensions.
      return value;
    }
  }

  const images = row.images;
  if (Array.isArray(images)) {
    for (const entry of images) {
      if (typeof entry === "string" && /^https?:\/\//i.test(entry)) return entry;
      const rec = asRecord(entry);
      if (!rec) continue;
      for (const key of ["url", "src", "imageUrl", "image_url"]) {
        const value = asString(rec[key]);
        if (/^https?:\/\//i.test(value)) return value;
      }
    }
  }
  if (images && typeof images === "object") {
    for (const value of Object.values(images as Record<string, unknown>)) {
      if (typeof value === "string" && /^https?:\/\//i.test(value)) return value;
    }
  }

  return "";
}

function isUsableImageUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/\.svg(\?|$)/i.test(url)) return false;
  if (/\.(pdf|html?|xml)(\?|$)/i.test(url)) return false;
  if (/\/wiki\/File:/i.test(url)) return false;
  // Skip tiny icons / tracking pixels when obvious from path.
  if (/\b(favicon|sprite|icon-?\d*x\d*|1x1|pixel)\b/i.test(url)) return false;
  return true;
}

function scoreImageHit(hit: JinaImageHit, query: string): number {
  const hay = `${hit.title} ${hit.description ?? ""} ${hit.url} ${hit.sourceUrl ?? ""}`.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 2;
  }
  if (/commons\.wikimedia\.org|upload\.wikimedia\.org/i.test(hit.url)) score += 4;
  if (/commons\.wikimedia\.org/i.test(hit.sourceUrl ?? "")) score += 3;
  if (/\b(stock|shutterstock|getty|istock|alamy|dreamstime)\b/i.test(hay)) {
    score -= 3;
  }
  if (/\b(logo|meme|cartoon|clipart)\b/i.test(hay)) score -= 4;
  return score;
}

async function jinaPost(
  body: Record<string, unknown>,
  extraHeaders?: HeadersInit,
): Promise<unknown> {
  let lastError: Error | null = null;

  for (const endpoint of JINA_SEARCH_URLS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...authHeaders(), ...(extraHeaders ?? {}) },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        lastError = new Error(`Jina search failed (${res.status}) at ${endpoint}`);
        // Try next endpoint on 404/405; otherwise surface auth/quota errors.
        if (res.status === 401 || res.status === 403 || res.status === 429) {
          throw lastError;
        }
        continue;
      }
      return await res.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (/401|403|429/.test(lastError.message)) throw lastError;
    }
  }

  throw lastError ?? new Error("Jina search failed");
}

export async function searchJinaImages(
  query: string,
  options?: { num?: number; gl?: string; hl?: string },
): Promise<JinaImageHit[]> {
  if (!getJinaApiKey()) return [];

  const payload = await jinaPost({
    q: query,
    type: "images",
    num: options?.num ?? 8,
    gl: options?.gl ?? "ca",
    hl: options?.hl ?? "en",
  });

  const rows = collectResultRows(payload);
  const hits: JinaImageHit[] = [];

  for (const row of rows) {
    const url = extractImageUrl(row);
    if (!url || !isUsableImageUrl(url)) continue;
    hits.push({
      url,
      title: asString(row.title) || asString(row.name) || query,
      sourceUrl:
        asString(row.sourceUrl) ||
        asString(row.source_url) ||
        asString(row.pageUrl) ||
        asString(row.page_url) ||
        undefined,
      description:
        asString(row.description) ||
        asString(row.content) ||
        asString(row.snippet) ||
        undefined,
    });
  }

  return hits
    .map((hit) => ({ hit, score: scoreImageHit(hit, query) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.hit);
}

export function extractYoutubeId(value: string): string | null {
  const trimmed = value.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const embed = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
      if (embed?.[1]) return embed[1];
    }
  } catch {
    // not a URL
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );
  return match?.[1] ?? null;
}

function scoreVideoHit(hit: JinaVideoHit, query: string): number {
  const hay = `${hit.title} ${hit.description ?? ""}`.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 1;
  }
  if (/\b(how to|tutorial|training|install|demo|explained)\b/i.test(hit.title)) {
    score += 2;
  }
  if (/\b(music|official video|trailer|movie|gameplay|asmr|lyrics)\b/i.test(hit.title)) {
    score -= 8;
  }
  if (/\b(shorts|#shorts)\b/i.test(hay)) {
    score -= 20;
  }
  return score;
}

export async function searchJinaYoutubeVideos(
  query: string,
  options?: { num?: number; excludeId?: string; excludeShorts?: boolean },
): Promise<JinaVideoHit[]> {
  if (!getJinaApiKey()) return [];

  const excludeShorts = options?.excludeShorts !== false;
  const baseQuery = /\byoutube\b/i.test(query)
    ? query
    : `${query} site:youtube.com`;
  const searchQuery =
    excludeShorts && !/\b-shorts\b/i.test(baseQuery)
      ? `${baseQuery} -shorts`
      : baseQuery;

  const payload = await jinaPost(
    {
      q: searchQuery,
      num: options?.num ?? 12,
      gl: "ca",
      hl: "en",
    },
    {
      // Keep SERP lean — we only need titles/URLs for YouTube IDs.
      "X-Retain-Images": "none",
    },
  );

  const rows = collectResultRows(payload);
  const hits: JinaVideoHit[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const url =
      asString(row.url) ||
      asString(row.link) ||
      asString(row.sourceUrl) ||
      asString(row.source_url);
    const youtubeId = url ? extractYoutubeId(url) : null;
    if (!youtubeId) continue;
    if (options?.excludeId && youtubeId === options.excludeId) continue;
    if (seen.has(youtubeId)) continue;

    const title = cleanYoutubeTitle(asString(row.title) || query);
    const description =
      asString(row.description) ||
      asString(row.content) ||
      asString(row.snippet) ||
      undefined;

    if (excludeShorts && isYoutubeShortVideo(url, title, description)) {
      continue;
    }

    seen.add(youtubeId);

    hits.push({
      youtubeId,
      title,
      url,
      description,
    });
  }

  return hits
    .map((hit) => ({ hit, score: scoreVideoHit(hit, query) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.hit);
}
