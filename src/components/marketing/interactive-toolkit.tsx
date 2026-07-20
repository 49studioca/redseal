"use client";

import { useState, type ComponentType } from "react";
import { Check, ChevronRight, ClipboardCheck, Languages, Play, Smartphone, Sparkles, Timer, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolId = "translate" | "video" | "mock" | "mobile";
type ToolIcon = ComponentType<{ className?: string }>;

const TOOLS: Array<{ id: ToolId; icon: ToolIcon; title: string; body: string }> = [
  { id: "translate", icon: Languages, title: "Tap to translate", body: "Understand trade terms without leaving the lesson." },
  { id: "video", icon: Play, title: "Learn by video", body: "See difficult concepts before answering questions." },
  { id: "mock", icon: ClipboardCheck, title: "Exam-real mocks", body: "Practise with the real timing and block weighting." },
  { id: "mobile", icon: Smartphone, title: "Study anywhere", body: "Continue on your phone exactly where you stopped." },
];

export function InteractiveToolkit() {
  const [active, setActive] = useState<ToolId>("translate");
  const activeTool = TOOLS.find((tool) => tool.id === active) ?? TOOLS[0];
  const ActiveIcon = activeTool.icon;

  return (
    <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div id="toolkit-demo" className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-[#1F2A37] p-5 text-white sm:min-h-[470px] sm:p-8" aria-live="polite">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D8232A]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#31536C]/35 blur-3xl" />
        <div key={active} className="toolkit-panel-in relative flex min-h-[390px] flex-col sm:min-h-[406px]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-white/10 text-[#FF8B8F]"><ActiveIcon className="h-5 w-5" /></span>
            <div><p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#FF8B8F]">See how it works</p><h3 className="mt-0.5 text-xl font-extrabold">{activeTool.title}</h3></div>
          </div>
          <div className="mt-6 flex flex-1 items-center justify-center">
            {active === "translate" && <TranslateDemo />}
            {active === "video" && <VideoDemo />}
            {active === "mock" && <MockDemo />}
            {active === "mobile" && <MobileDemo />}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3" role="tablist" aria-label="Explore study tools">
        {TOOLS.map(({ id, icon: Icon, title, body }) => {
          const selected = active === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={selected} aria-controls="toolkit-demo" onClick={() => setActive(id)} className={cn("group flex flex-1 items-center gap-4 rounded-[18px] border p-4 text-left transition-all sm:p-5", selected ? "border-[#D8232A] bg-white shadow-[0_12px_28px_rgba(31,42,55,0.08)]" : "border-[#E5E0D8] bg-white/70 hover:border-[#D8232A]/35 hover:bg-white")}>
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[12px] transition-colors", selected ? "bg-[#D8232A] text-white" : "bg-[#FCEBEC] text-[#D8232A]")}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold text-[#1F2A37] sm:text-base">{title}</span><span className="mt-1 block text-xs leading-relaxed text-[#64748B] sm:text-[13px]">{body}</span></span>
              <ChevronRight className={cn("h-5 w-5 shrink-0 transition-all", selected ? "text-[#D8232A]" : "-translate-x-1 text-[#C8C0B6] group-hover:translate-x-0")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TranslateDemo() {
  return (
    <div className="w-full max-w-[500px] rounded-[20px] border border-white/10 bg-white p-5 text-[#1F2A37] shadow-2xl sm:p-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">Block B · Motor controls</p>
      <p className="mt-4 text-base font-semibold leading-8 sm:text-lg">An overload relay protects a motor from a sustained <span className="toolkit-term-highlight relative mx-1 inline-block rounded-md bg-[#FFE5A8] px-1.5 text-[#9A5A00]">overcurrent</span>.</p>
      <div className="toolkit-translation-pop mt-5 rounded-[16px] border border-[#F2C7C4] bg-[#FFF7F6] p-4 shadow-[0_12px_28px_rgba(31,42,55,0.12)]">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#D8232A]">overcurrent</p><p className="mt-1 text-xl font-extrabold text-[#1F2A37]">اضافه‌جریان</p><p className="mt-1 text-xs text-[#64748B]">Persian · electrical context</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#D8232A] shadow-sm"><Volume2 className="h-4 w-4" /></span></div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[#059669]"><Check className="h-4 w-4" /> Keep reading without losing your place</p>
    </div>
  );
}

function VideoDemo() {
  return (
    <div className="w-full max-w-[500px] overflow-hidden rounded-[20px] border border-white/10 bg-[#101820] shadow-2xl">
      <div className="relative grid aspect-video place-items-center overflow-hidden bg-[radial-gradient(circle_at_68%_32%,#36566F,#17232D_65%)]">
        <div className="absolute inset-x-[15%] bottom-[20%] h-2 rounded-full bg-white/15" /><div className="absolute bottom-[20%] left-[15%] h-2 w-[38%] rounded-full bg-[#F4564E]" />
        <div className="toolkit-video-pulse grid h-16 w-16 place-items-center rounded-full bg-white text-[#D8232A] shadow-[0_12px_35px_rgba(0,0,0,0.35)]"><Play className="ml-1 h-6 w-6 fill-current" /></div>
        <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1.5 text-[11px] font-bold text-white">Block-matched video</span>
      </div>
      <div className="bg-white p-4 text-[#1F2A37] sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-extrabold">How a magnetic starter works</p><p className="mt-1 text-xs text-[#64748B]">Visual explanation · 6:24</p></div><span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-extrabold text-[#047857]">Then 5 questions</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E5E0D8]"><div className="toolkit-video-progress h-full rounded-full bg-[#D8232A]" /></div></div>
    </div>
  );
}

function MockDemo() {
  return (
    <div className="w-full max-w-[500px] rounded-[20px] border border-white/10 bg-white p-5 text-[#1F2A37] shadow-2xl sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#D8232A]">Full mock exam</p><p className="mt-1 text-sm font-bold">Question 37 of 100</p></div><div className="flex items-center gap-2 rounded-[10px] bg-[#FCEBEC] px-3 py-2 text-sm font-extrabold text-[#B6291F]"><Timer className="h-4 w-4" /> 02:31:18</div></div>
      <p className="mt-5 text-sm font-bold leading-relaxed sm:text-base">Which device provides overload protection for a three-phase motor?</p>
      <div className="mt-4 space-y-2.5">{["Disconnect switch", "Overload relay", "Control transformer"].map((answer, index) => <div key={answer} className={cn("toolkit-mock-option flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-sm font-semibold", index === 1 ? "border-[#D8232A] bg-[#FFF5F5] text-[#B6291F]" : "border-[#E5E0D8] text-[#64748B]")} style={{ animationDelay: `${180 + index * 120}ms` }}><span className={cn("grid h-6 w-6 place-items-center rounded-full border text-[11px]", index === 1 ? "border-[#D8232A] bg-[#D8232A] text-white" : "border-[#CBD5E1]")}>{String.fromCharCode(65 + index)}</span>{answer}</div>)}</div>
      <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#64748B]"><span>Block-weighted like exam day</span><span className="text-[#D8232A]">37% complete</span></div>
    </div>
  );
}

function MobileDemo() {
  return (
    <div className="relative flex w-full items-center justify-center py-1">
      <div className="toolkit-phone relative w-[230px] rounded-[32px] border-[7px] border-[#0E151C] bg-white p-3 text-[#1F2A37] shadow-2xl sm:w-[250px]">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#1F2A37]" />
        <div className="rounded-[14px] bg-[#FCEBEC] p-3"><p className="text-[9px] font-extrabold uppercase tracking-wider text-[#D8232A]">Continue studying</p><p className="mt-1 text-sm font-extrabold">Motor controls</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full w-[72%] bg-[#D8232A]" /></div><p className="mt-1.5 text-[9px] font-bold text-[#64748B]">72% complete</p></div>
        <div className="mt-3 grid grid-cols-2 gap-2"><PhoneTile value="8" label="cards due" /><PhoneTile value="12" label="min left" /></div><div className="mt-3 rounded-[12px] bg-[#D8232A] py-2.5 text-center text-[11px] font-extrabold text-white">Resume session</div>
      </div>
      <div className="toolkit-sync-badge absolute right-[2%] top-[18%] rounded-full border border-[#BBF7D0] bg-white px-3 py-2 text-xs font-extrabold text-[#047857] shadow-xl sm:right-[10%]"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" />Synced</div>
    </div>
  );
}

function PhoneTile({ value, label }: { value: string; label: string }) {
  return <div className="rounded-[11px] bg-[#F6F3EE] p-2.5"><p className="text-base font-extrabold">{value}</p><p className="text-[9px] text-[#64748B]">{label}</p></div>;
}
