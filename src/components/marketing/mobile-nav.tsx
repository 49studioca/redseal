"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HardHat, Tag, Sparkles, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/trades",
    label: "Trades",
    icon: HardHat,
    match: (p: string) => p.startsWith("/trades"),
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: Tag,
    match: (p: string) => p.startsWith("/pricing"),
  },
  {
    href: "/auth?signup",
    label: "Start free",
    icon: Sparkles,
    match: () => false,
    highlight: true,
  },
  {
    href: "/auth?signin",
    label: "Log in",
    icon: LogIn,
    match: () => false,
  },
] as const;

/**
 * App-like bottom tab bar for the public (non-dashboard) pages, mirroring the
 * dashboard mobile shell. Mobile-only; hidden from `md` up where the top nav
 * takes over. Respects iOS safe-area insets.
 */
export function MarketingMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-[#E5E0D8] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(31,42,55,0.08)] backdrop-blur-xl md:hidden"
      aria-label="Site navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold",
              "highlight" in item && item.highlight
                ? "text-[#C0271E]"
                : active
                  ? "text-[#C0271E]"
                  : "text-[#64748B]",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
