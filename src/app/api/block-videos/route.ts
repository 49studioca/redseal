import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { fetchBlockVideosForTrade } from "@/lib/content/block-videos";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!usesSupabaseData()) {
    return NextResponse.json({ videos: [] });
  }

  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("trade_id");
  if (!tradeId) {
    return NextResponse.json({ error: "trade_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const user = await getServerSessionUser();

  try {
    const videos = await fetchBlockVideosForTrade(
      supabase,
      tradeId,
      user?.id,
    );
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load videos",
      },
      { status: 500 },
    );
  }
}
