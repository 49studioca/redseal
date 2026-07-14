import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEVICE_LIMIT_MESSAGE } from "@/lib/auth/devices";
import { registerDeviceForSession } from "@/lib/auth/register-device-session";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import { getTradeById, TRADES } from "@/data/seed";
import { readDemoPreferences } from "@/lib/demo-preferences";
import { DEFAULT_PROVINCE, normalizeProvinceCode } from "@/lib/provinces";
import { isPremiumTier } from "@/lib/access/subscription";
import {
  countTranslationUsage,
  translationUsageSummary,
  type TranslationUsage,
} from "@/lib/access/translation-usage";
import type { Profile, Trade } from "@/types";

export type DashboardSession = {
  trade: Trade;
  userName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  preferredLanguage: string;
  translationEnabled: boolean;
  province: string;
  subscriptionTier: Profile["subscription_tier"];
  isPremium: boolean;
  translationUsage: TranslationUsage | null;
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

export async function resolveUserProvince(): Promise<string> {
  const cookieStore = await cookies();
  const demoPrefs = readDemoPreferences(cookieStore);

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const user = await getServerSessionUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("province")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.province) {
        return normalizeProvinceCode(profile.province);
      }
    }
  }

  return normalizeProvinceCode(demoPrefs.province ?? DEFAULT_PROVINCE);
}

export async function getDashboardSession(): Promise<DashboardSession> {
  let tradeId = "trade-309a";
  let userName = "Demo User";
  let avatarUrl: string | null = null;
  let isAdmin = !usesSupabaseData();
  const cookieStore = await cookies();
  const demoPrefs = readDemoPreferences(cookieStore);
  let preferredLanguage = demoPrefs.preferredLanguage;
  let translationEnabled = demoPrefs.translationEnabled;
  let province = normalizeProvinceCode(demoPrefs.province ?? DEFAULT_PROVINCE);
  let subscriptionTier: Profile["subscription_tier"] = "pro_all";
  let translationUsage: TranslationUsage | null = null;

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const user = await getServerSessionUser();
    if (!user) {
      redirect("/auth?signin");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const deviceResult = await registerDeviceForSession(
      user.id,
      session?.access_token,
    );
    if (!deviceResult.ok) {
      redirect(
        `/auth?signin&error=device_limit&message=${encodeURIComponent(DEVICE_LIMIT_MESSAGE)}`,
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile) {
      if (!profile.selected_trade_id) redirect("/onboarding");
      tradeId = profile.selected_trade_id ?? tradeId;
      userName = profile.full_name ?? user.email ?? "User";
      avatarUrl = profile.avatar_url ?? null;
      isAdmin = profile.is_admin ?? false;
      province = normalizeProvinceCode(profile.province ?? province);
      subscriptionTier = profile.subscription_tier ?? "free";
      const isPremium = isPremiumTier(subscriptionTier);
      const used = await countTranslationUsage(supabase, user.id);
      translationUsage = translationUsageSummary(used, isPremium);
    }
  } else {
    if (!demoPrefs.tradeId) redirect("/onboarding");
    tradeId = demoPrefs.tradeId ?? tradeId;
  }

  const trade = await resolveTrade(tradeId);
  return {
    trade,
    userName,
    avatarUrl,
    isAdmin,
    preferredLanguage,
    translationEnabled,
    province,
    subscriptionTier,
    isPremium: isPremiumTier(subscriptionTier),
    translationUsage,
  };
}
