import { NextResponse } from "next/server";
import { translateWord } from "@/lib/ai/generate";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  contextKeyFromSnippet,
  normalizeWord,
} from "@/lib/translation/context-key";
import { getLanguageLabel } from "@/lib/translation/languages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word")?.trim();
  const targetLanguage = searchParams.get("lang")?.trim() ?? "en";
  const context = searchParams.get("context")?.trim() ?? "";
  const tradeName = searchParams.get("trade")?.trim();

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const normalized = normalizeWord(word);
  if (!normalized) {
    return NextResponse.json({ error: "invalid word" }, { status: 400 });
  }

  const contextKey = contextKeyFromSnippet(context);

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: cached } = await supabase
      .from("translation_cache")
      .select("*")
      .eq("word", normalized)
      .eq("source_language", "en")
      .eq("target_language", targetLanguage)
      .eq("context_key", contextKey)
      .maybeSingle();

    if (cached) {
      const { data: saved } = await supabase
        .from("saved_words")
        .select("id")
        .eq("user_id", user.id)
        .eq("word", normalized)
        .eq("target_language", targetLanguage)
        .eq("context_key", contextKey)
        .maybeSingle();

      return NextResponse.json({
        word: normalized,
        translation: cached.translation,
        definition: cached.definition,
        context_explanation: cached.context_explanation,
        cached: true,
        saved: Boolean(saved),
        saved_id: saved?.id ?? null,
      });
    }

    const result = await translateWord({
      word: normalized,
      targetLanguage,
      targetLanguageLabel: getLanguageLabel(targetLanguage),
      contextSnippet: context,
      tradeName,
    });

    try {
      const service = await createServiceClient();
      await service.from("translation_cache").upsert(
        {
          word: normalized,
          source_language: "en",
          target_language: targetLanguage,
          context_key: contextKey,
          translation: result.translation,
          definition: result.definition,
          context_explanation: result.context_explanation,
          model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
        },
        { onConflict: "word,source_language,target_language,context_key" },
      );
    } catch {
      // Cache write failure should not block the response
    }

    const { data: saved } = await supabase
      .from("saved_words")
      .select("id")
      .eq("user_id", user.id)
      .eq("word", normalized)
      .eq("target_language", targetLanguage)
      .eq("context_key", contextKey)
      .maybeSingle();

    return NextResponse.json({
      word: normalized,
      translation: result.translation,
      definition: result.definition,
      context_explanation: result.context_explanation,
      cached: false,
      saved: Boolean(saved),
      saved_id: saved?.id ?? null,
    });
  }

  const result = await translateWord({
    word: normalized,
    targetLanguage,
    targetLanguageLabel: getLanguageLabel(targetLanguage),
    contextSnippet: context,
    tradeName,
  });

  return NextResponse.json({
    word: normalized,
    ...result,
    cached: false,
    saved: false,
    saved_id: null,
  });
}
