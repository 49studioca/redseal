import { NextResponse } from "next/server";
import { fetchQuestions } from "@/lib/data";
import { resolveUserProvince } from "@/lib/dashboard-session";
import { TRADES } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");
  const blockId = searchParams.get("blockId");
  const type = searchParams.get("type");

  if (!tradeId) {
    return NextResponse.json({ error: "tradeId required" }, { status: 400 });
  }

  const province = await resolveUserProvince();
  const tradeCode =
    TRADES.find((trade) => trade.id === tradeId)?.code ??
    searchParams.get("tradeCode") ??
    undefined;

  const questions = await fetchQuestions(tradeId, {
    blockId: blockId ?? undefined,
    type: type ?? undefined,
    province,
    tradeCode,
  });

  return NextResponse.json({ questions, province });
}
