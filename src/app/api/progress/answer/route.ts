import { NextResponse } from "next/server";
import {
  recordBlockAnswer,
  recordMockExamBlockScores,
} from "@/lib/progress/block-mastery";

export async function POST(request: Request) {
  const body = await request.json();
  const tradeId = String(body.trade_id ?? "").trim();
  const blockId = String(body.block_id ?? "").trim();
  const isCorrect = Boolean(body.is_correct);

  if (!tradeId || !blockId) {
    return NextResponse.json(
      { error: "trade_id and block_id are required" },
      { status: 400 },
    );
  }

  const stats = await recordBlockAnswer(tradeId, blockId, isCorrect);
  return NextResponse.json({ block_id: blockId, ...stats });
}
