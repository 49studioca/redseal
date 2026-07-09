import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { resolve } from "path";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import type { ReferenceDoc } from "@/types";
import { resolveReferenceDocPdfUrl } from "@/lib/reference/reference-pdf";

const REFERENCES_BUCKET = "references";
const CACHE_DIR = resolve(process.cwd(), ".cache", "reference-pdfs");
const EXCERPT_CACHE_DIR = resolve(process.cwd(), ".cache", "reference-excerpts");

/** Max pages returned for one rule view (keeps excerpts small). */
export const MAX_RULE_PDF_PAGES = 2;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase service role is not configured.");
  }
  return createClient(url, key);
}

function cacheKeyForDoc(doc: ReferenceDoc): string {
  const path = doc.storage_path?.trim() || doc.id;
  return createHash("sha1").update(`${doc.id}:${path}`).digest("hex").slice(0, 16);
}

function sourceCachePath(doc: ReferenceDoc): string {
  const ext = doc.storage_path?.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf";
  return resolve(CACHE_DIR, `${cacheKeyForDoc(doc)}${ext}`);
}

function excerptCachePath(
  doc: ReferenceDoc,
  startPage: number,
  pageCount: number,
): string {
  return resolve(
    EXCERPT_CACHE_DIR,
    `${cacheKeyForDoc(doc)}-p${startPage}-n${pageCount}.pdf`,
  );
}

async function downloadSourcePdf(doc: ReferenceDoc): Promise<Uint8Array> {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cached = sourceCachePath(doc);
  if (existsSync(cached) && statSync(cached).size > 1_000_000) {
    return new Uint8Array(readFileSync(cached));
  }

  const storagePath = doc.storage_path?.trim();
  if (!storagePath) {
    throw new Error("Reference document has no storage_path.");
  }

  // Prefer private Storage via service role (bucket should not be public).
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from(REFERENCES_BUCKET)
      .download(storagePath.replace(/^\/+/, ""));
    if (!error && data) {
      const bytes = new Uint8Array(await data.arrayBuffer());
      writeFileSync(cached, bytes);
      return bytes;
    }
  } catch {
    // fall through to public/env URL
  }

  const publicUrl = resolveReferenceDocPdfUrl(doc);
  if (!publicUrl) {
    throw new Error("Could not download reference PDF from Storage.");
  }

  const res = await fetch(publicUrl.split("#")[0]!);
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF (${res.status}). Is the references bucket accessible?`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  writeFileSync(cached, bytes);
  return bytes;
}

/**
 * Build a small PDF containing only the pages related to a rule.
 * Never returns the full code book.
 */
export async function extractRulePdfPages(
  doc: ReferenceDoc,
  pageNumber: number,
  pageCount = 1,
): Promise<{ bytes: Uint8Array; startPage: number; endPage: number; title: string }> {
  if (!Number.isFinite(pageNumber) || pageNumber < 1) {
    throw new Error("A valid page number is required.");
  }

  const count = Math.min(
    MAX_RULE_PDF_PAGES,
    Math.max(1, Math.floor(pageCount) || 1),
  );
  const startPage = Math.floor(pageNumber);

  mkdirSync(EXCERPT_CACHE_DIR, { recursive: true });
  const excerptPath = excerptCachePath(doc, startPage, count);
  if (existsSync(excerptPath) && statSync(excerptPath).size > 500) {
    const bytes = new Uint8Array(readFileSync(excerptPath));
    return {
      bytes,
      startPage,
      endPage: startPage + count - 1,
      title: doc.title,
    };
  }

  const sourceBytes = await downloadSourcePdf(doc);
  const source = await PDFDocument.load(sourceBytes, {
    ignoreEncryption: true,
  });
  const total = source.getPageCount();
  if (startPage > total) {
    throw new Error(`Page ${startPage} is outside this PDF (${total} pages).`);
  }

  const endPage = Math.min(total, startPage + count - 1);
  const indices: number[] = [];
  for (let p = startPage; p <= endPage; p++) indices.push(p - 1);

  const excerpt = await PDFDocument.create();
  const copied = await excerpt.copyPages(source, indices);
  for (const page of copied) excerpt.addPage(page);

  // Strip metadata that might identify the full book path.
  excerpt.setTitle(`${doc.title} — p. ${startPage}${endPage > startPage ? `–${endPage}` : ""}`);
  excerpt.setProducer("RedSealGuide rule excerpt");
  excerpt.setCreator("RedSealGuide");

  const bytes = await excerpt.save({ useObjectStreams: true });
  writeFileSync(excerptPath, bytes);

  return {
    bytes: new Uint8Array(bytes),
    startPage,
    endPage,
    title: doc.title,
  };
}
