"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Gauge,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_TRADES } from "@/data/all-trades";

const MARQUEE_TRADES = [...ALL_TRADES, ...ALL_TRADES];

const GUIDE_STEPS = [
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
] as const;

const DEMO_TRADES = [
  { name: "Electrician", code: "309A", province: "ON" },
  { name: "Plumber", code: "447A", province: "AB" },
  { name: "Welder", code: "276A", province: "BC" },
] as const;

const STATUS: Record<string, string> = {
  pick: "Selecting…",
  build0: "Lessons…",
  build1: "Drills…",
  build2: "Mocks…",
  build3: "Score…",
  score: "Scoring…",
  ready: "Ready",
  hold: "Ready",
};

export function HeroGuideCard() {
  const [tradeIndex, setTradeIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [readiness, setReadiness] = useState(38);
  const [statusKey, setStatusKey] = useState("pick");
  const [showStamp, setShowStamp] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const trade = DEMO_TRADES[tradeIndex];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const clearAll = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        timersRef.current.push(id);
      });

    if (reduceMotion) {
      setCompletedCount(GUIDE_STEPS.length);
      setActiveStep(-1);
      setReadiness(93);
      setStatusKey("ready");
      setShowStamp(true);
      return;
    }

    let cancelled = false;

    const runCycle = async () => {
      while (!cancelled) {
        setCompletedCount(0);
        setActiveStep(-1);
        setReadiness(38);
        setShowStamp(false);
        setStatusKey("pick");
        await wait(1100);
        if (cancelled) break;

        for (let i = 0; i < GUIDE_STEPS.length; i++) {
          setActiveStep(i);
          setStatusKey(`build${i}`);
          await wait(650);
          if (cancelled) break;
          setCompletedCount(i + 1);
          setActiveStep(-1);
          await wait(180);
          if (cancelled) break;
        }
        if (cancelled) break;

        setStatusKey("score");
        const scores = [45, 54, 68, 81, 93];
        for (const s of scores) {
          setReadiness(s);
          await wait(220);
          if (cancelled) break;
        }
        if (cancelled) break;

        setStatusKey("ready");
        setReadiness(93);
        // Brief beat, then stamp drops
        await wait(280);
        if (cancelled) break;
        setShowStamp(true);
        await wait(2400);
        if (cancelled) break;

        setTradeIndex((n) => (n + 1) % DEMO_TRADES.length);
        await wait(250);
      }
    };

    void runCycle();

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [reduceMotion]);

  const statusLabel = showStamp ? "Passed" : (STATUS[statusKey] ?? "Ready");

  return (
    <div className="relative">
      <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[20px] border border-white/25 bg-white text-[#1F2A37] shadow-[0_28px_56px_rgba(0,0,0,0.28)] sm:h-[580px]">
        <div className="relative shrink-0 border-b border-[#E5E0D8] bg-[#FAF8F4] px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold uppercase tracking-wider text-[#D8232A] sm:text-[11px]">
                Red Seal exam guide
              </span>
              {!reduceMotion ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D8232A]/10 px-2 py-0.5 text-[10px] font-bold text-[#C0271E]">
                  <span className="hero-guide-pulse h-1.5 w-1.5 rounded-full bg-[#D8232A]" />
                  Live
                </span>
              ) : null}
            </div>
            <h2 className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-[22px] font-bold leading-none tracking-tight sm:text-[26px]">
              Your path to the ticket
            </h2>

            <div className="mt-2.5 rounded-[10px] border border-[#E5E0D8] bg-white px-2.5 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div
                    key={trade.code}
                    className="hero-guide-fade truncate font-[family-name:var(--font-barlow-semi)] text-[13px] font-semibold text-[#1F2A37]"
                  >
                    {trade.name}
                  </div>
                  <div className="font-[family-name:var(--font-ibm-mono)] text-[10px] text-[#94A3B8]">
                    {trade.code} · {trade.province}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    showStamp
                      ? "bg-[#D8232A] text-white"
                      : "bg-[#FCEBEC] text-[#C0271E]"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col justify-center gap-2.5 p-4 sm:gap-3 sm:p-5">
          {GUIDE_STEPS.map((item, idx) => {
            const Icon = item.icon;
            const done = idx < completedCount;
            const active = idx === activeStep;
            return (
              <div
                key={item.title}
                className={`flex h-[52px] items-center gap-3 rounded-[12px] border px-3 transition-colors duration-200 sm:h-[56px] sm:px-3.5 ${
                  done
                    ? "border-[#D8232A]/30 bg-[#FCEBEC]"
                    : active
                      ? "border-[#D8232A]/45 bg-white"
                      : "border-[#E5E0D8] bg-white"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-colors duration-200 ${
                    done
                      ? "bg-[#D8232A] text-white"
                      : "bg-[#FCEBEC] text-[#C0271E]"
                  }`}
                >
                  {done ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-[18px] w-[18px]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-[family-name:var(--font-barlow-semi)] text-sm font-semibold sm:text-[15px]">
                      {item.title}
                    </div>
                    {active ? (
                      <span className="hero-guide-pulse shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#D8232A]">
                        Building
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] leading-snug text-[#64748B] sm:text-[13px]">
                    {item.body}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Red Seal stamp — drops after pass score */}
          {showStamp ? (
            <div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              aria-hidden
            >
              <div className="hero-seal-stamp relative">
                <Image
                  src="/red-seal-logo.png"
                  alt=""
                  width={160}
                  height={160}
                  className="h-[132px] w-[132px] object-contain drop-shadow-[0_8px_20px_rgba(192,39,30,0.35)] sm:h-[150px] sm:w-[150px]"
                />
                <div className="absolute -bottom-1 left-1/2 w-max -translate-x-1/2 rounded-full bg-[#D8232A] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-md">
                  Pass · {readiness}%
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative shrink-0 border-t border-[#E5E0D8] bg-[#F6F3EE] px-4 py-4 sm:px-5 sm:py-5">
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
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[28px] font-bold leading-none text-[#059669] tabular-nums">
                {readiness}%
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                {readiness >= 70 ? "Exam-ready" : "Building"}
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E0D8]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D8232A] to-[#F4A11A] transition-[width] duration-200 ease-out"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <div className="mt-1.5 flex h-[16px] items-center justify-between text-[11px] font-semibold text-[#64748B]">
            <span>Sample readiness</span>
            <span className="tabular-nums text-[#C0271E]">
              {readiness >= 70
                ? `${readiness}% exam-ready`
                : `Pass mark 70% · ${readiness}%`}
            </span>
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
    <div className="relative pb-12 pt-2">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#FCE3E4]/90 sm:mb-3 sm:text-xs">
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
