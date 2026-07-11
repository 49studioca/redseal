import { BookOpen, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/subscription/upgrade-button";

type LockedLessonCardProps = {
  title: string;
  taskCode?: string;
  summary?: string;
};

export function LockedLessonCard({
  title,
  taskCode,
  summary,
}: LockedLessonCardProps) {
  return (
    <Card className="relative overflow-hidden border-[#E5E0D8] bg-[#F8FAFC] p-5 opacity-90">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E2E8F0]">
            <BookOpen className="h-4 w-4 text-[#94A3B8]" />
          </div>
          <div className="min-w-0 flex-1">
            {taskCode && (
              <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#94A3B8]">
                {taskCode}
              </span>
            )}
            <h3 className="font-semibold text-[#64748B]">{title}</h3>
          </div>
          <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
        </div>
        {summary && (
          <p className="text-sm text-[#94A3B8] line-clamp-2">{summary}</p>
        )}
        <UpgradeButton />
      </div>
    </Card>
  );
}
