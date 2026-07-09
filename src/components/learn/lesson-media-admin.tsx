"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenerateLessonMediaAction } from "@/lib/admin/lesson-media-actions";

type VideoOption = { youtubeId: string; title: string };

export function LessonMediaAdminControls({
  lessonId,
  lessonSlug,
  chapterTaskCode,
  blockCode,
  tradeCode,
  mediaType,
  mediaSrc,
  imageAssetKeys = [],
  videoAlternatives = [],
}: {
  lessonId: string;
  lessonSlug: string;
  chapterTaskCode?: string | null;
  blockCode: string;
  tradeCode: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  imageAssetKeys?: string[];
  videoAlternatives?: VideoOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(imageAssetKeys[0] ?? "");
  const [youtubeId, setYoutubeId] = useState(
    videoAlternatives[0]?.youtubeId ?? "",
  );
  const [videoTitle, setVideoTitle] = useState(
    videoAlternatives[0]?.title ?? "",
  );

  const regenerate = (mode: "auto" | "manual") => {
    setError(null);
    startTransition(async () => {
      try {
        await regenerateLessonMediaAction({
          lessonId,
          lessonSlug,
          chapterTaskCode,
          blockCode,
          tradeCode,
          mediaType,
          mediaSrc,
          mode,
          imageKey: mediaType === "image" ? imageKey : undefined,
          youtubeId: mediaType === "video" ? youtubeId : undefined,
          videoTitle: mediaType === "video" ? videoTitle : undefined,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Regeneration failed");
      }
    });
  };

  return (
    <div className="border-t border-[#E5E0D8] bg-[#FFFBF7] px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
          <Settings2 className="h-3 w-3" />
          Admin
        </span>
        {!open ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            className="h-7 px-2 text-xs"
          >
            Replace {mediaType}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-7 px-2 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          {mediaType === "image" ? (
            <select
              value={imageKey}
              onChange={(e) => setImageKey(e.target.value)}
              className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
            >
              {imageAssetKeys.map((key) => (
                <option key={key} value={key}>
                  {key.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              {videoAlternatives.length > 0 && (
                <select
                  value={youtubeId}
                  onChange={(e) => {
                    const picked = videoAlternatives.find(
                      (v) => v.youtubeId === e.target.value,
                    );
                    setYoutubeId(e.target.value);
                    if (picked) setVideoTitle(picked.title);
                  }}
                  className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
                >
                  {videoAlternatives.map((video) => (
                    <option key={video.youtubeId} value={video.youtubeId}>
                      {video.title}
                    </option>
                  ))}
                </select>
              )}
              <input
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="YouTube ID or URL"
                className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
              />
              <input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Video title"
                className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
              />
            </div>
          )}

          {error && <p className="text-xs text-[#C0271E]">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => regenerate("auto")}
              className="h-7 px-2 text-xs"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Auto-pick
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => regenerate("manual")}
              className="h-7 px-2 text-xs"
            >
              Apply selected
            </Button>
          </div>
        </div>
      )}

      {!open && error && <p className="mt-1 text-xs text-[#C0271E]">{error}</p>}
    </div>
  );
}
