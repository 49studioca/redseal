import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { getTradeById, TRADES } from "@/data/seed";
import { readDemoPreferences } from "@/lib/demo-preferences";
import type { Trade } from "@/types";

export type DashboardSession = {
  trade: Trade;
  userName: string;
  isAdmin: boolean;
  preferredLanguage: string;
};

async function resolveTrade(tradeId: string): Promise<Trade> {
  if (usesSupabaseData()) {
    const supabase = await createClient();
    const { data: byId } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .maybeSingle();
    if (byId) return byId as Trade;

    const seedTrade = getTradeById(tradeId);
    if (seedTrade) {
      const { data: byCode } = await supabase
        .from("trades")
        .select("*")
        .eq("code", seedTrade.code)
        .maybeSingle();
      if (byCode) return byCode as Trade;
    }
  }

  const seedTrade = getTradeById(tradeId);
  if (seedTrade) return seedTrade;
  return TRADES[0];
}

export async function getDashboardSession(): Promise<DashboardSession> {
  let tradeId = "trade-309a";
  let userName = "Demo User";
  let isAdmin = true;
  let preferredLanguage = "en";

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        if (!profile.onboarding_completed) redirect("/onboarding");
        tradeId = profile.selected_trade_id ?? tradeId;
        userName = profile.full_name ?? user.email ?? "User";
        isAdmin = profile.is_admin ?? false;
        preferredLanguage = profile.preferred_language ?? "en";
      }
    }
  } else {
    const demo = readDemoPreferences(await cookies());
    if (!demo.onboardingCompleted) redirect("/onboarding");
    tradeId = demo.tradeId ?? tradeId;
    preferredLanguage = demo.preferredLanguage;
  }

  const trade = await resolveTrade(tradeId);
  return { trade, userName, isAdmin, preferredLanguage };
}
