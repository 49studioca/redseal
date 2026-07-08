import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { validateDiscussionComment } from "@/lib/moderation/comment-content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("question_id")?.trim();

  if (!questionId) {
    return NextResponse.json(
      { error: "question_id is required" },
      { status: 400 },
    );
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ comments: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_comments")
    .select("id, body, created_at, user_id, profiles(full_name)")
    .eq("question_id", questionId)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const comments = (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author:
      (row.profiles as { full_name?: string } | null)?.full_name ?? "Apprentice",
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const body = await request.json();
  const questionId = String(body.question_id ?? "").trim();
  const text = String(body.body ?? "").trim();

  if (!questionId || !text) {
    return NextResponse.json(
      { error: "question_id and body are required" },
      { status: 400 },
    );
  }

  const moderation = validateDiscussionComment(text);
  if (!moderation.ok) {
    return NextResponse.json({ error: moderation.message }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      body: text,
      created: true,
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
    .from("question_comments")
    .insert({
      question_id: questionId,
      user_id: user.id,
      body: text,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, created: true });
}
