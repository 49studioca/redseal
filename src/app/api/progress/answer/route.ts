import { NextResponse } from "next/server";
import { fetchQuestionById } from "@/lib/data";
import { recordBlockAnswer } from "@/lib/progress/block-mastery";

export async function POST(request: Request) {
  const body = await request.json();
  const tradeId = String(body.trade_id ?? "").trim();
  const blockId = String(body.block_id ?? "").trim();
  const questionId = String(body.question_id ?? "").trim();
  const selectedOption = String(body.selected_option ?? "").trim();

  if (!tradeId || !blockId) {
    return NextResponse.json(
      { error: "trade_id and block_id are required" },
      { status: 400 },
    );
  }

  const question = questionId ? await fetchQuestionById(questionId) : null;
  if (
    question &&
    (question.trade_id !== tradeId || question.block_id !== blockId)
  ) {
    return NextResponse.json(
      { error: "Question does not belong to the selected trade and block" },
      { status: 400 },
    );
  }

  const taskCode =
    question?.chapter_task_code ??
    (String(body.chapter_task_code ?? "").trim() || undefined);

  let isCorrect: boolean;
  if (question) {
    if (!/^[A-D]$/.test(selectedOption)) {
      return NextResponse.json(
        { error: "selected_option must be A, B, C, or D" },
        { status: 400 },
      );
    }
    // Score against the stored key — never trust client is_correct.
    isCorrect = question.correct_option === selectedOption;
  } else {
    isCorrect = Boolean(body.is_correct);
  }

  const stats = await recordBlockAnswer(
    tradeId,
    blockId,
    isCorrect,
    taskCode,
  );
  return NextResponse.json({
    block_id: blockId,
    question_id: questionId || null,
    chapter_task_code: taskCode ?? null,
    ...stats,
  });
}
