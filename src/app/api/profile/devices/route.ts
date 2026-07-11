import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import {
  DEVICE_COOKIE,
  DEVICE_LIMIT_MESSAGE,
  getOrCreateDeviceToken,
  getSessionIdFromAccessToken,
  listUserDevices,
  registerUserDevice,
  removeUserDevice,
} from "@/lib/auth/devices";

export async function GET() {
  if (!usesSupabaseData()) {
    return NextResponse.json({ devices: [], currentDeviceToken: null });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const currentDeviceToken = cookieStore.get(DEVICE_COOKIE)?.value ?? null;
  const supabase = await createClient();
  const devices = await listUserDevices(supabase, user.id);

  return NextResponse.json({ devices, currentDeviceToken });
}

export async function POST() {
  if (!usesSupabaseData()) {
    return NextResponse.json({ ok: true });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const deviceToken = getOrCreateDeviceToken(cookieStore);
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const result = await registerUserDevice(supabase, {
    userId: user.id,
    deviceToken,
    userAgent,
    sessionId: getSessionIdFromAccessToken(session?.access_token),
  });

  if (!result.ok) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { ok: false, error: "device_limit", message: DEVICE_LIMIT_MESSAGE },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, device: result.device });
}

export async function DELETE(request: Request) {
  if (!usesSupabaseData()) {
    return NextResponse.json({ ok: true });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const deviceId = String(body.deviceId ?? "").trim();
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const currentDeviceToken = cookieStore.get(DEVICE_COOKIE)?.value ?? null;
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const { removed } = await removeUserDevice(supabase, serviceSupabase, {
    userId: user.id,
    deviceId,
  });

  if (!removed) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const removedCurrentDevice = removed.device_token === currentDeviceToken;
  if (removedCurrentDevice) {
    await supabase.auth.signOut();
  }

  return NextResponse.json({
    ok: true,
    removedCurrentDevice,
  });
}
