import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_LIMITS } from "@/lib/access/subscription";

export type TranslationUsage = {
  used: number;
  limit: number | null;
  remaining: number | null;
};

export function translationUsageSummary(
  used: number,
  isPremium: boolean,
): TranslationUsage {
  if (isPremium) {
    return { used, limit: null, remaining: null };
  }
  const limit = FREE_LIMITS.translations;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function countTranslationUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("translation_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function hasTranslationLookup(
  supabase: SupabaseClient,
  userId: string,
  word: string,
  targetLanguage: string,
  contextKey: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("translation_usage")
    .select("id")
    .eq("user_id", userId)
    .eq("word", word)
    .eq("target_language", targetLanguage)
    .eq("context_key", contextKey)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function checkTranslationAccess(
  supabase: SupabaseClient,
  userId: string,
  word: string,
  targetLanguage: string,
  contextKey: string,
  isPremium: boolean,
): Promise<{ allowed: boolean; usage: TranslationUsage }> {
  if (isPremium) {
    const used = await countTranslationUsage(supabase, userId);
    return { allowed: true, usage: translationUsageSummary(used, true) };
  }

  const alreadyLookedUp = await hasTranslationLookup(
    supabase,
    userId,
    word,
    targetLanguage,
    contextKey,
  );
  const used = await countTranslationUsage(supabase, userId);
  const usage = translationUsageSummary(used, false);

  if (alreadyLookedUp || used < FREE_LIMITS.translations) {
    return { allowed: true, usage };
  }

  return { allowed: false, usage };
}

export async function recordTranslationLookup(
  supabase: SupabaseClient,
  userId: string,
  word: string,
  targetLanguage: string,
  contextKey: string,
): Promise<TranslationUsage> {
  const { error } = await supabase.from("translation_usage").upsert(
    {
      user_id: userId,
      word,
      target_language: targetLanguage,
      context_key: contextKey,
    },
    { onConflict: "user_id,word,target_language,context_key" },
  );

  if (error) throw error;

  const used = await countTranslationUsage(supabase, userId);
  return translationUsageSummary(used, false);
}
