import { NextResponse } from "next/server";
import { translateWord } from "@/lib/ai/generate";
import { isPremiumTier } from "@/lib/access/subscription";
import {
  checkTranslationAccess,
  recordTranslationLookup,
  translationUsageSummary,
  type TranslationUsage,
} from "@/lib/access/translation-usage";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  contextKeyFromSnippet,
  normalizeWord,
} from "@/lib/translation/context-key";
import { getLanguageLabel } from "@/lib/translation/languages";

function limitResponse(usage: TranslationUsage) {
  return NextResponse.json(
    {
      error: "Free plan includes 5 word translations. Upgrade for unlimited lookups.",
      code: "translation_limit",
      usage,
    },
    { status: 403 },
  );
}

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const isPremium = isPremiumTier(profile?.subscription_tier ?? "free");
    const access = await checkTranslationAccess(
      supabase,
      user.id,
      normalized,
      targetLanguage,
      contextKey,
      isPremium,
    );

    if (!access.allowed) {
      return limitResponse(access.usage);
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
      const usage = isPremium
        ? access.usage
        : await recordTranslationLookup(
            supabase,
            user.id,
            normalized,
            targetLanguage,
            contextKey,
          );

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
        usage,
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

    const usage = isPremium
      ? access.usage
      : await recordTranslationLookup(
          supabase,
          user.id,
          normalized,
          targetLanguage,
          contextKey,
        );

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
      usage,
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
    usage: translationUsageSummary(0, true),
  });
}
