/**
 * Pilot: extract ONE CEC section from the uploaded PDF into reference_chunks.
 *
 * Usage:
 *   npx tsx scripts/ingest-cec-section.ts
 *   npx tsx scripts/ingest-cec-section.ts --section=8
 *   npx tsx scripts/ingest-cec-section.ts --section=8 --start=100 --end=220
 *   npx tsx scripts/ingest-cec-section.ts --section=8 --dry-run
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 * Optional: OPENAI_API_KEY for real embeddings (otherwise mock vectors)
 */
import { createHash } from "crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { dirname, resolve } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "url";
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
  section: string;
  start?: number;
  end?: number;
  dryRun: boolean;
  embed: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { section: "8", dryRun: false, embed: true };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--no-embed") args.embed = false;
    else if (arg.startsWith("--section=")) args.section = arg.slice("--section=".length);
    else if (arg.startsWith("--start=")) args.start = Number(arg.slice("--start=".length));
    else if (arg.startsWith("--end=")) args.end = Number(arg.slice("--end=".length));
  }
  return args;
}

type PageText = { page: number; text: string };

type ExtractedRule = {
  rule_number: string;
  section_title: string;
  content: string;
  page_number: number;
};

const CACHE_PDF = resolve(process.cwd(), ".cache", "cec-2024.pdf");
const STORAGE_PATH = "cec-2024.pdf";
const BUCKET = "references";
const CODE_VERSION = "CEC-2024";

function deterministicUuid(seed: string): string {
  const hex = createHash("sha1").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function downloadPdfIfNeeded(supabase: ReturnType<typeof createClient>) {
  mkdirSync(dirname(CACHE_PDF), { recursive: true });
  if (existsSync(CACHE_PDF) && statSync(CACHE_PDF).size > 1_000_000) {
    console.log(`Using cached PDF: ${CACHE_PDF} (${(statSync(CACHE_PDF).size / 1e6).toFixed(1)} MB)`);
    return;
  }

  console.log("Downloading cec-2024.pdf from Supabase Storage…");
  const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH);
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download PDF from Storage");
  }

  const nodeStream = Readable.fromWeb(data.stream() as import("stream/web").ReadableStream);
  await pipeline(nodeStream, createWriteStream(CACHE_PDF));
  console.log(`Saved ${(statSync(CACHE_PDF).size / 1e6).toFixed(1)} MB → ${CACHE_PDF}`);
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Worker not needed for Node text extraction when disabled.
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;
  return pdfjs;
}

function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractPages(
  pdfPath: string,
  startPage: number,
  endPage: number,
): Promise<PageText[]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(readFileSync(pdfPath));
  const fontsDir = resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts");
  const doc = await pdfjs.getDocument({
    data,
    disableWorker: true,
    standardFontDataUrl: `${pathToFileURL(fontsDir).href}/`,
  }).promise;
  const last = Math.min(endPage, doc.numPages);
  const first = Math.max(1, startPage);
  console.log(`Extracting pages ${first}–${last} of ${doc.numPages}…`);

  const pages: PageText[] = [];
  for (let pageNum = first; pageNum <= last; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = normalizeExtractedText(
      content.items
        .map((item) => ("str" in item ? String(item.str) : ""))
        .join(" "),
    );
    pages.push({ page: pageNum, text });
    if (pageNum % 20 === 0 || pageNum === last) {
      process.stdout.write(`  scanned ${pageNum}/${last}\r`);
    }
  }
  process.stdout.write("\n");
  return pages;
}

async function findSectionPageWindow(
  pdfPath: string,
  section: string,
): Promise<{ start: number; end: number }> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(readFileSync(pdfPath));
  const fontsDir = resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts");
  const doc = await pdfjs.getDocument({
    data,
    disableWorker: true,
    standardFontDataUrl: `${pathToFileURL(fontsDir).href}/`,
  }).promise;
  const needle = new RegExp(`(?:^|\\s)${section}-\\d{1,4}\\b`);
  const sectionHeader = new RegExp(
    `Section\\s+${section}\\b|SECTION\\s+${section}\\b`,
    "i",
  );

  console.log(`Scanning PDF for Section ${section} markers (${doc.numPages} pages)…`);
  let firstHit: number | null = null;
  let lastHit: number | null = null;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? String(item.str) : ""))
      .join(" ");

    const hasRule = needle.test(text);
    const hasHeader = sectionHeader.test(text);
    if (hasRule || hasHeader) {
      if (firstHit === null) firstHit = pageNum;
      lastHit = pageNum;
    } else if (firstHit !== null && lastHit !== null && pageNum > lastHit + 8) {
      // Section likely ended; stop early once we leave the block.
      break;
    }

    if (pageNum % 50 === 0) {
      process.stdout.write(`  scan ${pageNum}/${doc.numPages}\r`);
    }
  }
  process.stdout.write("\n");

  if (firstHit === null || lastHit === null) {
    throw new Error(
      `Could not find Section ${section} in the PDF. Try --start=N --end=M with a known page range.`,
    );
  }

  // Pad a little so we don't clip the first/last rule.
  const start = Math.max(1, firstHit - 1);
  const end = Math.min(doc.numPages, lastHit + 1);
  console.log(`Section ${section} appears around pages ${start}–${end}`);
  return { start, end };
}

function parseRulesFromPages(pages: PageText[], section: string): ExtractedRule[] {
  // CEC PDF text is often space-joined (no newlines). Match rule heads like:
  //   "8-204 Schools 1) The calculated load..."
  //   "8-102 1) ..."
  // Skip cross-references like "Rule 8-106 10)" by requiring the number not be
  // immediately preceded by "Rule " (case-insensitive).
  const ruleStart = new RegExp(
    `(?<!Rule\\s)(?<!rule\\s)\\b(${section}-\\d{1,4})(?!\\d)\\s+([A-Z][^\\d]{0,80}?)?(?=\\s*(?:\\d+\\)|$|${section}-\\d))`,
    "g",
  );

  const joined = pages
    .map((p) => ` [[PAGE:${p.page}]] ${p.text}`)
    .join(" ");

  // Simpler, more reliable: find every "N-###" occurrence for this section,
  // then take text until the next same-section rule number.
  const simpleRule = new RegExp(`(?<!Rule\\s)(?<!rule\\s)\\b(${section}-\\d{1,4})\\b`, "g");
  const matches = [...joined.matchAll(simpleRule)];
  if (matches.length === 0) return [];

  // Drop matches that look like cross-references ("as permitted by Rule 8-106")
  // — already excluded via lookbehind — and keep first occurrence of each rule.
  const firstIndexByRule = new Map<string, number>();
  for (const match of matches) {
    const ruleNumber = match[1]!;
    if (!firstIndexByRule.has(ruleNumber)) {
      firstIndexByRule.set(ruleNumber, match.index!);
    }
  }

  const ordered = [...firstIndexByRule.entries()].sort((a, b) => a[1] - b[1]);
  const rules: ExtractedRule[] = [];

  for (let i = 0; i < ordered.length; i++) {
    const [ruleNumber, startAt] = ordered[i]!;
    const nextStart = i + 1 < ordered.length ? ordered[i + 1]![1] : joined.length;
    const ruleTokenEnd = startAt + ruleNumber.length;
    let body = joined.slice(ruleTokenEnd, nextStart).trim();

    const before = joined.slice(0, startAt);
    const pageMarkers = [...before.matchAll(/\[\[PAGE:(\d+)\]\]/g)];
    const pageNumber = Number(pageMarkers.at(-1)?.[1] ?? pages[0]?.page ?? 1);

    body = body
      .replace(/\[\[PAGE:\d+\]\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Skip tiny fragments / table-of-contents style hits.
    if (body.length < 60) continue;

    const titleMatch = body.match(/^([A-Z][A-Za-z0-9 ,/\-]{2,80}?)(?=\s+\d+\)|\s+[A-Z]\s|\s*$)/);
    const titleGuess =
      titleMatch?.[1]?.trim() ||
      body.slice(0, 80).trim() ||
      `CEC Rule ${ruleNumber}`;

    rules.push({
      rule_number: ruleNumber,
      section_title: titleGuess.slice(0, 120),
      content: `${ruleNumber} ${body}`.slice(0, 4000),
      page_number: pageNumber,
    });
  }

  void ruleStart; // kept for future refinement
  return rules.sort((a, b) =>
    a.rule_number.localeCompare(b.rule_number, undefined, { numeric: true }),
  );
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

async function ensureReferenceDoc(supabase: ReturnType<typeof createClient>) {
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
  supabase: ReturnType<typeof createClient>,
  rules: ExtractedRule[],
  embed: boolean,
) {
  let saved = 0;
  for (const rule of rules) {
    const id = deterministicUuid(`cec-2024:${rule.rule_number}`);
    const embedding = embed ? await embedText(`${rule.rule_number}\n${rule.content}`) : null;
    const row = {
      id,
      doc_id: REFERENCE_DOC_CEC_ID,
      rule_number: rule.rule_number,
      section_title: rule.section_title,
      content: rule.content,
      page_number: rule.page_number,
      code_version: CODE_VERSION,
      ...(embedding ? { embedding } : {}),
      metadata: { source: "ingest-cec-section", section_pilot: true },
    };
    const { error } = await supabase.from("reference_chunks").upsert(row);
    if (error) throw error;
    saved += 1;
    console.log(
      `  ✓ ${rule.rule_number}  p.${rule.page_number}  (${rule.content.length} chars)`,
    );
  }
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

  let start = args.start;
  let end = args.end;
  if (start == null || end == null) {
    const window = await findSectionPageWindow(CACHE_PDF, args.section);
    start = start ?? window.start;
    end = end ?? window.end;
  }

  const pages = await extractPages(CACHE_PDF, start, end);
  const nonEmpty = pages.filter((p) => p.text.length > 20);
  console.log(`Pages with text: ${nonEmpty.length}/${pages.length}`);

  const rules = parseRulesFromPages(pages, args.section);
  console.log(`Parsed ${rules.length} rule chunk(s) for Section ${args.section}`);
  console.log(
    "Rules:",
    rules.map((r) => `${r.rule_number}@p${r.page_number}`).join(", "),
  );

  if (rules.length === 0) {
    console.log("Sample page text (first non-empty):");
    console.log(nonEmpty[0]?.text.slice(0, 500) || "(none)");
    throw new Error("No rules parsed — PDF text layout may need a different parser.");
  }

  console.log("\nPreview (first 3):");
  for (const rule of rules.slice(0, 3)) {
    console.log(`\n[${rule.rule_number}] p.${rule.page_number}`);
    console.log(rule.content.slice(0, 220) + (rule.content.length > 220 ? "…" : ""));
  }

  if (args.dryRun) {
    console.log("\nDry run — nothing written to the database.");
    return;
  }

  await ensureReferenceDoc(supabase);
  const saved = await upsertChunks(supabase, rules, args.embed);
  console.log(`\nSaved ${saved} chunk(s) to reference_chunks.`);
  console.log("Try the lesson modal: click a Section 8 rule citation, then the page link.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
