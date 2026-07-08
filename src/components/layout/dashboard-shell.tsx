"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Layers,
  Headphones,
  Settings,
  Shield,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";
import { LanguageSelector } from "@/components/translation/language-selector";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "Learning Path", icon: BookOpen },
  { href: "/dashboard/practice", label: "Practice", icon: ClipboardCheck },
  { href: "/dashboard/mock-exam", label: "Mock Exams", icon: Layers },
  { href: "/dashboard/flashcards", label: "Flashcards", icon: Headphones },
  { href: "/dashboard/vocabulary", label: "Saved Words", icon: Bookmark },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  trade: Trade;
  readiness?: number;
  isAdmin?: boolean;
}

export function DashboardSidebar({
  trade,
  readiness = 0,
  isAdmin,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[262px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-[#E5E0D8] bg-white p-4">
      <div className="relative overflow-hidden rounded-[13px] bg-gradient-to-br from-[#D8232A] to-[#B01A1F] p-4 text-white">
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
        <div className="relative mt-3.5 flex items-center justify-between text-[11px] font-semibold text-[#FCE3E4]">
          <span>Exam readiness</span>
          <span className="font-[family-name:var(--font-ibm-mono)] font-bold text-white">
            {readiness}%
          </span>
        </div>
        <div className="relative mt-1.5 h-1.5 overflow-hidden rounded bg-white/20">
          <div
            className="h-full rounded bg-white transition-all duration-700"
            style={{ width: `${readiness}%` }}
          />
        </div>
      </div>

      <div className="my-3 h-px bg-[#ECE6DC]" />

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

      {isAdmin && (
        <>
          <div className="my-3 h-px bg-[#ECE6DC]" />
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold",
              pathname.startsWith("/admin")
                ? "bg-[#1F2A37] text-white"
                : "text-[#475569] hover:bg-[#F6F3EE]",
            )}
          >
            <Shield className="h-[17px] w-[17px]" />
            Admin
          </Link>
        </>
      )}

      <div className="flex-1" />

      <LanguageSelector />

      <div className="relative mt-3 overflow-hidden rounded-[13px] bg-[#1F2A37] p-4 text-white">
        <div className="absolute -right-[18px] -top-[18px] h-20 w-20 rounded-full bg-[#F4A11A]/15" />
        <div className="relative text-[11px] font-bold uppercase tracking-wide text-[#F4A11A]">
          Exam prep
        </div>
        <div className="relative mt-2 font-[family-name:var(--font-barlow-condensed)] text-[23px] font-bold leading-none">
          {trade.exam_question_count} questions
        </div>
        <div className="relative mt-1 text-xs text-[#9FBBD2]">
          <b className="font-[family-name:var(--font-ibm-mono)] text-white">
            {trade.exam_time_minutes / 60}h
          </b>{" "}
          time limit · {trade.pass_percentage}% to pass
        </div>
      </div>
    </aside>
  );
}

export function DashboardHeader({
  trade,
  userName,
}: {
  trade: Trade;
  userName?: string;
}) {
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
      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-[#D8232A] to-[#A81A1F] text-sm font-bold text-white">
        {(userName ?? "U").slice(0, 2).toUpperCase()}
      </div>
    </header>
  );
}
