import type { BlogFaqItem } from "@/types";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Strip HTML tags to plain text (server-safe, no DOM). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Roughly 220 words per minute; always at least 1 minute. */
export function estimateReadingMinutes(html: string): number {
  const words = htmlToPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const FAQ_HEADING_RE =
  /^(frequently\s+asked\s+questions|faqs?|q\s*&\s*a|questions?\s+(?:and|&)\s+answers)\b/i;

/**
 * Remove an inline "Frequently Asked Questions" section from article HTML so it
 * isn't duplicated when we render the structured `faq` block separately. Cuts
 * from the FAQ heading up to the next heading of the same or higher level (or
 * the end of the document).
 */
export function stripInlineFaqSection(html: string): string {
  if (!html) return html;

  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { index: number; level: number; text: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    headings.push({
      index: match.index,
      level: Number(match[1]),
      text: match[2].replace(/<[^>]+>/g, "").replace(/&amp;/gi, "&").trim(),
    });
  }

  for (let i = 0; i < headings.length; i++) {
    if (!FAQ_HEADING_RE.test(headings[i].text)) continue;
    const start = headings[i].index;
    const level = headings[i].level;
    let end = html.length;
    for (let j = i + 1; j < headings.length; j++) {
      if (headings[j].level <= level) {
        end = headings[j].index;
        break;
      }
    }
    return (html.slice(0, start) + html.slice(end)).trim();
  }

  return html;
}

/**
 * Allowlist sanitizer for admin/AI-authored HTML. TipTap output is already
 * schema-constrained, but AI-generated HTML can contain anything, so we strip
 * scripts, styles, event handlers, and dangerous URL schemes before storing.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "del", "mark", "small", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  span: new Set(["class"]),
  div: new Set(["class"]),
  code: new Set(["class"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.startsWith("javascript:") || v.startsWith("data:") || v.startsWith("vbscript:")) {
    // Allow data: images only.
    return v.startsWith("data:image/");
  }
  return true;
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let html = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|textarea|select)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|textarea|select)[^>]*\/?\s*>/gi, "");

  // Remove any tag not in the allowlist, and strip disallowed attributes.
  html = html.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (match, closing, rawTag, rawAttrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag];
    let attrs = "";
    if (allowed) {
      const attrRe = /([a-zA-Z0-9:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let m: RegExpExecArray | null;
      while ((m = attrRe.exec(rawAttrs)) !== null) {
        const name = m[1].toLowerCase();
        const value = m[3] ?? m[4] ?? "";
        if (name.startsWith("on")) continue;
        if (!allowed.has(name)) continue;
        if ((name === "href" || name === "src") && !isSafeUrl(value)) continue;
        attrs += ` ${name}="${value.replace(/"/g, "&quot;")}"`;
      }
    }
    // Force external links to be safe.
    if (tag === "a" && /href="https?:\/\//i.test(attrs) && !/rel=/.test(attrs)) {
      attrs += ' rel="noopener noreferrer"';
    }
    const selfClosing = tag === "img" || tag === "br" || tag === "hr";
    return `<${tag}${attrs}${selfClosing ? " /" : ""}>`;
  });

  return html.trim();
}

export function normalizeFaq(value: unknown): BlogFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item as Record<string, unknown>;
      const question = String(record?.question ?? "").trim();
      const answer = String(record?.answer ?? "").trim();
      return { question, answer };
    })
    .filter((item) => item.question && item.answer)
    .slice(0, 12);
}
