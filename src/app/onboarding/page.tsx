import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { saveSignupPreferences } from "@/lib/auth/save-signup-preferences";
import { resolveUserProvince } from "@/lib/dashboard-session";
import { readDemoPreferences } from "@/lib/demo-preferences";
import { isProvinceCode, normalizeProvinceCode } from "@/lib/provinces";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Choose your Red Seal trade",
  robots: {
    index: false,
    follow: false,
  },
};

async function redirectIfTradeAssigned() {
  if (usesSupabaseData()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_trade_id, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.selected_trade_id) {
      if (!profile.onboarding_completed) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", user.id);
      }
      redirect("/dashboard");
    }

    const tradeSlug =
      typeof user.user_metadata?.trade_slug === "string"
        ? user.user_metadata.trade_slug
        : null;
    const provinceMeta = String(user.user_metadata?.province ?? "")
      .trim()
      .toUpperCase();
    const province = isProvinceCode(provinceMeta) ? provinceMeta : null;

    if (tradeSlug) {
      try {
        const { onboardingComplete } = await saveSignupPreferences(
          supabase,
          user.id,
          { tradeSlug, province },
        );
        if (onboardingComplete) redirect("/dashboard");
      } catch {
        // show onboarding form
      }
    }

    return;
  }

  const demoPrefs = readDemoPreferences(await cookies());
  if (demoPrefs.tradeId) redirect("/dashboard");
}

export default async function OnboardingPage() {
  await redirectIfTradeAssigned();

  const province = normalizeProvinceCode(await resolveUserProvince());

  return <OnboardingForm initialProvince={province} />;
}
