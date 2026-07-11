/** Strip YouTube SERP suffixes from video titles (e.g. "… - YouTube"). */
export function cleanYoutubeTitle(title: string): string {
  return title
    .replace(/\s*[-|–—]\s*YouTube(?:\s+Music)?\s*$/i, "")
    .replace(/\s*\(\s*YouTube\s*\)\s*$/i, "")
    .trim();
}

function toSentenceCase(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Split Jina/YouTube SERP snippets into readable bullet points. */
export function parseVideoDescriptionBullets(raw: string): string[] {
  const cleaned = raw
    .replace(/\s*[-|–—]\s*YouTube(?:\s+Music)?\s*$/i, "")
    .replace(/\.\.\./g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];

  const parts = cleaned
    .split(/\s*(?:\d+\.\s+)|(?<=\?)\s*(?=\d+\.\s+)/)
    .map((part) => part.replace(/^\d+\.\s*/, "").trim())
    .filter((part) => part.length >= 12);

  const unique = [...new Set(parts.map((p) => toSentenceCase(p)))];

  if (unique.length >= 2) return unique.slice(0, 6);

  if (cleaned.length >= 20 && cleaned.length <= 280 && !/\d+\.\s/.test(cleaned)) {
    return [toSentenceCase(cleaned)];
  }

  return [];
}

export function formatVideoDescription(raw?: string | null): {
  bullets: string[];
  summary: string | null;
} {
  if (!raw?.trim()) {
    return { bullets: [], summary: null };
  }

  const bullets = parseVideoDescriptionBullets(raw);
  if (bullets.length) {
    return { bullets, summary: null };
  }

  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.length < 20 || cleaned.length > 400) {
    return { bullets: [], summary: null };
  }

  return { bullets: [], summary: toSentenceCase(cleaned) };
}
