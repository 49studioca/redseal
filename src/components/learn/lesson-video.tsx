"use client";

import { ExternalLink } from "lucide-react";

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

export function LessonVideo({
  content,
  title,
}: {
  content: string;
  title?: string;
}) {
  const id = parseYoutubeId(content);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;

  return (
    <figure className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white">
      {title && (
        <figcaption className="border-b border-[#E5E0D8] px-4 py-2 text-sm font-semibold text-[#1F2A37]">
          {title}
        </figcaption>
      )}
      <div className="relative aspect-video w-full bg-[#1F2A37]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={title ?? "Lesson video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 z-10 h-full w-full"
        />
      </div>
      <div className="border-t border-[#E5E0D8] px-4 py-2">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C0271E]"
        >
          Watch on YouTube if the player does not load
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </figure>
  );
}
