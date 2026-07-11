"use client";

import Link from "next/link";
import { CheckCircle2, Play, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cleanYoutubeTitle } from "@/lib/youtube/title";
import type {
  BlockLearningVideo,
  BlockVideoQuestion,
  RsosBlock,
} from "@/types";

export type VideoWithMeta = BlockLearningVideo & {
  questions: BlockVideoQuestion[];
  progress?: {
    completed: boolean;
    questions_correct: number;
    questions_attempted: number;
  };
};

interface VideoLearningListProps {
  blocks: RsosBlock[];
  videos: VideoWithMeta[];
}

export function VideoLearningList({ blocks, videos }: VideoLearningListProps) {
  const videosByBlock = new Map<string, VideoWithMeta[]>();
  for (const video of videos) {
    const list = videosByBlock.get(video.block_id) ?? [];
    list.push(video);
    videosByBlock.set(video.block_id, list);
  }

  const blocksWithVideos = blocks.filter((b) => videosByBlock.has(b.id));
  const totalVideos = videos.length;
  const completedCount = videos.filter((v) => v.progress?.completed).length;

  if (totalVideos === 0) {
    return (
      <Card className="mt-8 border-dashed p-10 text-center">
        <Video className="mx-auto h-10 w-10 text-[#94A3B8]" />
        <h2 className="mt-4 font-semibold text-[#1F2A37]">
          No training videos yet
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Curated YouTube videos for your trade blocks will appear here once
          published by your instructor team.
        </p>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <Card className="border-[#E5E0D8] bg-[#FFFBF7] p-5">
        <p className="text-sm text-[#475569]">
          Watch trade training videos aligned to each RSOS block, then answer
          comprehension questions to lock in what you learned.{" "}
          <span className="font-semibold text-[#1F2A37]">
            {completedCount}/{totalVideos}
          </span>{" "}
          videos completed.
        </p>
      </Card>

      {blocksWithVideos.map((block) => {
        const blockVideos = videosByBlock.get(block.id) ?? [];
        const blockCompleted = blockVideos.filter(
          (v) => v.progress?.completed,
        ).length;

        return (
          <section key={block.id}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                  Block {block.code}
                </span>
                <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
                  {block.name}
                </h2>
              </div>
              <span className="text-xs text-[#64748B]">
                {blockCompleted}/{blockVideos.length} done
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blockVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function VideoCard({ video }: { video: VideoWithMeta }) {
  const completed = video.progress?.completed;
  const questionCount = video.questions.length;
  const displayTitle = cleanYoutubeTitle(video.title);
  const watchHref = completed
    ? `/dashboard/video-learning/${video.id}?rewatch=1`
    : `/dashboard/video-learning/${video.id}`;

  return (
    <Card className="overflow-hidden transition hover:border-[#C0271E]/40 hover:shadow-md">
      <Link
        href={watchHref}
        className="group relative block aspect-video bg-[#1F2A37]"
        aria-label={
          completed ? `Watch again: ${displayTitle}` : `Watch: ${displayTitle}`
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover transition duration-200 group-hover:brightness-90"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/35">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C0271E] text-white shadow-lg transition group-hover:scale-105">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>
        {completed && (
          <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#10B981] px-2 py-0.5 text-[10px] font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        )}
      </Link>
      <div className="p-4">
        {video.topic_label && (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#F4A11A]">
            {video.topic_label}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[#1F2A37]">
          {displayTitle}
        </h3>
        <p className="mt-2 text-xs text-[#64748B]">
          {questionCount} check-in question{questionCount === 1 ? "" : "s"}
        </p>
        {completed ? (
          <div className="mt-3 flex gap-2">
            <Link
              href={watchHref}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "flex-1",
              )}
            >
              Watch again
            </Link>
            <Link
              href={`/dashboard/video-learning/${video.id}`}
              className={cn(buttonVariants({ size: "sm" }), "flex-1")}
            >
              Review
            </Link>
          </div>
        ) : (
          <Link
            href={watchHref}
            className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
          >
            Watch & learn
          </Link>
        )}
      </div>
    </Card>
  );
}
