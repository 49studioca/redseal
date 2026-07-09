import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function PATCH(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const reportId = String(body.report_id ?? "").trim();
  const status = String(body.status ?? "").trim();
  const adminNotes = body.admin_notes
    ? String(body.admin_notes).trim()
    : null;

  if (!reportId || !["resolved", "dismissed", "triaged"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!usesSupabaseData() || !auth.supabase) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const { error } = await auth.supabase
    .from("lesson_media_reports")
    .update({
      status,
      admin_notes: adminNotes,
      resolved_at:
        status === "resolved" || status === "dismissed"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", reportId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
