import { NextResponse } from "next/server";
import {
  fetchDraftQueue,
  updateDraftStatus,
  type DraftContentType,
} from "@/lib/admin/draft-queue";

export async function GET() {
  const items = await fetchDraftQueue();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const { id, content_type, status, related_ids } = await request.json();

  if (!id || !content_type || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  const updated = await updateDraftStatus(
    id,
    content_type as DraftContentType,
    status,
    related_ids,
  );

  if (!updated) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ id, content_type, status, updated: true });
}
