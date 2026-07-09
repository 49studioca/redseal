import { createClient, createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

export type ReportStatus = "open" | "triaged" | "resolved" | "dismissed";

export type QuestionReportItem = {
  id: string;
  type: "question";
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  question_id: string;
  question_stem: string;
};

export type LessonMediaReportItem = {
  id: string;
  type: "lesson_media";
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  lesson_id: string;
  lesson_title: string;
  lesson_slug: string;
  block_index: number;
  media_type: "image" | "video";
  media_src: string;
};

export type AdminReportItem = QuestionReportItem | LessonMediaReportItem;

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const, status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Forbidden" as const, status: 403 as const };
  }

  return { user };
}

export async function fetchAdminReports(): Promise<AdminReportItem[]> {
  if (!usesSupabaseData()) return [];

  const supabase = await createServiceClient();

  const [questionResult, mediaResult] = await Promise.all([
    supabase
      .from("question_reports")
      .select("id, reason, details, status, created_at, question_id, questions(stem)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("lesson_media_reports")
      .select(
        "id, reason, details, status, created_at, lesson_id, block_index, media_type, media_src, lessons(title, slug)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (questionResult.error) throw new Error(questionResult.error.message);
  if (mediaResult.error) throw new Error(mediaResult.error.message);

  const questionReports: QuestionReportItem[] = (questionResult.data ?? []).map(
    (row) => {
      const question = row.questions as { stem?: string } | null;
      return {
        id: row.id,
        type: "question",
        reason: row.reason,
        details: row.details,
        status: row.status as ReportStatus,
        created_at: row.created_at,
        question_id: row.question_id,
        question_stem: question?.stem ?? "Unknown question",
      };
    },
  );

  const mediaReports: LessonMediaReportItem[] = (mediaResult.data ?? []).map(
    (row) => {
      const lesson = row.lessons as { title?: string; slug?: string } | null;
      return {
        id: row.id,
        type: "lesson_media",
        reason: row.reason,
        details: row.details,
        status: row.status as ReportStatus,
        created_at: row.created_at,
        lesson_id: row.lesson_id,
        lesson_title: lesson?.title ?? "Unknown lesson",
        lesson_slug: lesson?.slug ?? "",
        block_index: row.block_index,
        media_type: row.media_type as "image" | "video",
        media_src: row.media_src,
      };
    },
  );

  return [...questionReports, ...mediaReports].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function updateReportStatus(
  type: "question" | "lesson_media",
  id: string,
  status: ReportStatus,
): Promise<boolean> {
  if (!usesSupabaseData()) return false;

  const table =
    type === "question" ? "question_reports" : "lesson_media_reports";
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from(table)
    .update({
      status,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id")
    .single();

  return !error && !!data;
}
