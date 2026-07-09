import { NextResponse } from "next/server";
import { searchReferenceChunks } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const codeVersion = searchParams.get("code_version") ?? undefined;
  const chunks = await searchReferenceChunks(q, codeVersion);

  return NextResponse.json({ chunks });
}
