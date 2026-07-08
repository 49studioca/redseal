"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function LessonImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const [failed, setFailed] = useState(false);

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
          src={src}
          alt={alt}
          className="mx-auto h-auto max-h-[420px] w-full object-contain bg-[#F8FAFC]"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
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
