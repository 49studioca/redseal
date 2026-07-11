import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DEVICE_LIMIT_MESSAGE,
  getOrCreateDeviceToken,
  getSessionIdFromAccessToken,
  registerUserDevice,
} from "@/lib/auth/devices";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function registerDeviceForSession(userId: string, accessToken?: string) {
  if (!usesSupabaseData()) return { ok: true as const };

  const cookieStore = await cookies();
  const deviceToken = getOrCreateDeviceToken(cookieStore);
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const supabase = await createClient();

  const result = await registerUserDevice(supabase, {
    userId,
    deviceToken,
    userAgent,
    sessionId: getSessionIdFromAccessToken(accessToken),
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    return { ok: false as const, reason: "device_limit" as const };
  }

  return { ok: true as const };
}

export async function registerDeviceOrRedirect(
  userId: string,
  accessToken: string | undefined,
  origin: string,
  next: string,
) {
  const result = await registerDeviceForSession(userId, accessToken);
  if (!result.ok) {
    redirect(
      `${origin}/auth?signin&error=device_limit&message=${encodeURIComponent(DEVICE_LIMIT_MESSAGE)}`,
    );
  }
  redirect(`${origin}${next}`);
}
