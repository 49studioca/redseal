"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Layers,
  Headphones,
  Settings,
  Shield,
  Bookmark,
  BookmarkCheck,
  LogOut,
} from "lucide-react";
import { ProvinceSelector } from "@/components/dashboard/province-selector";
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "Learning Path", icon: BookOpen },
  { href: "/dashboard/practice", label: "Practice", icon: ClipboardCheck },
  {
    href: "/dashboard/saved-questions",
    label: "Saved Questions",
    icon: BookmarkCheck,
  },
  { href: "/dashboard/mock-exam", label: "Mock Exams", icon: Layers },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Headphones },
  { href: "/dashboard/vocabulary", label: "Saved Words", icon: Bookmark },
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
      <div className="relative shrink-0 overflow-hidden rounded-[13px] bg-gradient-to-br from-[#D8232A] to-[#B01A1F] p-4 text-white">
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
  isAdmin,
}: {
  trade: Trade;
  userName?: string;
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

  const handleLogout = async () => {
    setMenuOpen(false);
    setIsLoggingOut(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      router.push("/auth/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
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
    <header className="sticky top-0 z-40 flex h-[68px] shrink-0 items-center gap-5 bg-[#1F2A37] px-6 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/redseal-logo.svg"
          alt="RedSealGuide"
          width={38}
          height={38}
        />
        <div className="leading-none">
          <div className="font-[family-name:var(--font-barlow-condensed)] text-[21px] font-bold uppercase tracking-wide text-white">
            RedSealGuide
          </div>
          <div className="font-[family-name:var(--font-ibm-mono)] text-[10px] tracking-wide text-[#7DA0BD]">
            redsealguide.com
          </div>
        </div>
      </Link>
      <div className="flex-1" />
      <div className="flex h-[42px] items-center gap-2.5 rounded-[10px] border border-white/15 bg-white/5 px-3.5 text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C0271E] text-sm">
          {trade.icon}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7DA0BD]">
            Your trade
          </span>
          <span className="text-sm font-bold">{trade.short_name}</span>
        </div>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-[#D8232A] to-[#A81A1F] text-sm font-bold text-white transition-colors hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {(userName ?? "U").slice(0, 2).toUpperCase()}
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
