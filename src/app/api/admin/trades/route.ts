import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { TRADES } from "@/data/seed";
import type { Trade } from "@/types";

/** UI-facing statuses map onto the existing trade `status` enum. */
const STATUS_MAP = {
  active: "live",
  draft: "coming_soon",
} as const;

type UiStatus = keyof typeof STATUS_MAP;

/** A trade counts as "active" only when it is live; everything else is a draft. */
export function toUiStatus(status: Trade["status"]): UiStatus {
  return status === "live" ? "active" : "draft";
}

export async function GET() {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!usesSupabaseData()) {
    const trades = [...TRADES].sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ trades, persisted: false });
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return NextResponse.json({ trades: data ?? [], persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load trades" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
  };
  const id = String(body.id ?? "").trim();
  const uiStatus = String(body.status ?? "").trim() as UiStatus;

  if (!id) {
    return NextResponse.json({ error: "Trade id is required" }, { status: 400 });
  }
  if (!(uiStatus in STATUS_MAP)) {
    return NextResponse.json(
      { error: "Status must be 'active' or 'draft'" },
      { status: 400 },
    );
  }

  if (!usesSupabaseData()) {
    return NextResponse.json(
      {
        error:
          "Trades are seed-managed in demo mode. Connect Supabase to persist status changes.",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("trades")
      .update({ status: STATUS_MAP[uiStatus] })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ trade: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update trade" },
      { status: 500 },
    );
  }
}
