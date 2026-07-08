import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { validateReportDetails } from "@/lib/moderation/comment-content";

const VALID_REASONS = [
  "wrong_answer",
  "outdated_code",
  "unclear",
  "other",
] as const;

export async function POST(request: Request) {
  const body = await request.json();
  const questionId = String(body.question_id ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const details = body.details ? String(body.details).trim() : null;

  if (!questionId || !reason) {
    return NextResponse.json(
      { error: "question_id and reason are required" },
      { status: 400 },
    );
  }

  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json({ error: "invalid reason" }, { status: 400 });
  }

  if (details) {
    const moderation = validateReportDetails(details);
    if (!moderation.ok) {
      return NextResponse.json({ error: moderation.message }, { status: 400 });
    }
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      status: "open",
      submitted: true,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("question_reports")
    .insert({
      question_id: questionId,
      user_id: user.id,
      reason,
      details,
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, submitted: true });
}
