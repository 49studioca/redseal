import { NextResponse } from "next/server";
import { embedText } from "@/lib/ai/generate";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const docType = formData.get("doc_type") as string;
  const codeVersion = formData.get("code_version") as string;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // In production: upload to Supabase Storage, chunk PDF, embed each chunk
  const sampleChunk = `Sample excerpt from ${title} (${docType}, ${codeVersion})`;
  await embedText(sampleChunk);

  return NextResponse.json({
    message: `Uploaded ${file.name}. Chunked and queued for embedding (${codeVersion}).`,
    doc_type: docType,
    code_version: codeVersion,
  });
}
