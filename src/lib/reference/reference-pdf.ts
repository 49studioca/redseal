import { REFERENCE_DOCS } from "@/data/seed";
import type { ReferenceDoc } from "@/types";

const REFERENCES_BUCKET = "references";

function supabasePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const normalized = storagePath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${REFERENCES_BUCKET}/${normalized}`;
}

function envPdfUrl(doc: ReferenceDoc): string | null {
  const byVersion = process.env[`REFERENCE_PDF_${doc.doc_type}_${doc.code_version.replace(/-/g, "_")}_URL`];
  if (byVersion?.trim()) return byVersion.trim();

  if (doc.doc_type === "CEC" && process.env.REFERENCE_PDF_CEC_URL?.trim()) {
    return process.env.REFERENCE_PDF_CEC_URL.trim();
  }

  return null;
}

export function resolveReferenceDocPdfUrl(doc: ReferenceDoc): string | null {
  const fromEnv = envPdfUrl(doc);
  if (fromEnv) return fromEnv;

  const storagePath = doc.storage_path?.trim();
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  return supabasePublicUrl(storagePath);
}

export function buildPdfPageUrl(baseUrl: string, pageNumber?: number): string {
  const withoutHash = baseUrl.split("#")[0]!;
  if (!pageNumber || pageNumber < 1) return withoutHash;
  return `${withoutHash}#page=${pageNumber}`;
}

export function getSeedReferenceDoc(docId: string): ReferenceDoc | null {
  return REFERENCE_DOCS.find((doc) => doc.id === docId) ?? null;
}
