import { notFound } from "next/navigation";
import { VideoWatchClient } from "@/components/video-learning/video-watch-client";
import { fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { fetchBlockVideoById } from "@/lib/content/block-videos";
import { usesSupabaseData } from "@/lib/supabase/config";
import { getServerSessionUser } from "@/lib/supabase/server-auth";

export default async function VideoLearningWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ rewatch?: string }>;
}) {
  const { videoId } = await params;
  const { rewatch } = await searchParams;
  const startRewatch = rewatch === "1";
  const { trade } = await getDashboardSession();

  if (!usesSupabaseData()) {
    notFound();
  }

  const supabase = await createClient();
  const user = await getServerSessionUser();
  const video = await fetchBlockVideoById(supabase, videoId, user?.id);

  if (!video || video.trade_id !== trade.id) {
    notFound();
  }

  const blocks = await fetchBlocks(trade.id);
  const block = blocks.find((b) => b.id === video.block_id);
  const blockLabel = block ? `Block ${block.code} — ${block.name}` : undefined;

  return (
    <VideoWatchClient
      video={video}
      blockLabel={blockLabel}
      startRewatch={startRewatch}
    />
  );
}
