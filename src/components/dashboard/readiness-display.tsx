import Link from "next/link";
import { Gauge, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExamReadinessSummary } from "@/lib/progress/exam-readiness";
import type { Trade } from "@/types";

function confidenceBadgeClass(confidence: ExamReadinessSummary["confidence"]) {
  switch (confidence) {
    case "none":
      return "bg-white/15 text-[#FCE3E4]";
    case "partial":
      return "bg-[#F4A11A]/20 text-[#FDE68A]";
    case "full":
      return "bg-[#10B981]/20 text-[#A7F3D0]";
  }
}

function confidenceBadgeLabel(confidence: ExamReadinessSummary["confidence"]) {
  switch (confidence) {
    case "none":
      return "No data yet";
    case "partial":
      return "Partial estimate";
    case "full":
      return "Full coverage";
  }
}

export function SidebarReadiness({
  summary,
}: {
  summary: ExamReadinessSummary;
}) {
  const barWidth = summary.showScore ? summary.score : 0;

  return (
    <div className="relative mt-3.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#FCE3E4]">
        <span>Exam readiness</span>
        {summary.showScore ? (
          <span className="font-[family-name:var(--font-ibm-mono)] font-bold text-white">
            {summary.score}%
          </span>
        ) : (
          <span className="font-[family-name:var(--font-ibm-mono)] text-[10px] font-bold uppercase tracking-wide text-[#FBD9DB]">
            —
          </span>
        )}
      </div>

      <div className="relative mt-1.5 h-1.5 overflow-hidden rounded bg-white/20">
        <div
          className="h-full rounded bg-white transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p
        className="relative mt-2 text-[10px] leading-snug text-[#FBD9DB]"
        title={summary.statusDetail}
      >
        {summary.showScore ? (
          <>
            {summary.statusLabel}
            {summary.confidence === "partial" && (
              <>
                {" "}
                · {summary.blocksAssessed}/{summary.totalBlocks} blocks
              </>
            )}
          </>
        ) : (
          "Practice 3+ questions per block"
        )}
      </p>
    </div>
  );
}

export function SidebarProgressCard({
  summary,
}: {
  summary: ExamReadinessSummary;
}) {
  const hasPractice = summary.questionsAttempted > 0;
  const pointsToPass =
    summary.showScore && summary.score < summary.passThreshold
      ? summary.passThreshold - summary.score
      : null;
  const onTrack = summary.showScore && summary.score >= summary.passThreshold;

  return (
    <Link
      href="/dashboard/practice"
      className="relative block overflow-hidden rounded-[13px] bg-[#1F2A37] p-4 text-white transition hover:bg-[#263445]"
    >
      <div className="absolute -right-[18px] -top-[18px] h-20 w-20 rounded-full bg-[#F4A11A]/15" />
      <div className="relative text-[11px] font-bold uppercase tracking-wide text-[#F4A11A]">
        Your progress
      </div>

      {hasPractice ? (
        <>
          <div className="relative mt-2 font-[family-name:var(--font-barlow-condensed)] text-[23px] font-bold leading-none">
            {summary.questionsAttempted} questions
          </div>
          <div className="relative mt-1 text-xs leading-relaxed text-[#9FBBD2]">
            {summary.practiceAccuracy != null && (
              <>
                <b className="font-[family-name:var(--font-ibm-mono)] text-white">
                  {summary.practiceAccuracy}%
                </b>{" "}
                accuracy ·{" "}
              </>
            )}
            <b className="font-[family-name:var(--font-ibm-mono)] text-white">
              {summary.blocksAssessed}/{summary.totalBlocks}
            </b>{" "}
            blocks assessed
            {onTrack ? (
              <>
                {" "}
                ·{" "}
                <span className="font-semibold text-[#A7F3D0]">
                  On track to pass
                </span>
              </>
            ) : pointsToPass != null ? (
              <>
                {" "}
                ·{" "}
                <b className="font-[family-name:var(--font-ibm-mono)] text-white">
                  {pointsToPass} pts
                </b>{" "}
                to pass
              </>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="relative mt-2 font-[family-name:var(--font-barlow-condensed)] text-[19px] font-bold leading-snug">
            Start practicing
          </div>
          <div className="relative mt-1 text-xs text-[#9FBBD2]">
            Answer questions to unlock your readiness score
          </div>
        </>
      )}
    </Link>
  );
}

export function ExamReadinessCard({
  trade,
  summary,
}: {
  trade: Trade;
  summary: ExamReadinessSummary;
}) {
  const passLine = summary.passThreshold;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#C0271E]">
          <Gauge className="h-4 w-4" /> Overall exam readiness
        </div>
        <Badge
          className={confidenceBadgeClass(summary.confidence)}
          title={summary.statusDetail}
        >
          {confidenceBadgeLabel(summary.confidence)}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div className="min-w-0 flex-1 sm:min-w-[220px]">
          {summary.showScore ? (
            <div className="flex items-baseline gap-3">
              <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold">
                {summary.score}%
              </span>
              <span className="text-[#475569]">
                {summary.statusLabel.toLowerCase()} for{" "}
                <b>{trade.short_name}</b>
              </span>
            </div>
          ) : (
            <div>
              <div className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-[#64748B]">
                Not enough data yet
              </div>
              <p className="mt-2 max-w-lg text-sm text-[#64748B]">
                {summary.statusDetail}
              </p>
              <Link href="/dashboard/practice" className="mt-4 inline-block">
                <Button size="sm">Start practice</Button>
              </Link>
            </div>
          )}

          {summary.showScore && (
            <>
              <p className="mt-3 max-w-xl text-sm text-[#64748B]">
                {summary.statusDetail}
              </p>

              <div className="relative mt-5 max-w-xl">
                <div className="relative h-4 overflow-hidden rounded-lg bg-[#ECE6DC]">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-[#F4A11A] to-[#10B981]"
                    style={{ width: `${summary.score}%` }}
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#1F2A37]/40"
                  style={{ left: `${passLine}%` }}
                />
                <div
                  className="absolute -top-6 font-[family-name:var(--font-ibm-mono)] text-[10px] font-semibold text-[#64748B]"
                  style={{
                    left: `${passLine}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  PASS · {passLine}%
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span>
                  <b className="text-[#1F2A37]">{summary.questionsAttempted}</b>{" "}
                  questions answered
                </span>
                <span>
                  <b className="text-[#1F2A37]">
                    {summary.blocksAssessed}/{summary.totalBlocks}
                  </b>{" "}
                  blocks assessed
                </span>
                {summary.practiceAccuracy != null && (
                  <span>
                    <b className="text-[#1F2A37]">
                      {summary.practiceAccuracy}%
                    </b>{" "}
                    accuracy on assessed blocks
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {summary.showScore && (
          <div className="mx-auto flex flex-col items-center sm:mx-0">
            <div className="flex h-[132px] w-[132px] items-center justify-center rounded-full bg-gradient-to-br from-[#F4A11A]/30 to-[#10B981]/30">
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-inner">
                <div className="text-center">
                  <div className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold">
                    {summary.score}
                  </div>
                  <div className="text-[10px] font-bold text-[#94A3B8]">
                    READY
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-[10px] border border-[#E5E0D8] bg-[#FAF8F4] px-3 py-2.5 text-xs text-[#64748B]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
        <p>
          Readiness is your weighted average across all RSOS exam blocks, using
          each block&apos;s official question share. Blocks you haven&apos;t
          practiced yet count as 0% so the score reflects a full exam today.
        </p>
      </div>
    </Card>
  );
}
