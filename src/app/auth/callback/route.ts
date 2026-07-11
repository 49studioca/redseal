import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registerDeviceOrRedirect } from "@/lib/auth/register-device-session";
import { saveSignupPreferences } from "@/lib/auth/save-signup-preferences";
import { isProvinceCode } from "@/lib/provinces";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const tradeSlug = searchParams.get("trade");
  const provinceParam = searchParams.get("province")?.trim().toUpperCase();
  const province =
    provinceParam && isProvinceCode(provinceParam) ? provinceParam : null;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      let destination = next;
      if (tradeSlug || province) {
        try {
          const { onboardingComplete } = await saveSignupPreferences(
            supabase,
            data.user.id,
            { tradeSlug, province },
          );
          destination = onboardingComplete ? "/dashboard" : next;
        } catch {
          destination = next;
        }
      }
      await registerDeviceOrRedirect(
        data.user.id,
        data.session?.access_token,
        origin,
        destination,
      );
    }
  }

  return redirect(`${origin}/auth?signin&error=auth`);
}
