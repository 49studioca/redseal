import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import {
  fetchBlockVideoById,
  saveVideoProgress,
} from "@/lib/content/block-videos";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function GET(
  _request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  if (!usesSupabaseData()) {
    return NextResponse.json({ error: "Not available" }, { status: 503 });
  }

  const { videoId } = await context.params;
  const supabase = await createClient();
  const user = await getServerSessionUser();

  try {
    const video = await fetchBlockVideoById(supabase, videoId, user?.id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    return NextResponse.json({ video });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load video",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ videoId: string }> },
) {
  if (!usesSupabaseData()) {
    return NextResponse.json({ error: "Not available" }, { status: 503 });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await context.params;
  const body = await request.json();
  const questionsAttempted = Number(body.questions_attempted ?? 0);
  const questionsCorrect = Number(body.questions_correct ?? 0);
  const completed = Boolean(body.completed);

  const supabase = await createClient();

  try {
    await saveVideoProgress(supabase, {
      userId: user.id,
      videoId,
      questionsAttempted,
      questionsCorrect,
      completed,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save progress",
      },
      { status: 500 },
    );
  }
}
