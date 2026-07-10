export type FormattedRuleBlock =
  | { type: "title"; text: string }
  | { type: "subrule"; number: string; text: string }
  | { type: "item"; letter: string; text: string }
  | { type: "paragraph"; text: string };

/** Strip CSA PDF footer / license noise that often trails extracted rule text. */
export function stripPdfNoise(text: string): string {
  let cleaned = text
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const cutMarkers = [
    /\bMarch\s+20\d{2}\b/i,
    /\b©\s*20\d{2}\b/,
    /\bCanadian Standards Association\b/i,
    /\bLicensed\s+t[oO]\b/i,
    /\bProvided by Orderline\b/i,
    /\bSingle user license only\b/i,
    /\bReproduction,\s*distribution,\s*storage\b/i,
    /\bCSA\s+C22\.1\b/i,
  ];

  let cutAt = cleaned.length;
  for (const marker of cutMarkers) {
    const match = marker.exec(cleaned);
    if (match?.index != null && match.index > 40 && match.index < cutAt) {
      cutAt = match.index;
    }
  }
  cleaned = cleaned.slice(0, cutAt).trim();

  // Trailing decorative junk: "c,. . ... -" etc.
  cleaned = cleaned
    .replace(/[\s.,■—\-–]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned;
}

/**
 * Pull a clean section title from chunk metadata or the start of the body.
 * Avoids titles that are just the first subrule fragment.
 */
export function cleanSectionTitle(
  ruleNumber: string | undefined,
  sectionTitle: string | undefined,
  content: string,
): string | null {
  const body = stripPdfNoise(content);
  const withoutRule = ruleNumber
    ? body.replace(new RegExp(`^${escapeRegExp(ruleNumber)}\\s*`), "")
    : body;

  const fromContent = withoutRule.match(
    /^([A-Z][A-Za-z0-9 ,/\-()]{3,100}?)(?=\s+\d+\)|\s*$)/,
  )?.[1]?.trim();

  let title = (sectionTitle ?? "").trim();
  // Drop titles that are truncated mid-subrule or start with "1)"
  if (
    !title ||
    /^\d+\)/.test(title) ||
    title.length > 100 ||
    /\s+\d+\)\s*$/.test(title) ||
    title.toLowerCase().startsWith("the ")
  ) {
    title = fromContent ?? "";
  } else {
    // Trim trailing "1)" leftovers from ingest titles
    title = title.replace(/\s+\d+\)\s*.*$/, "").trim();
  }

  if (!title || title.length < 3) return null;
  return title;
}

export function formatRuleContent(
  content: string,
  ruleNumber?: string,
): FormattedRuleBlock[] {
  let text = stripPdfNoise(content);
  if (!text) return [];

  if (ruleNumber) {
    text = text.replace(new RegExp(`^${escapeRegExp(ruleNumber)}\\s*`), "");
  }

  // Remove leading title (we'll show it separately)
  text = text
    .replace(/^([A-Z][A-Za-z0-9 ,/\-()]{3,100}?)(?=\s+\d+\))/, "")
    .trim();

  // Split on subrules "1)" "2)" and items "a)" "b)" while keeping delimiters.
  const parts = text.split(/(?=\b\d+\)\s)|(?=\b[a-z]\)\s)/);
  const blocks: FormattedRuleBlock[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const subrule = trimmed.match(/^(\d+)\)\s*([\s\S]+)$/);
    if (subrule) {
      blocks.push({
        type: "subrule",
        number: subrule[1]!,
        text: tidySentence(subrule[2]!),
      });
      continue;
    }

    const item = trimmed.match(/^([a-z])\)\s*([\s\S]+)$/);
    if (item) {
      blocks.push({
        type: "item",
        letter: item[1]!,
        text: tidySentence(item[2]!),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: tidySentence(trimmed) });
  }

  return blocks;
}

function tidySentence(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([.!?])\s*$/, "$1")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
