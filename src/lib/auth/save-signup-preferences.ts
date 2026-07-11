import type { SupabaseClient } from "@supabase/supabase-js";
import { TRADES } from "@/data/seed";
import { isProvinceCode, type ProvinceCode } from "@/lib/provinces";

export async function saveSignupPreferences(
  supabase: SupabaseClient,
  userId: string,
  opts: { tradeSlug?: string | null; province?: ProvinceCode | null },
): Promise<{ onboardingComplete: boolean }> {
  const updates: Record<string, unknown> = {};

  if (opts.province && isProvinceCode(opts.province)) {
    updates.province = opts.province;
  }

  let hasTrade = false;
  if (opts.tradeSlug) {
    const trade = TRADES.find((t) => t.slug === opts.tradeSlug);
    if (trade) {
      const { data: dbTrade } = await supabase
        .from("trades")
        .select("id")
        .eq("code", trade.code)
        .maybeSingle();
      if (dbTrade?.id) {
        updates.selected_trade_id = dbTrade.id;
        hasTrade = true;
      }
    }
  }

  const onboardingComplete = hasTrade && Boolean(updates.province);
  if (onboardingComplete) {
    updates.onboarding_completed = true;
  }

  if (Object.keys(updates).length === 0) {
    return { onboardingComplete: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
  return { onboardingComplete };
}
