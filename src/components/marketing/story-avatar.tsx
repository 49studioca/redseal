import { apprenticeAvatarUrl } from "@/lib/avatars/options";
import { cn } from "@/lib/utils";

export function StoryAvatar({
  story,
  size = "md",
  className,
}: {
  story: { name: string; avatarSeed: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-white",
        dim,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={apprenticeAvatarUrl(story.avatarSeed)}
        alt=""
        width={size === "lg" ? 44 : 36}
        height={size === "lg" ? 44 : 36}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <span className="sr-only">{story.name}</span>
    </span>
  );
}
