"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { StoryQuote } from "@/components/marketing/apprentice-stories";
import { StoryAvatar } from "@/components/marketing/story-avatar";

function StoryCard({ story }: { story: StoryQuote }) {
  return (
    <article className="flex h-[156px] shrink-0 flex-col rounded-[18px] border border-[#E5E0D8] bg-[#FAF8F4] px-4 py-3.5 sm:px-5">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#F4A11A] text-[#F4A11A]" />
        ))}
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-[#334155]">
        &ldquo;{story.quote}&rdquo;
      </p>
      <div className="mt-2.5 flex items-center gap-3">
        <StoryAvatar story={story} size="sm" />
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#1F2A37]">{story.name}</div>
          <div className="truncate text-xs text-[#64748B]">
            {story.role} · {story.place}
          </div>
        </div>
      </div>
    </article>
  );
}

export function TestimonialRoll({ stories }: { stories: StoryQuote[] }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const items = reduceMotion ? stories : [...stories, ...stories];

  return (
    <div className="relative h-[368px] overflow-hidden rounded-[24px] border border-[#E5E0D8] bg-white">
      {!reduceMotion && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white to-transparent" />
        </>
      )}
      <div
        className={
          reduceMotion
            ? "flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-5"
            : "testimonial-roll-track flex flex-col gap-4 p-4 sm:p-5"
        }
      >
        {items.map((story, index) => (
          <StoryCard key={`${story.name}-${index}`} story={story} />
        ))}
      </div>
    </div>
  );
}
