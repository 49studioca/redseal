/**
 * Ingest a trade-specific reference PDF into reference_chunks so it can ground
 * AI lesson/quiz generation for that trade (RAG knowledge base).
 *
 * Unlike ingest-cec-*.ts (which parses CEC rule numbers), this is a generic,
 * page/window-based chunker for any trade reference PDF already uploaded to the
 * private `references` Storage bucket.
 *
 * Usage:
 *   npm run db:ingest-trade-pdf -- --trade=309A
 *   npm run db:ingest-trade-pdf -- --trade=309A --file=trades/309a/309a-reference.pdf
 *   npm run db:ingest-trade-pdf -- --trade=309A --title="309A Study Reference" --code-version=309A-2024
 *   npm run db:ingest-trade-pdf -- --trade=309A --dry-run
 *   npm run db:ingest-trade-pdf -- --trade=309A --no-embed
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Recommended: OPENAI_API_KEY or OPENROUTER_API_KEY (embeddings for RAG retrieval)
 */
import { createHash } from "crypto";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "fs";
import { dirname, resolve } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { embedTextIfAvailable, hasEmbeddingProvider } from "../src/lib/ai/embeddings";
import { loadEnvFile } from "./load-env";

loadEnvFile();

const BUCKET = "references";
const UPSERT_BATCH = 25;

type Args = {
  tradeCode: string;
  file?: string;
  title?: string;
  docType: string;
  codeVersion?: string;
  start?: number;
  end?: number;
  charsPerChunk: number;
  dryRun: boolean;
  embed: boolean;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const tradeCode = get("trade")?.toUpperCase();
  if (!tradeCode) {
    throw new Error("Missing --trade=CODE (e.g. --trade=309A)");
  }
  const charsRaw = get("chars");
  const charsPerChunk = charsRaw ? Number(charsRaw) : 1500;
  if (!Number.isInteger(charsPerChunk) || charsPerChunk < 120) {
    throw new Error(
      `Invalid --chars=${charsRaw}: must be an integer >= 120 (chunks need room to advance).`,
    );
  }
  return {
    tradeCode,
    file: get("file"),
    title: get("title"),
    docType: get("doc-type") ?? "TRADE_REFERENCE",
    codeVersion: get("code-version") ?? `${tradeCode}-REF`,
    start: get("start") ? Number(get("start")) : undefined,
    end: get("end") ? Number(get("end")) : undefined,
    charsPerChunk,
    dryRun: argv.includes("--dry-run"),
    embed: !argv.includes("--no-embed"),
  };
}

type PageText = { page: number; text: string };

type ExtractedChunk = {
  ordinal: number;
  section_title: string;
  content: string;
  page_number: number;
};

function deterministicUuid(seed: string): string {
  const hex = createHash("sha1").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function cachePath(tradeCode: string): string {
  return resolve(
    process.cwd(),
    ".cache",
    `trade-ref-${tradeCode.toLowerCase()}.pdf`,
  );
}

async function resolveTradeId(
  supabase: SupabaseClient,
  tradeCode: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("trades")
    .select("id")
    .eq("code", tradeCode)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Trade ${tradeCode} not found. Run npm run db:seed first.`,
    );
  }
  return data.id as string;
}

async function resolveStoragePath(
  supabase: SupabaseClient,
  tradeId: string,
  explicit?: string,
): Promise<{ storagePath: string; existingDocId?: string }> {
  if (explicit) {
    const { data } = await supabase
      .from("reference_docs")
      .select("id")
      .eq("trade_id", tradeId)
      .eq("storage_path", explicit)
      .maybeSingle();
    return { storagePath: explicit, existingDocId: data?.id as string | undefined };
  }

  const { data, error } = await supabase
    .from("reference_docs")
    .select("id, storage_path")
    .eq("trade_id", tradeId)
    .not("storage_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.storage_path) {
    throw new Error(
      "No storage_path found. Pass --file=trades/<code>/<name>.pdf or add a reference_docs row for this trade first.",
    );
  }
  return {
    storagePath: data.storage_path as string,
    existingDocId: data.id as string,
  };
}

async function downloadPdfIfNeeded(
  supabase: SupabaseClient,
  storagePath: string,
  cache: string,
) {
  mkdirSync(dirname(cache), { recursive: true });
  if (existsSync(cache) && statSync(cache).size > 10_000) {
    console.log(
      `Using cached PDF: ${cache} (${(statSync(cache).size / 1e6).toFixed(2)} MB)`,
    );
    return;
  }
  console.log(`Downloading ${storagePath} from Storage bucket "${BUCKET}"…`);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storagePath.replace(/^\/+/, ""));
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to download PDF from Storage");
  }
  const nodeStream = Readable.fromWeb(
    data.stream() as import("stream/web").ReadableStream,
  );
  await pipeline(nodeStream, createWriteStream(cache));
  console.log(`Saved ${(statSync(cache).size / 1e6).toFixed(2)} MB → ${cache}`);
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  ).href;
  return pdfjs;
}

async function extractPages(
  cache: string,
  start: number,
  end: number,
): Promise<PageText[]> {
  const pdfjs = await loadPdfjs();
  const fontsDir = resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts");
  const data = new Uint8Array(readFileSync(cache));
  const doc = await pdfjs.getDocument({
    data,
    disableWorker: true,
    standardFontDataUrl: `${pathToFileURL(fontsDir).href}/`,
  }).promise;

  const first = Math.max(1, start);
  const last = Math.min(end, doc.numPages);
  console.log(`Extracting pages ${first}–${last} of ${doc.numPages}…`);

  const pages: PageText[] = [];
  for (let pageNum = first; pageNum <= last; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const text = normalizeText(
      content.items.map((item) => ("str" in item ? String(item.str) : "")).join(" "),
    );
    pages.push({ page: pageNum, text });
    if (pageNum % 25 === 0 || pageNum === last) {
      process.stdout.write(`  extracted ${pageNum}/${last}\r`);
    }
  }
  process.stdout.write("\n");
  return pages;
}

/** Split each page's text into ~charsPerChunk windows on sentence-ish breaks. */
function chunkPages(pages: PageText[], charsPerChunk: number): ExtractedChunk[] {
  const chunks: ExtractedChunk[] = [];
  let ordinal = 0;

  for (const page of pages) {
    const text = page.text.trim();
    if (text.length < 120) continue;

    if (text.length <= charsPerChunk) {
      chunks.push({
        ordinal: ordinal++,
        section_title: titleGuess(text, page.page),
        content: text.slice(0, 4000),
        page_number: page.page,
      });
      continue;
    }

    let cursor = 0;
    while (cursor < text.length) {
      let sliceEnd = Math.min(cursor + charsPerChunk, text.length);
      if (sliceEnd < text.length) {
        const window = text.slice(cursor, sliceEnd);
        const breakAt = Math.max(
          window.lastIndexOf(". "),
          window.lastIndexOf("\n"),
        );
        if (breakAt > charsPerChunk * 0.5) {
          sliceEnd = cursor + breakAt + 1;
        }
      }
      const body = text.slice(cursor, sliceEnd).trim();
      if (body.length >= 120) {
        chunks.push({
          ordinal: ordinal++,
          section_title: titleGuess(body, page.page),
          content: body.slice(0, 4000),
          page_number: page.page,
        });
      }
      cursor = sliceEnd;
    }
  }
  return chunks;
}

function titleGuess(body: string, page: number): string {
  const firstLine = body.split(/[.\n]/)[0]?.trim() ?? "";
  if (firstLine.length >= 8 && firstLine.length <= 100) return firstLine;
  return `Reference page ${page}`;
}

async function upsertReferenceDoc(
  supabase: SupabaseClient,
  input: {
    docId: string;
    tradeId: string;
    title: string;
    docType: string;
    codeVersion: string;
    storagePath: string;
  },
) {
  const { error } = await supabase.from("reference_docs").upsert(
    {
      id: input.docId,
      trade_id: input.tradeId,
      title: input.title,
      doc_type: input.docType,
      code_version: input.codeVersion,
      storage_path: input.storagePath,
      is_licensed: true,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

async function upsertChunks(
  supabase: SupabaseClient,
  docId: string,
  tradeCode: string,
  codeVersion: string,
  chunks: ExtractedChunk[],
  embed: boolean,
) {
  let saved = 0;
  for (let i = 0; i < chunks.length; i += UPSERT_BATCH) {
    const slice = chunks.slice(i, i + UPSERT_BATCH);
    const rows = [];
    for (const chunk of slice) {
      const id = deterministicUuid(`${docId}:c${chunk.ordinal}`);
      const embedding = embed
        ? await embedTextIfAvailable(`${chunk.section_title}\n${chunk.content}`)
        : null;
      rows.push({
        id,
        doc_id: docId,
        rule_number: `${tradeCode.toLowerCase()}-ref-${chunk.ordinal}`,
        section_title: normalizeText(chunk.section_title).slice(0, 200),
        content: normalizeText(chunk.content).slice(0, 4000),
        page_number: chunk.page_number,
        code_version: codeVersion,
        ...(embedding ? { embedding } : {}),
        metadata: {
          source: "ingest-trade-pdf",
          trade_code: tradeCode,
          kind: "trade_reference",
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
  if (args.embed && !hasEmbeddingProvider()) {
    console.warn(
      "WARNING: no embeddings provider — set OPENAI_API_KEY or OPENROUTER_API_KEY.\n" +
        "Chunks will be saved WITHOUT embeddings and will NOT be retrievable by generation.",
    );
  }

  const supabase = createClient(url, key);
  const tradeId = await resolveTradeId(supabase, args.tradeCode);
  const { storagePath, existingDocId } = await resolveStoragePath(
    supabase,
    tradeId,
    args.file,
  );
  const docId =
    existingDocId ?? deterministicUuid(`trade-ref:${args.tradeCode}:${storagePath}`);
  const codeVersion = args.codeVersion!;
  const title = args.title ?? `${args.tradeCode} Trade Reference`;

  console.log(
    `Trade ${args.tradeCode} (${tradeId})\n  storage_path: ${storagePath}\n  doc_id: ${docId}\n  code_version: ${codeVersion}\n  embed: ${args.embed}`,
  );

  const cache = cachePath(args.tradeCode);
  await downloadPdfIfNeeded(supabase, storagePath, cache);

  const pages = await extractPages(
    cache,
    args.start ?? 1,
    args.end ?? Number.MAX_SAFE_INTEGER,
  );
  const nonEmpty = pages.filter((p) => p.text.length > 20);
  console.log(`Pages with text: ${nonEmpty.length}/${pages.length}`);

  const chunks = chunkPages(pages, args.charsPerChunk);
  console.log(`Built ${chunks.length} chunk(s) (~${args.charsPerChunk} chars each)`);

  if (chunks.length === 0) {
    console.log("Sample page text:", nonEmpty[0]?.text.slice(0, 400) || "(none)");
    throw new Error(
      "No chunks produced — the PDF may be image-only (needs OCR) or has no text layer.",
    );
  }

  console.log("\nPreview (first 3 chunks):");
  for (const chunk of chunks.slice(0, 3)) {
    console.log(`\n[p.${chunk.page_number}] ${chunk.section_title}`);
    console.log(chunk.content.slice(0, 160) + (chunk.content.length > 160 ? "…" : ""));
  }

  if (args.dryRun) {
    console.log(`\nDry run — would save ${chunks.length} chunk(s). Nothing written.`);
    return;
  }

  await upsertReferenceDoc(supabase, {
    docId,
    tradeId,
    title,
    docType: args.docType,
    codeVersion,
    storagePath,
  });
  const saved = await upsertChunks(
    supabase,
    docId,
    args.tradeCode,
    codeVersion,
    chunks,
    args.embed,
  );
  console.log(`\nSaved ${saved} chunk(s) to reference_chunks for ${args.tradeCode}.`);
  console.log(
    args.embed && hasEmbeddingProvider()
      ? "Embeddings included — generation retrieval can now use this PDF."
      : "No embeddings — set OPENAI_API_KEY or OPENROUTER_API_KEY so generation can retrieve these chunks.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
