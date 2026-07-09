import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const body = await request.json();
  const reportId = String(body.report_id ?? "").trim();
  const suggestedSrc = String(body.suggested_src ?? "").trim();
  const suggestedLabel = body.suggested_label
    ? String(body.suggested_label).trim()
    : null;

  if (!reportId || !suggestedSrc) {
    return NextResponse.json(
      { error: "report_id and suggested_src are required" },
      { status: 400 },
    );
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: report } = await supabase
    .from("lesson_media_reports")
    .select("id, details, user_id")
    .eq("id", reportId)
    .single();

  if (!report || report.user_id !== user.id) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const suggestionLine = suggestedLabel
    ? `Suggested replacement: ${suggestedLabel} (${suggestedSrc})`
    : `Suggested replacement: ${suggestedSrc}`;

  const details = report.details
    ? `${report.details}\n\n${suggestionLine}`
    : suggestionLine;

  const service = await createServiceClient();
  const { error } = await service
    .from("lesson_media_reports")
    .update({
      details,
      status: "triaged",
    })
    .eq("id", reportId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
