"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Gauge,
  MapPin,
  PlayCircle,
  Sparkles,
  Zap,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_TRADES } from "@/data/all-trades";

const MARQUEE_TRADES = [...ALL_TRADES, ...ALL_TRADES];

const GUIDE_FEATURES = [
  {
    icon: BookOpen,
    title: "RSOS block lessons",
    body: "Study every official exam block — not random trivia.",
  },
  {
    icon: Sparkles,
    title: "AI weak-spot drills",
    body: "Quizzes rebuild around the topics you miss most.",
  },
  {
    icon: ClipboardCheck,
    title: "Full mock exams",
    body: "Timed, closed-book runs that mirror exam day.",
  },
  {
    icon: Gauge,
    title: "Readiness score",
    body: "One number tells you when to book the real thing.",
  },
];

export function HeroGuideCard() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[18px] border border-white/20 bg-white text-[#1F2A37] shadow-[0_24px_48px_rgba(0,0,0,0.28)]">
        <div className="relative border-b border-[#E5E0D8] bg-[#FAF8F4] px-4 py-4 sm:px-5 sm:py-5">
          <div
            className="pointer-events-none absolute right-3 top-1/2 z-0 -translate-y-1/2 rotate-[14deg] opacity-[0.88] mix-blend-multiply sm:right-5"
            aria-hidden
          >
            <Image
              src="/red-seal-logo.png"
              alt=""
              width={112}
              height={112}
              className="h-[88px] w-[88px] object-contain drop-shadow-[0_2px_6px_rgba(192,39,30,0.18)] sm:h-[104px] sm:w-[104px]"
            />
          </div>
          <div className="relative z-10 max-w-[calc(100%-72px)] sm:max-w-[calc(100%-88px)]">
            <div className="font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold uppercase tracking-wider text-[#D8232A] sm:text-[11px]">
              Red Seal exam guide
            </div>
            <h2 className="mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-[22px] font-bold leading-none tracking-tight sm:text-[26px]">
              Your path to the ticket
            </h2>
            <p className="mt-1.5 text-[13px] leading-snug text-[#64748B] sm:text-sm">
              Unofficial prep built for Canada&apos;s interprovincial standard —
              every province and territory.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-5">
          {GUIDE_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-[12px] border border-[#E5E0D8] bg-white px-3 py-3 sm:px-3.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#FCEBEC] text-[#C0271E]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="font-[family-name:var(--font-barlow-semi)] text-sm font-semibold sm:text-[15px]">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[12.5px] leading-snug text-[#64748B] sm:text-[13px]">
                    {item.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[#E5E0D8] bg-[#F6F3EE] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D8232A]" />
                Canadian codes only
              </div>
              <div className="mt-1 font-[family-name:var(--font-ibm-mono)] text-[11px] text-[#94A3B8] sm:text-xs">
                CEC · NPC · CSA · WHMIS — not US standards
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[28px] font-bold leading-none text-[#059669]">
                70%
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                Pass mark
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E0D8]">
            <div className="h-full w-[73%] rounded-full bg-gradient-to-r from-[#D8232A] to-[#F4A11A]" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
            <span>Sample readiness</span>
            <span className="text-[#C0271E]">73% exam-ready</span>
          </div>

          <Link href="/auth?signup" className="mt-4 block">
            <Button className="h-11 w-full rounded-[11px] text-sm">
              Start your study guide
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function TradeMarqueeChip({ name, icon }: { name: string; icon: string }) {
  return (
    <span className="flex h-8 shrink-0 cursor-default items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 text-xs font-semibold text-white opacity-90 sm:h-10 sm:gap-2 sm:px-[15px] sm:text-sm">
      <span className="text-sm leading-none sm:text-base">{icon}</span>
      {name}
    </span>
  );
}

export function HeroTradeChips() {
  return (
    <div className="relative pb-10">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FCE3E4] sm:mb-3 sm:text-xs">
          All 56 Red Seal trades
        </div>
      </div>
      <div className="trade-marquee-wrap relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="trade-marquee-track flex flex-nowrap gap-1.5 sm:gap-2">
          {MARQUEE_TRADES.map((t, i) => (
            <TradeMarqueeChip
              key={`${t.slug}-${i}`}
              name={t.name}
              icon={t.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Sparkles, Zap, PlayCircle, CircleCheck };
