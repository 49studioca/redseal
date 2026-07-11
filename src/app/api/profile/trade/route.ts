import { NextResponse } from "next/server";
import { TRADES } from "@/data/seed";
import { createClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function PATCH(request: Request) {
  const body = await request.json();
  const tradeSlug = String(body.trade_slug ?? "").trim();

  const seedTrade = TRADES.find((trade) => trade.slug === tradeSlug);
  if (!seedTrade || seedTrade.status === "coming_soon") {
    return NextResponse.json({ error: "invalid trade" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({
      trade_slug: seedTrade.slug,
      trade_id: seedTrade.id,
    });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: dbTrade } = await supabase
    .from("trades")
    .select("id")
    .eq("code", seedTrade.code)
    .maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(dbTrade?.id ? { selected_trade_id: dbTrade.id } : {}),
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    trade_slug: seedTrade.slug,
    trade_id: dbTrade?.id ?? seedTrade.id,
  });
}
