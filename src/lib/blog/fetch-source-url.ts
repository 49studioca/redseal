import { htmlToPlainText } from "@/lib/blog/utils";

const MAX_CHARS = 12_000;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_BYTES = 1_500_000;

export type FetchedSourcePage = {
  url: string;
  title: string;
  text: string;
};

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  // Block common private / link-local IPv4 ranges.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

export function parsePublicHttpUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error("Enter a valid http(s) URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https links are supported.");
  }
  if (isPrivateHostname(parsed.hostname)) {
    throw new Error("That link points to a private or local address.");
  }
  return parsed;
}

function truncate(text: string, max = MAX_CHARS): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

function titleFromHtml(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? htmlToPlainText(match[1] ?? "").slice(0, 200) : "";
}

async function fetchViaJinaReader(url: string): Promise<FetchedSourcePage | null> {
  const apiKey = process.env.JINA_API_KEY?.trim();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "text/plain",
        "X-Return-Format": "text",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = truncate(await res.text());
    if (text.length < 80) return null;
    const titleMatch = text.match(/^Title:\s*(.+)$/im);
    return {
      url,
      title: titleMatch?.[1]?.trim() ?? "",
      text,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDirect(url: string): Promise<FetchedSourcePage> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        "User-Agent":
          "RedSealGuideBot/1.0 (+https://redsealguide.com; admin blog research)",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Could not fetch the link (HTTP ${res.status}).`);
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType &&
      !/text\/html|application\/xhtml\+xml|text\/plain|text\/markdown/i.test(
        contentType,
      )
    ) {
      throw new Error("That link does not look like a readable web page.");
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      throw new Error("That page is too large to use as a source.");
    }
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const title = titleFromHtml(raw);
    const text = truncate(
      /text\/html|application\/xhtml\+xml/i.test(contentType) ||
        /<html[\s>]/i.test(raw)
        ? htmlToPlainText(raw)
        : raw,
    );
    if (text.length < 80) {
      throw new Error("Could not extract enough readable text from that link.");
    }
    return { url, title, text };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out while fetching the link.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch a public web page and return truncated plain text for AI grounding. */
export async function fetchSourcePage(rawUrl: string): Promise<FetchedSourcePage> {
  const parsed = parsePublicHttpUrl(rawUrl);
  const url = parsed.toString();

  const viaJina = await fetchViaJinaReader(url);
  if (viaJina) return viaJina;

  return fetchDirect(url);
}
