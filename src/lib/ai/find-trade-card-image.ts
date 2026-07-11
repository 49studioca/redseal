import type { Trade } from "@/types";
import { hasJinaApiKey, searchJinaImages, type JinaImageHit } from "@/lib/ai/jina-search";
import { TRADE_CARD_IMAGE_WIDTH } from "@/lib/storage/trade-card-image-spec";
import {
  normalizeTradeCardSourceUrl,
  uploadTradeCardImageFromUrl,
} from "@/lib/storage/upload-trade-card-image";

const WIKIMEDIA_USER_AGENT =
  process.env.LESSON_IMAGE_SYNC_USER_AGENT ??
  "RedSealGuide/1.0 (trade card image search; contact: admin@redsealguide.ca)";

const MIN_TRADE_CARD_SCORE = 2;

const HISTORICAL_OR_ART_RE =
  /\b(century|medieval|miniature|psalter|painting|illustration|drawing|engraving|woodcut|manuscript|fresco|altarpiece|annunciation|saint|statue|sculpture|museum art|historic portrait|antique|depiction|tempera|oil on canvas|watercolor|sketch|cartoon|anime|meme|logo|clipart|icon|avatar|diploma|certificate|exam|textbook|screenshot|djvu|magazine|volume|weird tales|miniature in)\b/i;

const OLD_STYLE_OR_BW_RE =
  /\b(black.?and.?white|black & white|b&w|monochrome|sepia|grayscale|grey.?scale|greyscale|vintage|old fashioned|old-fashioned|archival|archives?|historical photo|old photo|antique photo|daguerreotype|nitrate negative|18\d{2}|19\d{2}|wwi|wwii|world war|edwardian|victorian)\b/i;

const GUIDE_OR_VIDEO_RE =
  /\b(youtube|how to become|complete guide|guide on|tutorial|exam prep|study guide|course promo|webinar|podcast|thumbnail|video thumbnail|watch now|subscribe|shortage of|high paying jobs)\b/i;

const GUIDE_OR_VIDEO_URL_RE =
  /ytimg\.com|youtube\.com|youtu\.be|vimeocdn\.com|vimeo\.com|macleans\.|\/_next\/image/i;

const MODERN_TRADE_RE =
  /\b(red seal|tradesperson|tradespeople|apprentice|journeyman|workshop|worksite|on the job|at work|commercial|industrial|vocational|training|technician|mechanic|installer|construction site|factory|plant|shop|kitchen|bakery|garage|job site|photograph|photo of|worker|working|occupation|equipment|maintenance|install)\b/i;

const CANADA_RE =
  /\b(canada|canadian|ontario|quebec|alberta|british columbia|\bbc\b|manitoba|saskatchewan|nova scotia|new brunswick|newfoundland|toronto|vancouver|calgary|edmonton|montreal|ottawa|winnipeg)\b/i;

const NON_CANADA_LOCATION_RE =
  /\b(united states|\busa\b|u\.s\.|seattle|california|texas|florida|geograph\.org\.uk|england|wales|scotland|\buk\b|united kingdom|australia|new zealand|whitefriargate)\b/i;

const WIKIMEDIA_EXCLUDE =
  "-miniature -painting -illustration -century -medieval -manuscript -engraving -psalter -monochrome -sepia -grayscale -blackwhite";

/** Related visual terms per trade slug — helps match real trade photos, not name-only hits. */
const TRADE_VISUAL_TERMS: Record<string, string[]> = {
  baker: ["bakery", "bread", "pastry", "dough", "oven", "baking", "commercial kitchen"],
  "industrial-electrician": [
    "electrical panel",
    "motor control",
    "industrial plant",
    "factory electrical",
    "PLC",
    "conduit",
  ],
  "construction-electrician": [
    "electrical wiring",
    "conduit",
    "electrical panel",
    "residential wiring",
    "commercial electrical",
    "cable tray",
  ],
  plumber: ["plumbing", "copper pipe", "drain", "water supply", "pipefitter"],
  welder: ["welding", "arc weld", "fabrication shop", "steel weld"],
  carpenter: [
    "framing",
    "wood frame",
    "formwork",
    "carpentry",
    "lumber",
    "construction framing",
    "building frame",
    "finish carpentry",
  ],
  cook: ["commercial kitchen", "restaurant kitchen", "chef cooking", "line cook"],
  hairstylist: ["hair salon", "barber shop", "stylist"],
  boilermaker: ["boiler", "pressure vessel", "steel fabrication"],
  millwright: ["industrial machinery", "conveyor", "alignment", "machine shop"],
};

const IRRELEVANT_SUBJECT_RE =
  /\b(notice|sign|plaque|information board|street view|aerial view|map|diagram|chart|brochure|poster|banner|logo)\b/i;

function termMatches(hay: string, term: string): boolean {
  const normalized = term.toLowerCase().trim();
  if (normalized.length < 4) return false;
  const re = new RegExp(
    `\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "i",
  );
  return re.test(hay);
}

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function descriptionKeywords(description: string): string[] {
  const stop = new Set([
    "using",
    "other",
    "while",
    "their",
    "various",
    "systems",
    "materials",
    "equipment",
    "specialized",
    "settings",
    "facilities",
  ]);
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !stop.has(w))
    .slice(0, 6);
}

function tradeMatchTerms(trade: Pick<Trade, "name" | "description" | "slug">): string[] {
  const fromName = trade.name
    .toLowerCase()
    .replace(/[&/()]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4);

  const fromDesc = descriptionKeywords(trade.description ?? "");
  const fromVisual = TRADE_VISUAL_TERMS[trade.slug] ?? [];

  return [...new Set([...fromName, ...fromDesc, ...fromVisual])];
}

/**
 * Search phrases for modern color Red Seal trade photos in Canada.
 */
export function buildTradeCardSearchQueries(
  trade: Pick<Trade, "name" | "description" | "slug">,
): string[] {
  const activity = trade.description?.split(/[,.—]/)[0]?.trim() ?? "";
  const shortActivity = activity.split(/\s+/).slice(0, 8).join(" ");
  const visual = TRADE_VISUAL_TERMS[trade.slug] ?? [];
  const primaryVisual = visual[0] ?? trade.name.split(/\s+/)[0]?.toLowerCase() ?? "";
  const descWords = descriptionKeywords(trade.description ?? "").slice(0, 3).join(" ");

  const queries = [
    `Canadian ${trade.name} ${primaryVisual} modern color worksite photo`.trim(),
    `${trade.name} ${shortActivity} Canada construction site color photo`.trim(),
    `Red Seal ${trade.name} tradesperson Canada`.trim(),
    `${primaryVisual} construction site Canada photograph`.trim(),
    `${trade.name} ${visual[0] ?? primaryVisual} Canada job site`.trim(),
    ...(trade.slug === "carpenter"
      ? [
          "carpenter framing lumber construction Canada",
          "Canadian carpenter wood frame house construction",
          "carpenter lumber framing Canada worksite",
          "finish carpenter trim work Canada",
        ]
      : []),
    ...(trade.slug === "construction-electrician"
      ? [
          "construction electrician wiring conduit Canada",
          "Canadian electrician residential commercial wiring",
          "electrical panel installation Canada construction",
          "electrician cable tray Canada worksite",
        ]
      : []),
    `${descWords} ${primaryVisual} Canadian tradesperson`.trim(),
    `${trade.name} tradesperson on the job Canada`,
    ...visual.slice(0, 4).map((term) => `${term} ${trade.name} Canada photograph`),
  ];

  return [...new Set(queries.map((q) => truncate(q, 96)).filter((q) => q.length >= 8))];
}

export function scoreTradeCardImageText(
  text: string,
  trade: Pick<Trade, "name" | "description" | "slug">,
): number {
  const hay = text.toLowerCase();
  const terms = tradeMatchTerms(trade);

  let score = 0;
  let termHits = 0;
  for (const term of terms) {
    if (termMatches(hay, term)) {
      score += 3;
      termHits += 1;
    }
  }

  if (MODERN_TRADE_RE.test(hay)) score += 4;
  if (CANADA_RE.test(hay)) score += 6;
  if (/\bred seal\b/i.test(hay)) score += 3;
  if (/\b(photograph|photo|jpg|jpeg|dpla|occupation)\b/i.test(hay)) score += 2;
  if (NON_CANADA_LOCATION_RE.test(hay) && !CANADA_RE.test(hay)) score -= 10;

  if (HISTORICAL_OR_ART_RE.test(hay)) score -= 20;
  if (OLD_STYLE_OR_BW_RE.test(hay)) score -= 18;
  if (GUIDE_OR_VIDEO_RE.test(hay)) score -= 15;
  if (GUIDE_OR_VIDEO_URL_RE.test(hay)) score -= 15;
  if (IRRELEVANT_SUBJECT_RE.test(hay)) score -= 10;
  if (/\b(19\d{2}|historical photo|archive photo|smith tower)\b/i.test(hay)) score -= 8;
  if (/\b(stock photo|shutterstock|getty|istock|alamy|dreamstime|depositphotos)\b/i.test(hay)) {
    score -= 6;
  }

  // Trade name alone (e.g. "carpenter" in a YouTube guide title) is not enough.
  if (termHits <= 1 && /\bred seal\b/i.test(hay) && !MODERN_TRADE_RE.test(hay)) {
    score -= 6;
  }

  return score;
}

function hasTradeVisualMatch(
  text: string,
  trade: Pick<Trade, "name" | "description" | "slug">,
): boolean {
  const hay = text.toLowerCase();
  const visual = TRADE_VISUAL_TERMS[trade.slug] ?? [];
  if (visual.some((term) => termMatches(hay, term))) return true;

  const tradeWords = trade.name
    .toLowerCase()
    .replace(/[&/()]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 5);
  if (tradeWords.some((word) => termMatches(hay, word))) return true;

  return false;
}

function isOldStyleOrBlackWhite(text: string): boolean {
  return OLD_STYLE_OR_BW_RE.test(text);
}

function isRejectedTradeCardMedia(text: string, url = ""): boolean {
  if (isHistoricalOrArt(text)) return true;
  if (isOldStyleOrBlackWhite(text)) return true;
  if (GUIDE_OR_VIDEO_RE.test(text)) return true;
  if (GUIDE_OR_VIDEO_URL_RE.test(url) || GUIDE_OR_VIDEO_URL_RE.test(text)) return true;
  if (IRRELEVANT_SUBJECT_RE.test(text)) return true;
  return false;
}

function scoreJinaHit(hit: JinaImageHit, trade: Pick<Trade, "name" | "description" | "slug">): number {
  let score = scoreTradeCardImageText(
    `${hit.title} ${hit.description ?? ""} ${hit.url}`,
    trade,
  );
  if (/commons\.wikimedia\.org|upload\.wikimedia\.org/i.test(hit.url)) score += 1;
  return score;
}

function scoreWikimediaTitle(
  title: string,
  trade: Pick<Trade, "name" | "description" | "slug">,
): number {
  const normalized = title.replace(/^File:/i, "").replace(/\.[^.]+$/, "");
  return scoreTradeCardImageText(normalized, trade);
}

function isHistoricalOrArt(text: string): boolean {
  return HISTORICAL_OR_ART_RE.test(text);
}

function pickAllScored<T extends { score: number; text: string; url?: string }>(
  ranked: T[],
  trade: Pick<Trade, "name" | "description" | "slug">,
  limit = 6,
): T[] {
  const picks: T[] = [];
  for (const entry of ranked) {
    if (isRejectedTradeCardMedia(entry.text, entry.url ?? entry.text)) continue;
    if (!hasTradeVisualMatch(entry.text, trade)) continue;
    if (entry.score < MIN_TRADE_CARD_SCORE) continue;
    picks.push(entry);
    if (picks.length >= limit) break;
  }
  return picks;
}

async function collectTradeCardImageCandidates(
  trade: Pick<Trade, "name" | "description" | "slug">,
): Promise<{ sourceUrl: string; alt: string }[]> {
  const seen = new Set<string>();
  const candidates: { sourceUrl: string; alt: string }[] = [];
  const add = (sourceUrl: string, alt: string) => {
    if (!sourceUrl || seen.has(sourceUrl)) return;
    seen.add(sourceUrl);
    candidates.push({ sourceUrl, alt });
  };

  const queries = buildTradeCardSearchQueries(trade);

  for (const query of queries) {
    const hits = await searchWikimediaFiles(query);
    if (!hits.length) continue;

    const ranked = hits.map((hit) => ({
      hit,
      score: scoreWikimediaTitle(hit.title, trade),
      text: hit.title,
    }));
    const infoByTitle = await getWikimediaImageInfo(ranked.map((entry) => entry.hit.title));
    const withLandscape = ranked
      .map((entry) => ({
        ...entry,
        score: entry.score + landscapeBonus(infoByTitle.get(entry.hit.title)),
      }))
      .sort((a, b) => b.score - a.score);

    for (const pick of pickAllScored(withLandscape, trade, 3)) {
      const info = infoByTitle.get(pick.hit.title);
      const mime = (info?.mime ?? "").toLowerCase();
      if (!info || !mime.startsWith("image/") || mime.includes("svg")) continue;
      const sourceUrl = info.thumburl || info.url;
      if (!sourceUrl) continue;
      add(
        sourceUrl,
        truncate(pick.hit.title.replace(/^File:/i, "").replace(/\.[^.]+$/, ""), 120),
      );
    }
    if (candidates.length >= 8) break;
  }

  if (!hasJinaApiKey()) return candidates;

  for (const query of queries) {
    try {
      const hits = await searchJinaImages(query, { num: 12, gl: "ca", hl: "en" });
      const ranked = hits
        .filter((hit) => normalizeTradeCardSourceUrl(hit.url) !== null)
        .map((hit) => ({
          hit,
          score: scoreJinaHit(hit, trade),
          text: `${hit.title} ${hit.description ?? ""} ${hit.url}`,
          url: hit.url,
        }))
        .sort((a, b) => b.score - a.score);

      for (const pick of pickAllScored(ranked, trade, 3)) {
        add(
          pick.hit.url,
          truncate(pick.hit.title || `${trade.name} Red Seal trade`, 120),
        );
      }
    } catch {
      // try next query
    }
    if (candidates.length >= 12) break;
  }

  return candidates;
}

export async function findTradeCardImageSource(
  trade: Pick<Trade, "name" | "description" | "slug">,
): Promise<{ sourceUrl: string; alt: string } | null> {
  const candidates = await collectTradeCardImageCandidates(trade);
  return candidates[0] ?? null;
}

export async function findAndHostTradeCardImage(
  trade: Pick<Trade, "name" | "description" | "slug">,
  options?: { supabase?: import("@supabase/supabase-js").SupabaseClient },
): Promise<{ src: string; alt: string; sourceUrl: string } | null> {
  const candidates = await collectTradeCardImageCandidates(trade);
  if (!candidates.length) return null;

  const storagePath = `trade-cards/${trade.slug}.jpg`;
  let lastError: Error | null = null;

  for (const found of candidates) {
    try {
      const src = await uploadTradeCardImageFromUrl({
        sourceUrl: found.sourceUrl,
        storagePath,
        supabase: options?.supabase,
      });
      return { src, alt: found.alt, sourceUrl: found.sourceUrl };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (!/rejected|black-and-white|grayscale|sepia/i.test(lastError.message)) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("No usable color trade card image found");
}
type WikimediaImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
  size?: number;
  width?: number;
  height?: number;
};

async function searchWikimediaFiles(
  query: string,
  limit = 12,
): Promise<WikimediaSearchHit[]> {
  const attempts = [
    `${query} Canada filetype:bitmap`,
    `${query} Canadian filetype:bitmap`,
    `${query} filetype:bitmap`,
    query,
    `${query} ${WIKIMEDIA_EXCLUDE}`.trim(),
  ];

  for (const srsearch of attempts) {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", srsearch);
    url.searchParams.set("srnamespace", "6");
    url.searchParams.set("srlimit", String(limit));
    url.searchParams.set("format", "json");

    const res = await fetch(url, {
      headers: { "User-Agent": WIKIMEDIA_USER_AGENT, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) continue;

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
  url.searchParams.set("iiprop", "url|mime|size|thumbmime|dimensions");
  url.searchParams.set("iiurlwidth", String(TRADE_CARD_IMAGE_WIDTH));
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { "User-Agent": WIKIMEDIA_USER_AGENT, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return new Map();

  const data = (await res.json()) as {
    query?: {
      pages?: Record<string, { title?: string; imageinfo?: WikimediaImageInfo[] }>;
    };
  };

  const map = new Map<string, WikimediaImageInfo>();
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (!page.title || !page.imageinfo?.[0]) continue;
    map.set(page.title, page.imageinfo[0]);
  }
  return map;
}

function landscapeBonus(info: WikimediaImageInfo | undefined): number {
  const w = info?.width ?? 0;
  const h = info?.height ?? 0;
  if (w < 1 || h < 1) return 0;
  const ratio = w / h;
  // Card slot is 16:10 (1.6) — favour landscape near that ratio.
  if (ratio >= 1.45 && ratio <= 1.85) return 4;
  if (ratio >= 1.2) return 2;
  if (ratio < 0.9) return -3;
  return 0;
}

type WikimediaSearchHit = { title: string; pageid: number };
