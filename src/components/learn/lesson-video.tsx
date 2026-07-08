"use client";

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

  return (
    <figure className="overflow-hidden rounded-xl border border-[#E5E0D8] bg-white">
      {title && (
        <figcaption className="border-b border-[#E5E0D8] px-4 py-2 text-sm font-semibold text-[#1F2A37]">
          {title}
        </figcaption>
      )}
      <div className="relative aspect-video w-full bg-[#1F2A37]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title ?? "Lesson video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </figure>
  );
}
