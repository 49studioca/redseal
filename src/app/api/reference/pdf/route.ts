import { NextResponse } from "next/server";
import { getReferencePdfViewUrl } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get("doc_id")?.trim();
  if (!docId) {
    return NextResponse.json({ error: "doc_id is required" }, { status: 400 });
  }

  const pageParam = searchParams.get("page");
  const pageNumber = pageParam ? Number.parseInt(pageParam, 10) : undefined;
  const view = await getReferencePdfViewUrl(
    docId,
    Number.isFinite(pageNumber) ? pageNumber : undefined,
  );

  if (!view) {
    return NextResponse.json(
      {
        error:
          "PDF not configured. Upload the code book in Admin → References or set REFERENCE_PDF_CEC_URL.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(view);
}
