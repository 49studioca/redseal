import { NextResponse } from "next/server";
import { fetchReferenceDoc } from "@/lib/data";
import {
  extractRulePdfPages,
  MAX_RULE_PDF_PAGES,
} from "@/lib/reference/extract-pdf-pages";

export const maxDuration = 120;

/**
 * Returns a small PDF containing ONLY the page(s) for a cited rule.
 * Never exposes the full code-book URL or file to the client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("doc_id")?.trim();
  if (!docId) {
    return NextResponse.json({ error: "doc_id is required" }, { status: 400 });
  }

  const pageParam = searchParams.get("page");
  const pageNumber = pageParam ? Number.parseInt(pageParam, 10) : NaN;
  if (!Number.isFinite(pageNumber) || pageNumber < 1) {
    return NextResponse.json(
      { error: "page is required (rule page number)" },
      { status: 400 },
    );
  }

  const spanParam = searchParams.get("pages");
  const pageCount = spanParam
    ? Math.min(MAX_RULE_PDF_PAGES, Math.max(1, Number.parseInt(spanParam, 10) || 1))
    : 1;

  const doc = await fetchReferenceDoc(docId);
  if (!doc?.storage_path && !process.env.REFERENCE_PDF_CEC_URL) {
    return NextResponse.json(
      {
        error:
          "PDF not configured. Upload the code book to the private references bucket.",
      },
      { status: 404 },
    );
  }

  try {
    const excerpt = await extractRulePdfPages(doc!, pageNumber, pageCount);
    const filename = `rule-p${excerpt.startPage}.pdf`;

    return new NextResponse(Buffer.from(excerpt.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": String(excerpt.bytes.byteLength),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        // Helpful for the UI (not a download of the full book).
        "X-Excerpt-Pages": `${excerpt.startPage}-${excerpt.endPage}`,
        "X-Excerpt-Title": encodeURIComponent(excerpt.title),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Could not build page excerpt" },
      { status: 500 },
    );
  }
}
