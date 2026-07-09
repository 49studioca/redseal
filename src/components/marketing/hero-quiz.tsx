"use client";

import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Car,
  Check,
  CircleCheck,
  Droplets,
  Flame,
  Hammer,
  Lightbulb,
  PlayCircle,
  Sparkles,
  Timer,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TradeId =
  | "electrician"
  | "plumber"
  | "carpenter"
  | "welder"
  | "hvac"
  | "auto";

type QuizOption = { k: string; t: string; correct?: boolean };

type Trade = {
  id: TradeId;
  name: string;
  short: string;
  icon: LucideIcon;
};

const TRADES: Trade[] = [
  {
    id: "electrician",
    name: "Construction Electrician",
    short: "Electrician",
    icon: Zap,
  },
  { id: "plumber", name: "Plumber", short: "Plumber", icon: Droplets },
  { id: "carpenter", name: "Carpenter", short: "Carpenter", icon: Hammer },
  { id: "welder", name: "Welder", short: "Welder", icon: Flame },
  { id: "hvac", name: "HVAC/R Technician", short: "HVAC/R", icon: Wind },
  { id: "auto", name: "Automotive Service", short: "Auto Service", icon: Car },
];

const QUIZ: Record<
  TradeId,
  {
    block: string;
    timer: string;
    q: string;
    options: QuizOption[];
    explain: string;
  }
> = {
  electrician: {
    block: "CE Code & Safety · Block C",
    timer: "1:12",
    q: "What is the maximum allowable voltage drop for a branch circuit feeding a continuous load, per CEC?",
    options: [
      { k: "A", t: "2%" },
      { k: "B", t: "3%", correct: true },
      { k: "C", t: "5%" },
      { k: "D", t: "10%" },
    ],
    explain:
      "CEC Section 8 caps branch-circuit voltage drop at 3%, with 5% total for feeder plus branch.",
  },
  plumber: {
    block: "National Plumbing Code · DWV",
    timer: "1:04",
    q: "What is the minimum slope for a 3-inch horizontal sanitary drainage pipe?",
    options: [
      { k: "A", t: "1:50 (2%)" },
      { k: "B", t: "1:100 (1%)", correct: true },
      { k: "C", t: "1:25 (4%)" },
      { k: "D", t: "No minimum" },
    ],
    explain:
      "Pipes 3 in and larger require a minimum slope of 1:100 (1%) for proper drainage flow.",
  },
  carpenter: {
    block: "Framing Systems · Block B",
    timer: "0:58",
    q: "Standard on-centre spacing for wall studs in residential load-bearing framing is:",
    options: [
      { k: "A", t: '12" o.c.' },
      { k: "B", t: '16" o.c.', correct: true },
      { k: "C", t: '24" o.c.' },
      { k: "D", t: '19.2" o.c.' },
    ],
    explain:
      '16" on-centre is the residential standard, aligning with 4-ft sheet goods and code spans.',
  },
  welder: {
    block: "Weld Symbols · Block D",
    timer: "1:20",
    q: "On a welding symbol, a flag at the junction of the reference line and arrow indicates:",
    options: [
      { k: "A", t: "A field weld", correct: true },
      { k: "B", t: "A weld all-around" },
      { k: "C", t: "A flush contour" },
      { k: "D", t: "A backing bar" },
    ],
    explain:
      "The flag denotes a field weld — made on site rather than in the shop. A circle means weld-all-around.",
  },
  hvac: {
    block: "Refrigeration Cycle · Block A",
    timer: "1:08",
    q: "In a basic refrigeration cycle, which component lowers refrigerant pressure before the evaporator?",
    options: [
      { k: "A", t: "Compressor" },
      { k: "B", t: "Condenser" },
      { k: "C", t: "Metering device", correct: true },
      { k: "D", t: "Accumulator" },
    ],
    explain:
      "The metering device (TXV or orifice) drops pressure and temperature right before the evaporator.",
  },
  auto: {
    block: "Brakes & Suspension · Block C",
    timer: "1:00",
    q: "A vehicle pulls to one side under braking. The most likely cause is:",
    options: [
      { k: "A", t: "Worn timing belt" },
      { k: "B", t: "A seized caliper", correct: true },
      { k: "C", t: "Low coolant" },
      { k: "D", t: "Faulty O2 sensor" },
    ],
    explain:
      "A seized or sticking caliper applies uneven braking force, pulling the vehicle toward one side.",
  },
};

type HeroQuizContextValue = {
  heroId: TradeId;
  picked: string | null;
  selectTrade: (id: TradeId) => void;
  pickAnswer: (key: string) => void;
};

const HeroQuizContext = createContext<HeroQuizContextValue | null>(null);

function useHeroQuiz() {
  const ctx = useContext(HeroQuizContext);
  if (!ctx) throw new Error("useHeroQuiz must be used within HeroQuizProvider");
  return ctx;
}

export function HeroQuizProvider({ children }: { children: ReactNode }) {
  const [heroId, setHeroId] = useState<TradeId>("electrician");
  const [picked, setPicked] = useState<string | null>(null);

  const selectTrade = (id: TradeId) => {
    setHeroId(id);
    setPicked(null);
  };

  const pickAnswer = (key: string) => {
    if (picked === null) setPicked(key);
  };

  return (
    <HeroQuizContext.Provider
      value={{ heroId, picked, selectTrade, pickAnswer }}
    >
      {children}
    </HeroQuizContext.Provider>
  );
}

export function HeroQuizCard() {
  const { heroId, picked, pickAnswer } = useHeroQuiz();
  const hero = TRADES.find((t) => t.id === heroId) ?? TRADES[0];
  const HeroIcon = hero.icon;
  const qd = QUIZ[hero.id];
  const answered = picked !== null;
  const correctKey = qd.options.find((o) => o.correct)?.k;
  const gotIt = picked === correctKey;

  return (
    <div className="relative">
      <div className="absolute inset-x-[-10px] bottom-[-14px] top-[14px] left-[14px] rounded-[22px] bg-black/30 opacity-55 blur-sm" />
      <div className="relative overflow-hidden rounded-[18px] bg-white text-[#1F2A37] shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 bg-[#1F2A37] px-3 py-3 text-white sm:gap-2.5 sm:px-[18px] sm:py-[15px]">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-[#F4564E] sm:h-[30px] sm:w-[30px]">
            <HeroIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="font-[family-name:var(--font-barlow-semi)] text-xs font-bold sm:text-sm">
              <span className="sm:hidden">{hero.short}</span>
              <span className="hidden sm:inline">{hero.name}</span>
            </div>
            <div className="truncate font-[family-name:var(--font-ibm-mono)] text-[9.5px] text-[#7DA0BD] sm:text-[10.5px]">
              {qd.block}
            </div>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-[#FBBF24]/15 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-[#F4A11A] sm:gap-1.5 sm:px-2 sm:py-1 sm:text-[11px]">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Live sample
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold text-[#94A3B8]">
              QUESTION 1 OF 20
            </span>
            <span className="flex items-center gap-1 font-[family-name:var(--font-ibm-mono)] text-xs font-semibold text-[#C0271E]">
              <Timer className="h-3.5 w-3.5" />
              {qd.timer}
            </span>
          </div>

          <h3 className="mt-3 min-h-[60px] font-[family-name:var(--font-barlow-semi)] text-base font-semibold leading-snug sm:min-h-[74px] sm:text-[18.5px]">
            {qd.q}
          </h3>

          <div className="mt-1.5 flex flex-col gap-2">
            {qd.options.map((o) => {
              const isCorrect = !!o.correct;
              const isPicked = picked === o.k;
              let bg = "bg-white";
              let border = "border-[#E5E0D8]";
              let color = "text-[#334155]";
              let keyBg = "bg-[#F3EFE8]";
              let keyColor = "text-[#64748B]";

              if (answered) {
                if (isCorrect) {
                  bg = "bg-[#ECFDF5]";
                  border = "border-[#6EE7B7]";
                  color = "text-[#065F46]";
                  keyBg = "bg-[#10B981]";
                  keyColor = "text-white";
                } else if (isPicked) {
                  bg = "bg-[#FEF2F2]";
                  border = "border-[#FCA5A5]";
                  color = "text-[#991B1B]";
                  keyBg = "bg-[#EF4444]";
                  keyColor = "text-white";
                } else {
                  color = "text-[#94A3B8]";
                }
              }

              return (
                <button
                  key={o.k}
                  type="button"
                  disabled={answered}
                  onClick={() => pickAnswer(o.k)}
                  className={`flex w-full items-center gap-3 rounded-[11px] border-[1.5px] px-3 py-3 text-left text-sm font-semibold transition-all ${bg} ${border} ${color} ${!answered ? "cursor-pointer hover:border-[#C0271E] hover:bg-[#FAF8F4]" : "cursor-default"}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md font-[family-name:var(--font-ibm-mono)] text-xs font-semibold ${keyBg} ${keyColor}`}
                  >
                    {o.k}
                  </span>
                  <span className="flex-1">{o.t}</span>
                  {answered && isCorrect && (
                    <Check className="h-[17px] w-[17px] text-[#059669]" />
                  )}
                  {answered && isPicked && !isCorrect && (
                    <X className="h-[17px] w-[17px] text-[#DC2626]" />
                  )}
                </button>
              );
            })}
          </div>

          {answered ? (
            <>
              <div
                className={`mt-3 flex gap-2.5 rounded-[11px] border p-3 ${gotIt ? "border-[#A7F3D0] bg-[#ECFDF5]" : "border-[#FECACA] bg-[#FEF2F2]"}`}
              >
                <span
                  className={`mt-0.5 shrink-0 ${gotIt ? "text-[#047857]" : "text-[#B91C1C]"}`}
                >
                  {gotIt ? (
                    <CircleCheck className="h-[18px] w-[18px]" />
                  ) : (
                    <Lightbulb className="h-[18px] w-[18px]" />
                  )}
                </span>
                <div>
                  <div
                    className={`text-[13.5px] font-bold ${gotIt ? "text-[#047857]" : "text-[#B91C1C]"}`}
                  >
                    {gotIt ? "Correct — nice one" : "Not quite — here's why"}
                  </div>
                  <div className="mt-0.5 text-[13px] leading-snug text-[#475569]">
                    {qd.explain}
                  </div>
                </div>
              </div>
              <Link href="/auth/signup" className="mt-3 block">
                <Button className="h-11 w-full rounded-[11px] text-sm">
                  Get my full quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <div className="mt-3 text-center text-[12.5px] font-semibold text-[#94A3B8]">
              👆 Tap an answer — see how it works
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroTradeChips() {
  const { heroId, selectTrade } = useHeroQuiz();

  return (
    <div className="relative mx-auto max-w-[1180px] px-4 pb-10 sm:px-6">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FCE3E4] sm:mb-3 sm:text-xs">
        Try it with your trade
      </div>
      <div className="-mx-4 min-w-0 overflow-x-auto overscroll-x-contain px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max flex-nowrap gap-1.5 sm:w-full sm:flex-wrap sm:gap-2">
          {TRADES.map((t) => {
            const Icon = t.icon;
            const sel = t.id === heroId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTrade(t.id)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors sm:h-10 sm:gap-2 sm:px-[15px] sm:text-sm ${
                  sel
                    ? "border border-white bg-white text-[#D8232A]"
                    : "border border-white/30 bg-white/10 text-white hover:border-white/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {t.short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { Sparkles, Zap, PlayCircle, CircleCheck };
