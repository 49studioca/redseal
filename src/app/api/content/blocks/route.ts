import { NextResponse } from "next/server";
import { fetchBlocks } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");

  if (!tradeId) {
    return NextResponse.json({ error: "tradeId required" }, { status: 400 });
  }

  const blocks = await fetchBlocks(tradeId);
  return NextResponse.json({ blocks });
}
