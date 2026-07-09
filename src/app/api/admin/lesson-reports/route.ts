import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { usesSupabaseData } from "@/lib/supabase/config";
import type { LessonMediaReportRow } from "@/lib/admin/lesson-media";

export async function GET(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "open";

  if (!usesSupabaseData() || !auth.supabase) {
    return NextResponse.json({ reports: [] as LessonMediaReportRow[] });
  }

  let query = auth.supabase
    .from("lesson_media_reports")
    .select(
      `
      id,
      lesson_id,
      block_index,
      media_type,
      media_src,
      reason,
      details,
      status,
      created_at,
      lesson:lessons (
        id,
        title,
        slug,
        chapter_task_code,
        trade:trades ( code, name ),
        block:rsos_blocks ( code, name )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
