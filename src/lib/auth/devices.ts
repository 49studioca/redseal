import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const DEVICE_COOKIE = "rs_device_id";
export const MAX_USER_DEVICES = 2;
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export type UserDeviceRow = {
  id: string;
  device_token: string;
  device_name: string;
  user_agent: string | null;
  session_id: string | null;
  last_seen_at: string;
  created_at: string;
};

export type RegisterDeviceResult =
  | { ok: true; device: UserDeviceRow }
  | { ok: false; reason: "device_limit" };

export function parseDeviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return "Unknown device";

  const ua = userAgent;

  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";

  let os = "device";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

export function getSessionIdFromAccessToken(
  accessToken: string | null | undefined,
): string | null {
  if (!accessToken) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { session_id?: string };
    return payload.session_id ?? null;
  } catch {
    return null;
  }
}

export function getOrCreateDeviceToken(
  cookieStore: Pick<ReadonlyRequestCookies, "get" | "set">,
): string {
  const existing = cookieStore.get(DEVICE_COOKIE)?.value?.trim();
  if (existing) return existing;

  const token = randomUUID();
  try {
    cookieStore.set(DEVICE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DEVICE_COOKIE_MAX_AGE,
    });
  } catch {
    // Middleware normally sets this cookie; fall back when set is unavailable.
  }
  return token;
}

export async function listUserDevices(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserDeviceRow[]> {
  const { data, error } = await supabase
    .from("user_devices")
    .select(
      "id, device_token, device_name, user_agent, session_id, last_seen_at, created_at",
    )
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserDeviceRow[];
}

export async function registerUserDevice(
  supabase: SupabaseClient,
  input: {
    userId: string;
    deviceToken: string;
    userAgent?: string | null;
    sessionId?: string | null;
  },
): Promise<RegisterDeviceResult> {
  const { userId, deviceToken, userAgent, sessionId } = input;
  const deviceName = parseDeviceLabel(userAgent);
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("user_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("device_token", deviceToken)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("user_devices")
      .update({
        device_name: deviceName,
        user_agent: userAgent ?? null,
        session_id: sessionId ?? null,
        last_seen_at: now,
      })
      .eq("id", existing.id)
      .select(
        "id, device_token, device_name, user_agent, session_id, last_seen_at, created_at",
      )
      .single();

    if (updateError) throw updateError;
    return { ok: true, device: updated as UserDeviceRow };
  }

  const { count, error: countError } = await supabase
    .from("user_devices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;
  if ((count ?? 0) >= MAX_USER_DEVICES) {
    return { ok: false, reason: "device_limit" };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_devices")
    .insert({
      user_id: userId,
      device_token: deviceToken,
      device_name: deviceName,
      user_agent: userAgent ?? null,
      session_id: sessionId ?? null,
      last_seen_at: now,
    })
    .select(
      "id, device_token, device_name, user_agent, session_id, last_seen_at, created_at",
    )
    .single();

  if (insertError) throw insertError;
  return { ok: true, device: inserted as UserDeviceRow };
}

export async function removeUserDevice(
  supabase: SupabaseClient,
  serviceSupabase: SupabaseClient,
  input: {
    userId: string;
    deviceId: string;
  },
): Promise<{ removed: UserDeviceRow | null }> {
  const { userId, deviceId } = input;

  const { data: device, error: fetchError } = await supabase
    .from("user_devices")
    .select(
      "id, device_token, device_name, user_agent, session_id, last_seen_at, created_at",
    )
    .eq("user_id", userId)
    .eq("id", deviceId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!device) return { removed: null };

  const { error: deleteError } = await supabase
    .from("user_devices")
    .delete()
    .eq("user_id", userId)
    .eq("id", deviceId);

  if (deleteError) throw deleteError;

  if (device.session_id) {
    await serviceSupabase.rpc("revoke_user_session", {
      p_session_id: device.session_id,
      p_user_id: userId,
    });
  }

  return { removed: device as UserDeviceRow };
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export const DEVICE_LIMIT_MESSAGE =
  "You can use RedSeal Guide on up to 2 devices. Remove a device from Settings on one of your existing devices, then try again.";
