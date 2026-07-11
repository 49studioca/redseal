import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { cn } from "@/lib/utils";

type UpgradePromptProps = {
  title?: string;
  description: string;
  className?: string;
  compact?: boolean;
};

export function UpgradePrompt({
  title = "Upgrade to unlock",
  description,
  className,
  compact = false,
}: UpgradePromptProps) {
  return (
    <Card
      className={cn(
        "border-[#F4D4D4] bg-[#FFFBF7]",
        compact ? "p-4" : "p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEBEC]">
          <Lock className="h-4 w-4 text-[#C0271E]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#334155]">{title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
          <div className="mt-3">
            <UpgradeButton
              label="View plans"
              showLockIcon={false}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
