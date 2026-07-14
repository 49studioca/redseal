import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { isProvinceCode } from "@/lib/provinces";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanPhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "");
  const count = digits.replace(/\D/g, "").length;
  return count >= 7 && count <= 15 ? digits.slice(0, 20) : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const tradeSlug = String(body.trade_slug ?? "").trim().slice(0, 120);
  const tradeCode = String(body.trade_code ?? "").trim().slice(0, 40);
  const tradeName = body.trade_name
    ? String(body.trade_name).trim().slice(0, 160)
    : null;
  const provinceRaw = String(body.province ?? "").trim();
  const province = isProvinceCode(provinceRaw) ? provinceRaw : null;

  const emailRaw = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const email = emailRaw && EMAIL_RE.test(emailRaw) ? emailRaw : null;
  const phoneRaw = String(body.phone ?? "").trim();
  const phone = phoneRaw ? cleanPhone(phoneRaw) : null;

  if (!tradeSlug || !tradeCode) {
    return NextResponse.json(
      { error: "Trade information is missing." },
      { status: 400 },
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Enter a valid email or phone number." },
      { status: 400 },
    );
  }

  // No DB configured (mock mode) — accept without persisting.
  if (!usesSupabaseData()) {
    return NextResponse.json({ submitted: true });
  }

  let userId: string | null = null;
  try {
    const authed = await createClient();
    const {
      data: { user },
    } = await authed.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Anonymous submission is allowed.
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

  try {
    const service = await createServiceClient();
    const { error } = await service.from("trade_notify_signups").insert({
      trade_slug: tradeSlug,
      trade_code: tradeCode,
      trade_name: tradeName,
      province,
      email,
      phone,
      user_id: userId,
      user_agent: userAgent,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save signup." },
      { status: 500 },
    );
  }

  return NextResponse.json({ submitted: true });
}
