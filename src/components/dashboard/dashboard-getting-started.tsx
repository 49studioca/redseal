"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardTour } from "@/components/dashboard/dashboard-tour";
import type { Trade } from "@/types";

export function DashboardGettingStarted({
  trade,
  learnHref,
  lessonCount,
  blockCount,
}: {
  trade: Trade;
  learnHref: string;
  lessonCount: number;
  blockCount: number;
}) {
  const { startTour } = useDashboardTour();

  return (
    <Card className="overflow-hidden border-[#E5E0D8] p-0">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#D8232A] to-[#B01A1F] px-6 py-7 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-white/15 text-2xl">
              {trade.icon}
            </span>
            <div>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
                Let&apos;s get you exam-ready
              </h2>
              <p className="mt-1 text-sm text-[#FBD9DB]">
                {lessonCount} lessons across {blockCount} RSOS blocks for{" "}
                {trade.short_name}
              </p>
            </div>
          </div>
          <p className="relative mt-4 max-w-2xl text-[15px] leading-relaxed text-[#FCE3E4]">
            New here? Take a quick tour to see how lessons, practice, and
            readiness tracking work — then jump into your first lesson.
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-[11px] border border-[#E5E0D8] bg-[#FAF8F4] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-[#FCEBEC]">
              <Compass className="h-5 w-5 text-[#C0271E]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-bold text-[#1F2A37]">
                Quick platform tour
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
                We&apos;ll walk you through the sidebar, practice tools,
                translation, and your profile — about 1 minute.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => startTour({ finishHref: learnHref })}>
            Start learning <ArrowRight className="h-4 w-4" />
          </Button>
          <Link href="/dashboard/practice">
            <Button variant="secondary">
              Practice now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
