/**
 * Extract the full CEC PDF into reference_chunks (all sections).
 *
 * Usage:
 *   npm run db:ingest-cec-full
 *   npm run db:ingest-cec-full -- --dry-run
 *   npm run db:ingest-cec-full -- --start=1 --end=200
 *   npm run db:ingest-cec-full -- --no-embed
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Optional: OPENAI_API_KEY (skipped with --no-embed; recommended for first full run)
 */
import { createHash } from "crypto";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "fs";
import { dirname, resolve } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { REFERENCE_DOC_CEC_ID, REFERENCE_DOCS } from "../src/data/seed";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile();

type Args = {
  start?: number;
  end?: number;
  dryRun: boolean;
  embed: boolean;
  batchSize: number;
  pageChunks: boolean;
  forceExtract: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dryRun: false,
    embed: false, // default off for full run (fast); pass --embed to enable
    batchSize: 40,
    pageChunks: true,
    forceExtract: false,
  };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--embed") args.embed = true;
    else if (arg === "--no-embed") args.embed = false;
    else if (arg === "--no-page-chunks") args.pageChunks = false;
    else if (arg === "--force-extract") args.forceExtract = true;
    else if (arg.startsWith("--start=")) args.start = Number(arg.slice("--start=".length));
    else if (arg.startsWith("--end=")) args.end = Number(arg.slice("--end=".length));
    else if (arg.startsWith("--batch=")) args.batchSize = Number(arg.slice("--batch=".length));
  }
  return args;
}

type PageText = { page: number; text: string };

type ExtractedChunk = {
  rule_number: string;
  section_title: string;
  content: string;
  page_number: number;
  kind: "rule" | "page";
};

const CACHE_PDF = resolve(process.cwd(), ".cache", "cec-2024.pdf");
const CACHE_PAGES = resolve(process.cwd(), ".cache", "cec-2024-pages.jsonl");
const STORAGE_PATH = "cec-2024.pdf";
const BUCKET = "references";
const CODE_VERSION = "CEC-2024";
const UPSERT_BATCH = 25;

function deterministicUuid(seed: string): string {
  const hex = createHash("sha1").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\u0000/g, "") // Postgres text rejects null bytes
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Known CEC Part I section numbers. Filters ISBN/TOC/standard false positives. */
const VALID_SECTIONS = new Set([
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
  42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78,
  80, 82, 84, 86,
]);

function isPlausibleCecRule(ruleNumber: string): boolean {
  const [sectionRaw, restRaw] = ruleNumber.split("-");
  if (!sectionRaw || !restRaw) return false;
  if (/^0\d/.test(sectionRaw)) return false;
  const section = Number(sectionRaw);
  const rest = Number(restRaw);
  if (!Number.isFinite(section) || !Number.isFinite(rest)) return false;
  if (!VALID_SECTIONS.has(section)) return false;
  // CEC Part I rules are almost always N-XXX (3 digits), e.g. 8-102, 26-724.
  if (restRaw.length !== 3) return false;
  return true;
}

async function downloadPdfIfNeeded(supabase: SupabaseClient) {
  mkdirSync(dirname(CACHE_PDF), { recursive: true });
  if (existsSync(CACHE_PDF) && statSync(CACHE_PDF).size > 1_000_000) {
    console.log(
      `Using cached PDF: ${CACHE_PDF} (${(statSync(CACHE_PDF).size / 1e6).toFixed(1)} MB)`,
    );
    return;
  }

  console.log("Downloading cec-2024.pdf from Supabase Storage…");
  const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH);
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download PDF from Storage");
  }

  const nodeStream = Readable.fromWeb(
    data.stream() as import("stream/web").ReadableStream,
  );
  await pipeline(nodeStream, createWriteStream(CACHE_PDF));
  console.log(`Saved ${(statSync(CACHE_PDF).size / 1e6).toFixed(1)} MB → ${CACHE_PDF}`);
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;
  return pdfjs;
}

async function openPdf() {
  const pdfjs = await loadPdfjs();
  const fontsDir = resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts");
  const data = new Uint8Array(readFileSync(CACHE_PDF));
  return pdfjs.getDocument({
    data,
    disableWorker: true,
    standardFontDataUrl: `${pathToFileURL(fontsDir).href}/`,
  }).promise;
}

function loadCachedPages(startPage: number, endPage: number): PageText[] | null {
  if (!existsSync(CACHE_PAGES)) return null;
  const lines = readFileSync(CACHE_PAGES, "utf8").split("\n").filter(Boolean);
  if (lines.length < endPage - startPage + 1) return null;
  const pages = lines
    .map((line) => JSON.parse(line) as PageText)
    .filter((p) => p.page >= startPage && p.page <= endPage)
    .map((p) => ({ ...p, text: normalizeText(p.text) }));
  if (pages.length === 0) return null;
  console.log(`Using cached page text: ${CACHE_PAGES} (${pages.length} pages)`);
  return pages;
}

async function extractAllPages(
  startPage: number,
  endPage: number,
  batchSize: number,
  force = false,
): Promise<PageText[]> {
  if (!force) {
    const cached = loadCachedPages(startPage, endPage);
    if (cached) return cached;
  }

  const doc = await openPdf();
  const first = Math.max(1, startPage);
  const last = Math.min(endPage, doc.numPages);
  console.log(`Extracting pages ${first}–${last} of ${doc.numPages}…`);

  const pages: PageText[] = [];
  for (let pageNum = first; pageNum <= last; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = normalizeText(
      content.items.map((item) => ("str" in item ? String(item.str) : "")).join(" "),
    );
    pages.push({ page: pageNum, text });
    if (pageNum % batchSize === 0 || pageNum === last) {
      process.stdout.write(`  extracted ${pageNum}/${last}\r`);
    }
  }
  process.stdout.write("\n");

  writeFileSync(
    CACHE_PAGES,
    pages.map((p) => JSON.stringify(p)).join("\n"),
    "utf8",
  );
  console.log(`Cached page text → ${CACHE_PAGES}`);
  return pages;
}

/**
 * Parse CEC rule heads like 8-102, 26-724, 10-000 across the whole document.
 * Skips "Rule X-Y" cross-references via lookbehind.
 */
function parseAllRules(pages: PageText[]): ExtractedChunk[] {
  const joined = pages.map((p) => ` [[PAGE:${p.page}]] ${p.text}`).join(" ");
  const simpleRule = /(?<!Rule\s)(?<!rule\s)\b(\d{1,2}-\d{1,4})\b/g;
  const matches = [...joined.matchAll(simpleRule)];
  if (matches.length === 0) return [];

  // Collect every plausible match; later pick the best body (skip TOC stubs).
  const indexesByRule = new Map<string, number[]>();
  for (const match of matches) {
    const ruleNumber = match[1]!;
    if (!isPlausibleCecRule(ruleNumber)) continue;
    const list = indexesByRule.get(ruleNumber) ?? [];
    list.push(match.index!);
    indexesByRule.set(ruleNumber, list);
  }

  // Build a global ordered list of (rule, index) for body slicing between neighbors.
  const allHits = [...indexesByRule.entries()]
    .flatMap(([ruleNumber, idxs]) => idxs.map((index) => ({ ruleNumber, index })))
    .sort((a, b) => a.index - b.index);

  const bestByRule = new Map<string, ExtractedChunk>();

  for (let i = 0; i < allHits.length; i++) {
    const { ruleNumber, index: startAt } = allHits[i]!;
    const nextStart = i + 1 < allHits.length ? allHits[i + 1]!.index : joined.length;
    let body = joined.slice(startAt + ruleNumber.length, nextStart).trim();

    const before = joined.slice(0, startAt);
    const pageMarkers = [...before.matchAll(/\[\[PAGE:(\d+)\]\]/g)];
    const pageNumber = Number(pageMarkers.at(-1)?.[1] ?? pages[0]?.page ?? 1);

    // Front-matter / TOC pages are usually before ~50; prefer later hits.
    body = body
      .replace(/\[\[PAGE:\d+\]\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (body.length < 80) continue;

    const titleMatch = body.match(
      /^([A-Z][A-Za-z0-9 ,/\-]{2,80}?)(?=\s+\d+\)|\s+[A-Z]\s|\s*$)/,
    );
    const titleGuess =
      titleMatch?.[1]?.trim() ||
      body.slice(0, 80).trim() ||
      `CEC Rule ${ruleNumber}`;

    const candidate: ExtractedChunk = {
      rule_number: ruleNumber,
      section_title: titleGuess.slice(0, 120),
      content: `${ruleNumber} ${body}`.slice(0, 4000),
      page_number: pageNumber,
      kind: "rule",
    };

    const scoreChunk = (c: ExtractedChunk) => {
      let score = 0;
      // Main Part I body is typically before appendices (~p.500+).
      if (c.page_number >= 50 && c.page_number < 500) score += 50_000;
      else if (c.page_number >= 500) score += 5_000; // appendices / notes
      else score += 0; // front matter / TOC

      // Real rules usually open with a title then "1)" or a definition dash.
      if (/^\d+-\d+\s+[A-Z][\s\S]{5,120}?\s+1\)/.test(c.content)) score += 20_000;
      if (/^\d+-\d+\s+[A-Z][A-Za-z]/.test(c.content)) score += 5_000;

      // Penalize appendix-note style bodies that start mid-sentence / "Rule X".
      if (/\bRule\s+\d+-\d+\b/.test(c.content.slice(0, 80))) score -= 15_000;
      if (/^\d+-\d+\s+\d+\)\s+[a-z]/.test(c.content)) score -= 10_000;

      // Prefer substantive but not runaway appendix dumps.
      score += Math.min(c.content.length, 1500);
      return score;
    };

    const existing = bestByRule.get(ruleNumber);
    if (!existing || scoreChunk(candidate) > scoreChunk(existing)) {
      bestByRule.set(ruleNumber, candidate);
    }
  }

  return [...bestByRule.values()].sort((a, b) =>
    a.rule_number.localeCompare(b.rule_number, undefined, { numeric: true }),
  );
}

/** Fallback: keep substantial page text that isn't already covered by rules. */
function parsePageChunks(
  pages: PageText[],
  rules: ExtractedChunk[],
): ExtractedChunk[] {
  const coveredPages = new Set(rules.map((r) => r.page_number));
  const chunks: ExtractedChunk[] = [];

  for (const page of pages) {
    if (page.text.length < 200) continue;
    // Still store pages that have rules — useful for tables/notes around them —
    // but skip very short or mostly-empty pages.
    const sectionHint =
      page.text.match(/\bSection\s+(\d+)\b/i)?.[1] ??
      page.text.match(/\b(\d{1,2})-\d{1,4}\b/)?.[1] ??
      "page";

    chunks.push({
      rule_number: `page-${page.page}`,
      section_title: `CEC page ${page.page}${sectionHint !== "page" ? ` (Section ${sectionHint})` : ""}`,
      content: page.text.slice(0, 4000),
      page_number: page.page,
      kind: "page",
    });

    void coveredPages;
  }
  return chunks;
}

async function embedText(text: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return Array(1536)
      .fill(0)
      .map((_, i) => Math.sin(i + text.length) * 0.1);
  }
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 7000),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding failed: ${res.status} ${body}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0]?.embedding ?? [];
}

async function ensureReferenceDoc(supabase: SupabaseClient) {
  const doc = REFERENCE_DOCS[0]!;
  const { error } = await supabase.from("reference_docs").upsert({
    id: REFERENCE_DOC_CEC_ID,
    title: doc.title,
    doc_type: doc.doc_type,
    code_version: doc.code_version,
    storage_path: doc.storage_path ?? STORAGE_PATH,
    is_licensed: true,
  });
  if (error) throw error;
}

async function upsertChunks(
  supabase: SupabaseClient,
  chunks: ExtractedChunk[],
  embed: boolean,
) {
  let saved = 0;
  for (let i = 0; i < chunks.length; i += UPSERT_BATCH) {
    const slice = chunks.slice(i, i + UPSERT_BATCH);
    const rows = [];
    for (const chunk of slice) {
      // Keep rule IDs stable with the Section 8 pilot so upserts replace stubs.
      const id = deterministicUuid(
        chunk.kind === "rule"
          ? `cec-2024:${chunk.rule_number}`
          : `cec-2024:page:${chunk.page_number}`,
      );
      const embedding = embed
        ? await embedText(`${chunk.rule_number}\n${chunk.content}`)
        : null;
      rows.push({
        id,
        doc_id: REFERENCE_DOC_CEC_ID,
        rule_number: chunk.rule_number,
        section_title: normalizeText(chunk.section_title).slice(0, 200),
        content: normalizeText(chunk.content).slice(0, 4000),
        page_number: chunk.page_number,
        code_version: CODE_VERSION,
        ...(embedding ? { embedding } : {}),
        metadata: {
          source: "ingest-cec-full",
          kind: chunk.kind,
        },
      });
    }

    const { error } = await supabase.from("reference_chunks").upsert(rows);
    if (error) throw error;
    saved += rows.length;
    process.stdout.write(`  upserted ${saved}/${chunks.length}\r`);
  }
  process.stdout.write("\n");
  return saved;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  await downloadPdfIfNeeded(supabase);

  const doc = await openPdf();
  const start = args.start ?? 1;
  const end = args.end ?? doc.numPages;
  console.log(
    `Full ingest: pages ${start}–${end}, embed=${args.embed}, pageChunks=${args.pageChunks}, dryRun=${args.dryRun}`,
  );

  const pages = await extractAllPages(start, end, args.batchSize, args.forceExtract);
  const nonEmpty = pages.filter((p) => p.text.length > 20);
  console.log(`Pages with text: ${nonEmpty.length}/${pages.length}`);

  const rules = parseAllRules(pages);
  console.log(`Parsed ${rules.length} rule chunk(s)`);

  const pageChunks = args.pageChunks ? parsePageChunks(pages, rules) : [];
  if (pageChunks.length) {
    console.log(`Parsed ${pageChunks.length} page chunk(s)`);
  }

  const all = [...rules, ...pageChunks];
  if (all.length === 0) {
    console.log("Sample page text:", nonEmpty[0]?.text.slice(0, 500) || "(none)");
    throw new Error("No chunks parsed from PDF");
  }

  // Section summary
  const bySection = new Map<string, number>();
  for (const rule of rules) {
    const section = rule.rule_number.split("-")[0] ?? "?";
    bySection.set(section, (bySection.get(section) ?? 0) + 1);
  }
  console.log(
    "Rules by section:",
    [...bySection.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([s, n]) => `${s}:${n}`)
      .join(" "),
  );

  console.log("\nPreview (first 5 rules):");
  for (const rule of rules.slice(0, 5)) {
    console.log(`\n[${rule.rule_number}] p.${rule.page_number}`);
    console.log(rule.content.slice(0, 180) + (rule.content.length > 180 ? "…" : ""));
  }

  if (args.dryRun) {
    console.log(`\nDry run — would save ${all.length} chunk(s). Nothing written.`);
    return;
  }

  await ensureReferenceDoc(supabase);
  const saved = await upsertChunks(supabase, all, args.embed);
  console.log(`\nSaved ${saved} chunk(s) to reference_chunks.`);
  console.log(
    args.embed
      ? "Embeddings included."
      : "No embeddings (use --embed later for RAG search quality).",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
