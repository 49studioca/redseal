import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { validateReportDetails } from "@/lib/moderation/comment-content";

const VALID_REASONS = [
  "not_related",
  "broken_media",
  "inappropriate",
  "other",
] as const;

const VALID_MEDIA_TYPES = ["image", "video"] as const;

export async function POST(request: Request) {
  const body = await request.json();
  const lessonId = String(body.lesson_id ?? "").trim();
  const blockIndex = Number(body.block_index);
  const mediaType = String(body.media_type ?? "").trim();
  const mediaSrc = String(body.media_src ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const details = body.details ? String(body.details).trim() : null;

  if (!lessonId || !mediaSrc || !reason) {
    return NextResponse.json(
      { error: "lesson_id, media_src, and reason are required" },
      { status: 400 },
    );
  }

  if (!Number.isInteger(blockIndex) || blockIndex < 0) {
    return NextResponse.json({ error: "invalid block_index" }, { status: 400 });
  }

  if (!VALID_MEDIA_TYPES.includes(mediaType as (typeof VALID_MEDIA_TYPES)[number])) {
    return NextResponse.json({ error: "invalid media_type" }, { status: 400 });
  }

  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json({ error: "invalid reason" }, { status: 400 });
  }

  if (details) {
    const moderation = validateReportDetails(details);
    if (!moderation.ok) {
      return NextResponse.json({ error: moderation.message }, { status: 400 });
    }
  }

  if (!usesSupabaseData()) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      status: "open",
      submitted: true,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("lesson_media_reports")
    .insert({
      lesson_id: lessonId,
      block_index: blockIndex,
      media_type: mediaType,
      media_src: mediaSrc,
      user_id: user.id,
      reason,
      details,
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, submitted: true });
}
