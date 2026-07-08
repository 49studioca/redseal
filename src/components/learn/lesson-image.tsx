"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { resolveLessonImageSrc } from "@/lib/storage/lesson-images";

function wikimediaFallbackSrc(src: string): string | null {
  const match = src.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)\/\d+px-[^/]+$/i,
  );
  if (!match) return null;
  return `https://upload.wikimedia.org/wikipedia/commons/${match[1]}/${match[2]}`;
}

function imageCandidates(src: string): string[] {
  const candidates = [src];
  const fallback = wikimediaFallbackSrc(src);
  if (fallback && fallback !== src) candidates.push(fallback);
  return candidates;
}

export function LessonImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const resolvedSrc = useMemo(() => resolveLessonImageSrc(src), [src]);
  const candidates = useMemo(() => imageCandidates(resolvedSrc), [resolvedSrc]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const activeSrc = candidates[candidateIndex] ?? src;
  const failed = candidateIndex >= candidates.length;

  useEffect(() => {
    setCandidateIndex(0);
  }, [resolvedSrc]);

  const handleError = () => {
    setCandidateIndex((index) => index + 1);
  };

  return (
    <figure className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white">
      {failed ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 bg-[#F8FAFC] px-6 py-10 text-center">
          <ImageIcon className="h-8 w-8 text-[#94A3B8]" />
          <p className="text-sm text-[#64748B]">Image unavailable</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          className="mx-auto h-auto max-h-[420px] w-full object-contain bg-[#F8FAFC]"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      )}
      {(caption || alt) && (
        <figcaption className="px-4 py-2 text-sm text-[#64748B]">
          {caption ?? alt}
        </figcaption>
      )}
    </figure>
  );
}
