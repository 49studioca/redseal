import { requireAdmin } from "@/lib/admin/require-admin";
import { usesSupabaseData } from "@/lib/supabase/config";
import { AdminQAClient } from "@/components/admin/admin-qa-client";
import type { LessonMediaReportRow } from "@/lib/admin/lesson-media";

export default async function AdminQAPage() {
  const { supabase } = await requireAdmin();

  let reports: LessonMediaReportRow[] = [];

  if (usesSupabaseData()) {
    const { data } = await supabase
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
      .eq("status", "open")
      .order("created_at", { ascending: false });

    reports = (data ?? []) as unknown as LessonMediaReportRow[];
  }

  return <AdminQAClient initialReports={reports} />;
}
