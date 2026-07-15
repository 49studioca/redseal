"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Layers,
  Headphones,
  Settings,
  Shield,
  Bookmark,
  BookmarkCheck,
  LogOut,
  Video,
  Menu,
  X,
  Home,
  User,
} from "lucide-react";
import { ProvinceSelector } from "@/components/dashboard/province-selector";
import { HeaderTradeProvinceMenu } from "@/components/dashboard/header-trade-province-menu";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";
import type { ExamReadinessSummary } from "@/lib/progress/exam-readiness";
import {
  SidebarReadiness,
  SidebarProgressCard,
} from "@/components/dashboard/readiness-display";
import { LanguageSelector } from "@/components/translation/language-selector";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { flushPendingAuthEvent, trackEvent } from "@/lib/analytics/track-event";

const navItems = [
  {
    href: "/dashboard/learn",
    label: "Learning Path",
    icon: BookOpen,
    tourId: "tour-nav-learn",
  },
  {
    href: "/dashboard/video-learning",
    label: "Video Learning",
    icon: Video,
    tourId: "tour-nav-video-learning",
  },
  {
    href: "/dashboard/practice",
    label: "Practice",
    icon: ClipboardCheck,
    tourId: "tour-nav-practice",
  },
  {
    href: "/dashboard/saved-questions",
    label: "Saved Questions",
    icon: BookmarkCheck,
  },
  {
    href: "/dashboard/mock-exam",
    label: "Mock Exams",
    icon: Layers,
    tourId: "tour-nav-mock-exam",
  },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Headphones },
  { href: "/dashboard/vocabulary", label: "Saved Words", icon: Bookmark },
];

const mobilePrimaryItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  navItems[0],
  navItems[2],
  navItems[4],
];

interface DashboardSidebarProps {
  trade: Trade;
  readinessSummary: ExamReadinessSummary;
}

export function DashboardSidebar({
  trade,
  readinessSummary,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-0 w-[262px] shrink-0 flex-col overflow-hidden border-r border-[#E5E0D8] bg-white p-4">
      <div
        className="relative shrink-0 overflow-hidden rounded-[13px] bg-gradient-to-br from-[#D8232A] to-[#B01A1F] p-4 text-white"
        data-tour="tour-trade-card"
      >
        <div className="absolute -right-5 -top-5 h-[78px] w-[78px] rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-xl">
            {trade.icon}
          </span>
          <div className="min-w-0">
            <div className="truncate font-[family-name:var(--font-barlow-semi)] text-[15px] font-bold">
              {trade.name}
            </div>
            <div className="font-[family-name:var(--font-ibm-mono)] text-[10.5px] text-[#FBD9DB]">
              Red Seal · {trade.code}
            </div>
          </div>
        </div>
        <SidebarReadiness summary={readinessSummary} />
      </div>

      <div className="my-3 h-px shrink-0 bg-[#ECE6DC]" />

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-[#FCEBEC] text-[#C0271E]"
                  : "text-[#475569] hover:bg-[#F6F3EE]",
              )}
            >
              <Icon className="h-[17px] w-[17px]" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-1.5 shrink-0 space-y-3">
        <LanguageSelector />

        <SidebarProgressCard summary={readinessSummary} />
      </div>
    </aside>
  );
}

export function DashboardHeader({
  trade,
  userName,
  avatarUrl,
  isAdmin,
}: {
  trade: Trade;
  userName?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    flushPendingAuthEvent();
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setIsLoggingOut(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      trackEvent("logout");
      router.push("/auth?signin");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      active:
        pathname === "/dashboard/profile" ||
        pathname.startsWith("/dashboard/profile/"),
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: CreditCard,
      active:
        pathname === "/dashboard/billing" ||
        pathname.startsWith("/dashboard/billing/"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active:
        pathname === "/dashboard/settings" ||
        pathname.startsWith("/dashboard/settings/"),
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            icon: Shield,
            active: pathname.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 flex h-[60px] shrink-0 items-center gap-3 bg-[#1F2A37] px-4 shadow-[0_1px_0_rgba(255,255,255,0.06)] sm:h-[68px] sm:gap-5 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/redseal-logo.svg"
          alt="RedSealGuide"
          width={38}
          height={38}
        />
        <div className="hidden leading-none min-[390px]:block">
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[21px] font-bold uppercase tracking-wide text-white">
            RedSealGuide
          </div>
          <div className="hidden font-[family-name:var(--font-ibm-mono)] text-[10px] tracking-wide text-[#7DA0BD] sm:block">
            redsealguide.com
          </div>
        </div>
      </Link>
      <div className="flex-1" />
      <HeaderTradeProvinceMenu trade={trade} />
      <div className="relative" ref={menuRef} data-tour="tour-profile">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-[#D8232A] to-[#A81A1F] text-sm font-bold text-white transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-[38px] sm:w-[38px]"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            (userName ?? "U").slice(0, 2).toUpperCase()
          )}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] overflow-hidden rounded-[10px] border border-white/10 bg-[#1F2A37] py-1 shadow-lg"
          >
            <ProvinceSelector variant="menu" />
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                    item.active
                      ? "bg-white/10 text-white"
                      : "text-[#CBD5E1] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-1 h-px bg-white/10" />
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13.5px] font-semibold text-[#FCA5A5] transition-colors hover:bg-white/5 hover:text-[#FECACA] disabled:opacity-60"
            >
              <LogOut className="h-[17px] w-[17px]" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const secondaryItems = [
    ...navItems.slice(1, 2),
    ...navItems.slice(3, 4),
    ...navItems.slice(5),
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: CreditCard,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          <button
            className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-[2px]"
            onClick={() => setMoreOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#CBD5E1]" />
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-lg font-bold">More tools</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F3EE]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 font-semibold",
                      active
                        ? "border-[#F3C5C7] bg-[#FCEBEC] text-[#C0271E]"
                        : "border-[#E5E0D8] text-[#334155]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-[#E5E0D8] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(31,42,55,0.08)] backdrop-blur-xl md:hidden"
        aria-label="Dashboard navigation"
      >
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold",
                active ? "text-[#C0271E]" : "text-[#64748B]",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">
                {item.label === "Learning Path"
                  ? "Learn"
                  : item.label === "Mock Exams"
                    ? "Exams"
                    : item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-bold",
            moreOpen ||
              secondaryItems.some(
                (item) =>
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/"),
              )
              ? "text-[#C0271E]"
              : "text-[#64748B]",
          )}
          aria-expanded={moreOpen}
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
