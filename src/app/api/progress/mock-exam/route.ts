import { NextResponse } from "next/server";
import { recordMockExamBlockScores } from "@/lib/progress/block-mastery";

export async function POST(request: Request) {
  const body = await request.json();
  const tradeId = String(body.trade_id ?? "").trim();
  const blockScores = body.block_scores as Record<
    string,
    { correct: number; total: number }
  >;

  if (!tradeId || !blockScores || typeof blockScores !== "object") {
    return NextResponse.json(
      { error: "trade_id and block_scores are required" },
      { status: 400 },
    );
  }

  await recordMockExamBlockScores(tradeId, blockScores);
  return NextResponse.json({ saved: true });
}
