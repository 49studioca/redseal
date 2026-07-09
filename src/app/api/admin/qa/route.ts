import { NextResponse } from "next/server";
import {
  fetchAdminReports,
  requireAdminUser,
  updateReportStatus,
  type ReportStatus,
} from "@/lib/admin/reports-queue";

const VALID_STATUSES: ReportStatus[] = [
  "open",
  "triaged",
  "resolved",
  "dismissed",
];

export async function GET() {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const items = await fetchAdminReports();
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load reports" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const id = String(body.id ?? "").trim();
  const type = body.type as "question" | "lesson_media";
  const status = body.status as ReportStatus;

  if (!id || !type || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (type !== "question" && type !== "lesson_media") {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  const updated = await updateReportStatus(type, id, status);
  if (!updated) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ id, type, status, updated: true });
}
