import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  deleteDemoVocabularyWord,
  readDemoVocabulary,
  upsertDemoVocabularyWord,
} from "@/lib/demo-vocabulary";
import { contextKeyFromSnippet, normalizeWord } from "@/lib/translation/context-key";

function isUuid(value: string | null): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

export async function GET() {
  const cookieStore = await cookies();
  const demoWords = readDemoVocabulary(cookieStore);

  if (!usesSupabaseData()) {
    return NextResponse.json({ words: demoWords });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ words: demoWords });
  }

  const { data, error } = await supabase
    .from("saved_words")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ words: demoWords });
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
  const lessonId = isUuid(body.lesson_id ? String(body.lesson_id) : null)
    ? String(body.lesson_id)
    : null;

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const normalized = normalizeWord(word);
  const contextKey = contextKeyFromSnippet(contextSnippet);
  const cookieStore = await cookies();

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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

      if (!error && data) {
        return NextResponse.json({ id: data.id, word: normalized, saved: true });
      }
    }
  }

  const saved = upsertDemoVocabularyWord(cookieStore, {
    word: normalized,
    target_language: targetLanguage,
    context_key: contextKey,
    translation,
    definition,
    context_explanation: contextExplanation,
    context_snippet: contextSnippet || null,
  });

  return NextResponse.json({ id: saved.id, word: normalized, saved: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const cookieStore = await cookies();

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("saved_words")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        return NextResponse.json({ deleted: true });
      }
    }
  }

  if (!deleteDemoVocabularyWord(cookieStore, id)) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
