import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { contextKeyFromSnippet, normalizeWord } from "@/lib/translation/context-key";

export async function GET() {
  if (!usesSupabaseData()) {
    return NextResponse.json({ words: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ words: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const word = String(body.word ?? "").trim();
  const targetLanguage = String(body.target_language ?? "en").trim();
  const contextSnippet = String(body.context_snippet ?? "").trim();
  const translation = body.translation ? String(body.translation) : null;
  const definition = body.definition ? String(body.definition) : null;
  const contextExplanation = body.context_explanation
    ? String(body.context_explanation)
    : null;
  const lessonId = body.lesson_id ? String(body.lesson_id) : null;

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const normalized = normalizeWord(word);
  const contextKey = contextKeyFromSnippet(contextSnippet);

  if (!usesSupabaseData()) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      word: normalized,
      saved: true,
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
    .from("saved_words")
    .upsert(
      {
        user_id: user.id,
        word: normalized,
        source_language: "en",
        target_language: targetLanguage,
        context_key: contextKey,
        translation,
        definition,
        context_explanation: contextExplanation,
        context_snippet: contextSnippet || null,
        lesson_id: lessonId,
      },
      { onConflict: "user_id,word,target_language,context_key" },
    )
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, word: normalized, saved: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ deleted: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("saved_words")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
