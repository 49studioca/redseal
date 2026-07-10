"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LessonMediaAdminControls({
  lessonId,
  lessonSlug,
  chapterTaskCode,
  blockCode,
  tradeCode,
  mediaType,
  mediaSrc,
}: {
  lessonId: string;
  lessonSlug: string;
  chapterTaskCode?: string | null;
  blockCode: string;
  tradeCode: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  imageAssetKeys?: string[];
  videoAlternatives?: { youtubeId: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const regenerate = (mode: "auto" | "manual") => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/lesson-media/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            media_type: mediaType,
            media_src: mediaSrc,
            mode,
            image_src:
              mediaType === "image" && mode === "manual"
                ? imageSrc.trim() || undefined
                : undefined,
            image_alt:
              mediaType === "image" && mode === "manual"
                ? imageAlt.trim() || undefined
                : undefined,
            youtube_id:
              mediaType === "video" && mode === "manual"
                ? youtubeId.trim() || undefined
                : undefined,
            video_title:
              mediaType === "video" && mode === "manual"
                ? videoTitle.trim() || undefined
                : undefined,
            lesson_slug: lessonSlug,
            chapter_task_code: chapterTaskCode,
            block_code: blockCode,
            trade_code: tradeCode,
          }),
        });

        const contentType = res.headers.get("content-type") ?? "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : null;

        if (!res.ok) {
          throw new Error(
            (data && typeof data.error === "string" && data.error) ||
              `Regeneration failed (${res.status})`,
          );
        }

        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Regeneration failed");
      }
    });
  };

  const canApplyManual =
    mediaType === "image"
      ? Boolean(imageSrc.trim())
      : Boolean(youtubeId.trim() && videoTitle.trim());

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
            <div className="space-y-2">
              <p className="text-xs text-[#64748B]">
                AI reads this lesson and finds a matching Wikimedia Commons
                photo, then hosts it in storage.
              </p>
              <input
                value={imageSrc}
                onChange={(e) => setImageSrc(e.target.value)}
                placeholder="Or paste image URL (optional)"
                className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
              />
              <input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Alt text (optional with URL)"
                className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#64748B]">
                AI reads this lesson and finds a matching YouTube training
                video.
              </p>
              <input
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="Or paste YouTube ID or URL (optional)"
                className="w-full rounded-lg border border-[#E5E0D8] bg-white p-2 text-xs outline-none focus:border-[#C0271E]"
              />
              <input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Video title (required with URL)"
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
                  <Sparkles className="h-3 w-3" />
                  Find with AI
                </>
              )}
            </Button>
            {canApplyManual ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => regenerate("manual")}
                className="h-7 px-2 text-xs"
              >
                Apply selected
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {!open && error && <p className="mt-1 text-xs text-[#C0271E]">{error}</p>}
    </div>
  );
}
