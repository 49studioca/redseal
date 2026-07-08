import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  TrendingUp,
  Flame,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLessons, fetchBlocks } from "@/lib/data";
import { getDashboardSession } from "@/lib/dashboard-session";

export default async function DashboardPage() {
  const { trade } = await getDashboardSession();
  const blocks = await fetchBlocks(trade.id);
  const lessons = await fetchLessons(trade.id);
  const readiness = 62;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-[family-name:var(--font-barlow-condensed)] text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Dashboard
          </div>
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[#64748B]">
            Here&apos;s where you stand on the{" "}
            <b className="text-[#1F2A37]">{trade.name}</b> Red Seal exam.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[11px] border border-[#E5E0D8] bg-white px-3.5 py-2">
          <Flame className="h-5 w-5 text-[#E8820E]" />
          <div>
            <div className="font-[family-name:var(--font-ibm-mono)] text-lg font-semibold">
              7
            </div>
            <div className="text-[11px] font-semibold text-[#94A3B8]">
              day streak
            </div>
          </div>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-8 p-6">
        <div className="min-w-[280px] flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#C0271E]">
            <Gauge className="h-4 w-4" /> Overall exam readiness
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold">
              {readiness}%
            </span>
            <span className="text-[#475569]">
              ready for the <b>{trade.short_name}</b> exam
            </span>
            <span className="ml-auto flex items-center gap-1 rounded-lg bg-[#ECFDF5] px-2.5 py-1 text-sm font-bold text-[#047857]">
              <TrendingUp className="h-4 w-4" /> +8% this week
            </span>
          </div>
          <div className="relative mt-5">
            <div className="h-4 overflow-hidden rounded-lg bg-[#ECE6DC]">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-[#F4A11A] to-[#10B981]"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <div className="absolute -top-6 left-[70%] -translate-x-1/2 font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold">
              PASS · 70%
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex h-[132px] w-[132px] items-center justify-center rounded-full bg-gradient-to-br from-[#F4A11A]/30 to-[#10B981]/30">
            <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-inner">
              <div className="text-center">
                <div className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold">
                  {readiness}
                </div>
                <div className="text-[10px] font-bold text-[#94A3B8]">
                  READY
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Questions done",
            value: "847",
            icon: ClipboardCheck,
            color: "#C0271E",
          },
          { label: "Mock exams", value: "3", icon: Gauge, color: "#047857" },
          {
            label: "Lessons done",
            value: `${lessons.length}`,
            icon: BookOpen,
            color: "#B45309",
          },
          { label: "Study time", value: "42h", icon: Flame, color: "#6366F1" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs font-semibold text-[#64748B]">
              {s.label}
            </div>
            <div className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
          <BookOpen className="h-5 w-5 text-[#C0271E]" /> RSOS Block Mastery
        </h2>
        <Link href="/dashboard/learn">
          <Button variant="secondary" size="sm">
            View learning path <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => {
          const mastery = Math.floor(Math.random() * 40 + 40);
          return (
            <Card key={block.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-bold text-[#C0271E]">
                  Block {block.code}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {block.exam_question_count} exam Qs
                </span>
              </div>
              <h3 className="mt-1 text-sm font-semibold leading-snug">
                {block.name}
              </h3>
              <div className="mt-3 h-2 overflow-hidden rounded bg-[#ECE6DC]">
                <div
                  className="h-full rounded bg-[#C0271E]"
                  style={{ width: `${mastery}%` }}
                />
              </div>
              <div className="mt-1 font-[family-name:var(--font-ibm-mono)] text-xs text-[#64748B]">
                {mastery}% mastered
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/practice">
          <Card className="cursor-pointer p-6 transition hover:border-[#C0271E] hover:shadow-lg">
            <ClipboardCheck className="h-8 w-8 text-[#C0271E]" />
            <h3 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold">
              Start Practice
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Filter by block, question type, and difficulty
            </p>
          </Card>
        </Link>
        <Link href="/dashboard/mock-exam">
          <Card className="cursor-pointer p-6 transition hover:border-[#C0271E] hover:shadow-lg">
            <Gauge className="h-8 w-8 text-[#C0271E]" />
            <h3 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold">
              Take Mock Exam
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              {trade.exam_question_count} questions ·{" "}
              {trade.exam_time_minutes / 60}h · {trade.pass_percentage}% to pass
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
