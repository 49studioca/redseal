import { NextResponse } from "next/server";
import { fetchLessons } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeId = searchParams.get("tradeId");
  const slug = searchParams.get("slug");

  if (!tradeId) {
    return NextResponse.json({ error: "tradeId required" }, { status: 400 });
  }

  const lessons = await fetchLessons(tradeId);
  if (slug) {
    const lesson = lessons.find((l) => l.slug === slug);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json({ lesson });
  }
  return NextResponse.json({ lessons });
}
