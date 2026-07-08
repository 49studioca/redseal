import { NextResponse } from "next/server";
import { fetchQuestions, fetchLessons, fetchBlocks } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");
  const blockId = searchParams.get("blockId");
  const type = searchParams.get("type");

  if (!tradeId) {
    return NextResponse.json({ error: "tradeId required" }, { status: 400 });
  }

  const questions = await fetchQuestions(tradeId, {
    blockId: blockId ?? undefined,
    type: type ?? undefined,
  });
  return NextResponse.json({ questions });
}
