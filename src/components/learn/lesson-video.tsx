"use client";

import { disableYoutubeCaptions } from "@/lib/youtube/disable-captions";
import { loadYoutubeIframeApi } from "@/lib/youtube/iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";
import { LessonMediaReport } from "@/components/learn/lesson-media-report";
import { LessonMediaAdminControls } from "@/components/learn/lesson-media-admin";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

function parseYoutubeId(content: string): string {
  const trimmed = content.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1);
    }
    return url.searchParams.get("v") ?? trimmed;
  } catch {
    return trimmed;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function LessonVideo({
  content,
  title,
  lessonId,
  lessonSlug,
  chapterTaskCode,
  blockCode,
  blockIndex,
  isAdmin,
  tradeCode,
  videoAlternatives,
}: {
  content: string;
  title?: string;
  lessonId?: string;
  lessonSlug?: string;
  chapterTaskCode?: string | null;
  blockCode?: string;
  blockIndex?: number;
  isAdmin?: boolean;
  tradeCode?: string;
  videoAlternatives?: { youtubeId: string; title: string }[];
}) {
  const videoId = parseYoutubeId(content);
  const playerElementId = `yt-${useId().replace(/:/g, "")}`;
  const playerRef = useRef<YTPlayer | null>(null);
  const seekingRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const syncTime = useCallback(() => {
    const player = playerRef.current;
    if (!player || seekingRef.current) return;
    const next = player.getCurrentTime();
    setCurrentTime(next);
    setSeekValue(next);
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [playing]);

  useEffect(() => {
    let cancelled = false;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          controls: 0,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
          ...(typeof window !== "undefined"
            ? { origin: window.location.origin }
            : {}),
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            disableYoutubeCaptions(event.target);
            const total = event.target.getDuration();
            setDuration(total);
            setReady(true);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            const { ENDED, PLAYING, PAUSED } = window.YT!.PlayerState;

            if (event.data === PLAYING) {
              disableYoutubeCaptions(event.target);
              setPlaying(true);
              clearTick();
              tickRef.current = setInterval(syncTime, 250);
              return;
            }

            setPlaying(false);
            clearTick();
            syncTime();

            if (event.data === ENDED) {
              setCurrentTime(0);
              setSeekValue(0);
              return;
            }

            if (event.data === PAUSED) {
              syncTime();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      clearTick();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [clearTick, playerElementId, syncTime, videoId]);

  const handleSeekStart = () => {
    seekingRef.current = true;
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
    setCurrentTime(value);
  };

  const handleSeekEnd = (value: number) => {
    seekingRef.current = false;
    playerRef.current?.seekTo(value, true);
    setSeekValue(value);
    setCurrentTime(value);
  };

  const maxDuration = duration > 0 ? duration : Math.max(seekValue, 1);

  return (
    <figure className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white">
      {title && (
        <figcaption className="border-b border-[#E5E0D8] px-4 py-2 text-sm font-semibold text-[#1F2A37]">
          {title}
        </figcaption>
      )}
      <div className="relative aspect-video w-full bg-[#1F2A37]">
        {!ready && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-white/80">
                Loading video…
              </span>
            </div>
          </>
        )}
        <div
          id={playerElementId}
          className="pointer-events-none absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
        />
        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready}
          aria-label={playing ? "Pause video" : "Play video"}
          className="absolute inset-0 z-20 cursor-pointer disabled:cursor-wait"
        />
      </div>
      <div className="flex items-center gap-3 border-t border-[#E5E0D8] px-4 py-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready}
          aria-label={playing ? "Pause video" : "Play video"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C0271E] text-white transition-colors hover:bg-[#A82018] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>
        <span className="w-10 shrink-0 text-xs tabular-nums text-[#64748B]">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={maxDuration}
          step={0.1}
          value={seekValue}
          disabled={!ready}
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={maxDuration}
          aria-valuenow={seekValue}
          onPointerDown={handleSeekStart}
          onChange={(event) => handleSeekChange(Number(event.target.value))}
          onPointerUp={(event) =>
            handleSeekEnd(Number(event.currentTarget.value))
          }
          onKeyUp={(event) => handleSeekEnd(Number(event.currentTarget.value))}
          className="lesson-video-seek h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#E5E0D8] disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#C0271E] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C0271E]"
        />
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[#64748B]">
          {duration > 0 ? formatTime(duration) : "--:--"}
        </span>
        {lessonId != null && blockIndex != null && (
          <LessonMediaReport
            lessonId={lessonId}
            blockIndex={blockIndex}
            mediaType="video"
            mediaSrc={videoId}
            mediaLabel={title}
            className="shrink-0 text-xs"
          />
        )}
      </div>
      {isAdmin && lessonId && lessonSlug && blockCode && tradeCode && (
        <LessonMediaAdminControls
          lessonId={lessonId}
          lessonSlug={lessonSlug}
          chapterTaskCode={chapterTaskCode}
          blockCode={blockCode}
          tradeCode={tradeCode}
          mediaType="video"
          mediaSrc={videoId}
          videoAlternatives={videoAlternatives}
        />
      )}
    </figure>
  );
}
