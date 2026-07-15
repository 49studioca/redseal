"use client";

import { useEffect, useState } from "react";
import { Bookmark, Languages, Loader2 } from "lucide-react";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/languages";
import { cn } from "@/lib/utils";

export type DemoLang = {
  code: string;
  label: string;
  translation: string;
  definition: string;
  context: string;
  rtl?: boolean;
};

export type TranslateDemoContent = {
  word: string;
  tradeName: string;
  tradeCode: string;
  lessonTitle: string;
  sentenceBefore: string;
  sentenceAfter: string;
  langs: DemoLang[];
};

const DEFAULT_DEMO: TranslateDemoContent = {
  word: "contactor",
  tradeName: "Construction Electrician",
  tradeCode: "309A",
  lessonTitle: "Motor control & troubleshooting",
  sentenceBefore:
    "Before energizing the circuit, verify lockout/tagout is in place. A ",
  sentenceAfter:
    " that fails to pull in may indicate a coil fault, low control voltage, or open interlock in the control circuit.",
  langs: [
    {
      code: "es",
      label: "Español",
      translation: "contactor",
      definition:
        "Interruptor electromagnético que cierra los circuitos de potencia del motor cuando la bobina está energizada.",
      context:
        "Si el contactor no engancha, puede haber falla en la bobina, voltaje bajo en control o un enclavamiento abierto.",
    },
    {
      code: "fa",
      label: "فارسی",
      translation: "کنتاکتور",
      definition:
        "کلید الکترومغناطیسی که هنگام فعال شدن سیم‌پیچ، مدارهای قدرت موتور را می‌بندد.",
      context:
        "اگر کنتاکتور جذب نشود، ممکن است سیم‌پیچ خراب، ولتاژ کنترل پایین، یا اینترلاک باز باشد.",
      rtl: true,
    },
    {
      code: "pa",
      label: "ਪੰਜਾਬੀ",
      translation: "ਕੰਟੈਕਟਰ",
      definition:
        "ਇੱਕ ਇਲੈਕਟ੍ਰੋਮੈਗਨੈਟਿਕ ਸਵਿੱਚ ਜੋ ਕੋਇਲ ਚਾਲੂ ਹੋਣ ਤੇ ਮੋਟਰ ਪਾਵਰ ਸਰਕਟ ਬੰਦ ਕਰਦਾ ਹੈ।",
      context:
        "ਜੇ ਕੰਟੈਕਟਰ ਨਾ ਖਿੱਚੇ, ਤਾਂ ਕੋਇਲ ਖਰਾਬ, ਘੱਟ ਕੰਟਰੋਲ ਵੋਲਟੇਜ ਜਾਂ ਖੁੱਲ੍ਹਾ ਇੰਟਰਲਾਕ ਹੋ ਸਕਦਾ ਹੈ।",
    },
    {
      code: "zh",
      label: "中文",
      translation: "接触器",
      definition: "线圈通电时用于闭合电机功率回路的电磁开关。",
      context: "如果接触器不吸合，可能是线圈故障、控制电压偏低或联锁断路。",
    },
    {
      code: "ar",
      label: "العربية",
      translation: "مُلَامِس",
      definition:
        "مفتاح كهرومغناطيسي يغلق دوائر قدرة المحرك عندما تكون الملفّة مُفعَّلة.",
      context:
        "إذا لم ينجذب الملامس فقد يكون هناك عطل في الملف أو جهد تحكم منخفض أو قفل مفتوح.",
      rtl: true,
    },
  ],
};

type Phase =
  | "idle"
  | "move"
  | "tap"
  | "loading"
  | "popup"
  | "save"
  | "hold"
  | "out";

const PHASE_MS: Record<Phase, number> = {
  idle: 900,
  move: 900,
  tap: 350,
  loading: 700,
  popup: 2200,
  save: 700,
  hold: 1800,
  out: 500,
};

type AnimatedTranslateDemoProps = {
  demo?: TranslateDemoContent;
  className?: string;
};

export function AnimatedTranslateDemo({
  demo = DEFAULT_DEMO,
  className,
}: AnimatedTranslateDemoProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [langIndex, setLangIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saved, setSaved] = useState(false);

  const lang = demo.langs[langIndex % demo.langs.length];
  const supportedLanguages = TRANSLATION_LANGUAGES.filter(
    (l) => l.code !== "en",
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setLangIndex(0);
  }, [demo.word, demo.tradeCode]);

  useEffect(() => {
    if (reduceMotion) {
      setPhase("popup");
      setSaved(false);
      return;
    }

    const order: Phase[] = [
      "idle",
      "move",
      "tap",
      "loading",
      "popup",
      "save",
      "hold",
      "out",
    ];
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const next = order[i];
      setPhase(next);
      setSaved(next === "save" || next === "hold");
      if (next === "out") {
        setLangIndex((n) => (n + 1) % demo.langs.length);
      }
      const delay = PHASE_MS[next];
      i = (i + 1) % order.length;
      timer = setTimeout(tick, delay);
    };

    tick();
    return () => clearTimeout(timer);
  }, [reduceMotion, demo.langs.length, demo.word]);

  const showCursor = !reduceMotion && phase !== "idle" && phase !== "out";
  const wordActive =
    phase === "tap" ||
    phase === "loading" ||
    phase === "popup" ||
    phase === "save" ||
    phase === "hold";
  const showPopup =
    phase === "loading" ||
    phase === "popup" ||
    phase === "save" ||
    phase === "hold";
  const cursorTapped = phase === "tap";

  return (
    <div
      className={cn(
        "mt-14 overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white sm:mt-16",
        className,
      )}
    >
      <div className="grid items-start gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            <Languages className="h-4 w-4" />
            Word translation
          </div>
          <h3 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[34px] font-bold leading-[1.02] tracking-tight text-[#1F2A37] sm:text-[42px]">
            Tap any word.{" "}
            <em className="font-bold italic text-[#D8232A]">See it</em> in your
            language.
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-[#64748B] sm:text-base">
            {demo.tradeName} lessons use technical English that can be tough if
            it isn&apos;t your first language. Tap a word in a lesson, quiz, or
            explanation — get the translation, a plain definition, and{" "}
            {demo.tradeCode} context without leaving the page.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm font-semibold text-[#334155]">
            {[
              `${supportedLanguages.length} languages — Punjabi, Spanish, Farsi, Arabic, Mandarin, and more`,
              "Trade-aware meaning, not a bare dictionary lookup",
              "Save words to your personal vocabulary list",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8232A]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {demo.langs.map((l, i) => (
              <span
                key={l.code}
                dir={l.rtl ? "rtl" : "ltr"}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  i === langIndex
                    ? "border-[#D8232A]/35 bg-[#FCEBEC] text-[#C0271E]"
                    : "border-[#E5E0D8] bg-[#F6F3EE] text-[#64748B]"
                }`}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
          <div className="relative flex h-[480px] flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-[#FAF8F4] shadow-[0_20px_50px_rgba(31,42,55,0.10)] sm:h-[500px]">
            <div className="flex shrink-0 items-center gap-2 border-b border-[#ECE6DC] bg-white px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FCD34D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#86EFAC]" />
              </div>
              <span className="ml-2 truncate text-[11px] font-semibold text-[#64748B]">
                {demo.tradeCode} · Block A — Lesson 3
              </span>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col p-5 sm:p-6">
              <div className="shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#C0271E]">
                  {demo.tradeName} lesson
                </p>
                <h4 className="mt-1 font-[family-name:var(--font-barlow-semi)] text-base font-semibold text-[#1F2A37]">
                  {demo.lessonTitle}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                  {demo.sentenceBefore}
                  <span
                    className={`relative inline-block rounded px-1 py-0.5 font-semibold transition-all duration-300 ${
                      wordActive
                        ? "bg-[#FEF2F2] text-[#C0271E] ring-2 ring-[#C0271E]/30"
                        : "text-[#475569]"
                    }`}
                  >
                    {demo.word}
                    {showCursor ? (
                      <span
                        className={`pointer-events-none absolute z-20 transition-all duration-700 ease-out ${
                          phase === "move"
                            ? "left-16 top-10 opacity-100"
                            : cursorTapped
                              ? "left-3 top-4 scale-90 opacity-100"
                              : "left-3 top-4 opacity-95"
                        }`}
                      >
                        <CursorIcon pressed={cursorTapped} />
                      </span>
                    ) : null}
                  </span>
                  {demo.sentenceAfter}
                </p>
              </div>

              <div className="relative mt-4 h-[220px] shrink-0 sm:h-[230px]">
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    showPopup ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="flex h-full flex-col rounded-xl border border-[#E5E0D8] bg-white p-4 shadow-xl">
                    {phase === "loading" ? (
                      <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[#64748B]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#D8232A]" />
                        Looking up word…
                      </div>
                    ) : (
                      <>
                        <div className="flex shrink-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-[family-name:var(--font-barlow-semi)] text-base font-bold capitalize text-[#1F2A37]">
                              {demo.word}
                            </div>
                            <div
                              className="mt-0.5 truncate text-[15px] font-semibold text-[#C0271E]"
                              dir={lang.rtl ? "rtl" : "ltr"}
                            >
                              {lang.translation}
                            </div>
                          </div>
                          <span className="shrink-0 rounded-md bg-[#FCEBEC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C0271E]">
                            {lang.label}
                          </span>
                        </div>
                        <p
                          className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748B]"
                          dir={lang.rtl ? "rtl" : "ltr"}
                        >
                          {lang.definition}
                        </p>
                        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg bg-[#F6F3EE] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                            In this context
                          </div>
                          <p
                            className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#334155]"
                            dir={lang.rtl ? "rtl" : "ltr"}
                          >
                            {lang.context}
                          </p>
                        </div>
                        <div className="mt-3 flex shrink-0 gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white transition-colors ${
                              saved ? "bg-[#059669]" : "bg-[#1F2A37]"
                            }`}
                          >
                            <Bookmark className="h-3 w-3" />
                            {saved ? "Saved" : "Save word"}
                          </span>
                          <span className="rounded-lg border border-[#E5E0D8] px-2.5 py-1 text-[10px] font-semibold text-[#64748B]">
                            Close
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#ECE6DC] bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                  <Languages className="h-3.5 w-3.5 text-[#C0271E]" />
                  Word translation
                </div>
                <div className="h-5 w-9 rounded-full bg-[#C0271E] p-0.5">
                  <div className="ml-auto h-4 w-4 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-1 -top-2 min-w-[108px] rounded-full bg-[#1F2A37] px-3 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:-right-3">
            {reduceMotion
              ? "Tap any word"
              : phase === "loading"
                ? "Looking up…"
                : showPopup
                  ? lang.label
                  : "Tap any word"}
          </div>
        </div>
      </div>
    </div>
  );
}

function CursorIcon({ pressed }: { pressed: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      className={`drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-150 ${
        pressed ? "scale-90" : "scale-100"
      }`}
      aria-hidden
    >
      <path
        d="M5 3.5L5 17.5L9.2 13.8L12.2 20.5L14.6 19.4L11.5 12.5L16.5 12.5L5 3.5Z"
        fill="white"
        stroke="#1F2A37"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
