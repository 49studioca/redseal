import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { fetchQuestions } from "@/lib/data";
import {
  readDemoBookmarks,
  toggleDemoBookmark,
} from "@/lib/demo-bookmarks";

async function getBookmarkIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const demoIds = readDemoBookmarks(cookieStore);

  if (!usesSupabaseData()) {
    return demoIds;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return demoIds;
  }

  const { data, error } = await supabase
    .from("question_bookmarks")
    .select("question_id")
    .eq("user_id", user.id);

  if (error) {
    return demoIds;
  }

  const dbIds = (data ?? []).map((row) => row.question_id as string);
  return [...new Set([...demoIds, ...dbIds])];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId")?.trim();
  const questionIds = await getBookmarkIds();

  if (!tradeId) {
    return NextResponse.json({ question_ids: questionIds });
  }

  if (questionIds.length === 0) {
    return NextResponse.json({ question_ids: [], questions: [] });
  }

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds)
      .eq("trade_id", tradeId)
      .eq("review_status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ question_ids: questionIds, questions: data });
    }
  }

  const tradeQuestions = await fetchQuestions(tradeId);
  const questions = tradeQuestions.filter((q) => questionIds.includes(q.id));
  return NextResponse.json({ question_ids: questionIds, questions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const questionId = String(body.question_id ?? "").trim();

  if (!questionId) {
    return NextResponse.json(
      { error: "question_id is required" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existing } = await supabase
        .from("question_bookmarks")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("question_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("question_id", questionId);

        if (!error) {
          return NextResponse.json({
            bookmarked: false,
            question_id: questionId,
          });
        }
      } else {
        const { error } = await supabase.from("question_bookmarks").insert({
          user_id: user.id,
          question_id: questionId,
        });

        if (!error) {
          return NextResponse.json({
            bookmarked: true,
            question_id: questionId,
          });
        }
      }
    }
  }

  const bookmarked = toggleDemoBookmark(cookieStore, questionId);
  return NextResponse.json({ bookmarked, question_id: questionId });
}
