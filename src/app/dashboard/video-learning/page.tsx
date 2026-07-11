import { Video } from "lucide-react";
import { VideoLearningList } from "@/components/video-learning/video-learning-list";
import { fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { fetchBlockVideosForTrade } from "@/lib/content/block-videos";
import { usesSupabaseData } from "@/lib/supabase/config";
import { getServerSessionUser } from "@/lib/supabase/server-auth";

export default async function VideoLearningPage() {
  const { trade } = await getDashboardSession();
  const blocks = await fetchBlocks(trade.id);

  let videos: Awaited<ReturnType<typeof fetchBlockVideosForTrade>> = [];

  if (usesSupabaseData()) {
    const supabase = await createClient();
    const user = await getServerSessionUser();
    videos = await fetchBlockVideosForTrade(supabase, trade.id, user?.id);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-center gap-3">
        <Video className="h-7 w-7 text-[#C0271E]" />
        <div>
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            Video Learning
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Watch curated training videos for each RSOS block and prove you
            understood the material.
          </p>
        </div>
      </div>

      <VideoLearningList blocks={blocks} videos={videos} />
    </div>
  );
}
