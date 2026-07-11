import { BookOpen, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatVideoDescription } from "@/lib/youtube/title";

interface VideoAboutCardProps {
  topicLabel?: string | null;
  description?: string | null;
  questionCount: number;
}

export function VideoAboutCard({
  topicLabel,
  description,
  questionCount,
}: VideoAboutCardProps) {
  const { bullets, summary } = formatVideoDescription(description);

  return (
    <Card className="overflow-hidden border-[#E5E0D8] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E5E0D8] bg-[#FFFBF7] px-4 py-3">
        <BookOpen className="h-4 w-4 text-[#C0271E]" />
        <h2 className="text-sm font-semibold text-[#1F2A37]">
          About this video
        </h2>
      </div>

      <div className="space-y-4 p-4">
        {topicLabel && (
          <p className="text-sm leading-relaxed text-[#475569]">
            This training video focuses on{" "}
            <span className="font-semibold text-[#1F2A37]">{topicLabel}</span> —
            skills aligned to your RSOS block and Red Seal exam prep.
          </p>
        )}

        {bullets.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              <ListChecks className="h-3.5 w-3.5" />
              Topics covered
            </p>
            <ul className="space-y-2">
              {bullets.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 text-sm leading-relaxed text-[#475569]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F4A11A]" />
                  <span>
                    {item.endsWith("?") ? item : `${item.replace(/\.$/, "")}.`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary && bullets.length === 0 && (
          <p className="text-sm leading-relaxed text-[#475569]">{summary}</p>
        )}

        {!topicLabel && bullets.length === 0 && !summary && (
          <p className="text-sm leading-relaxed text-[#475569]">
            Practical trade training selected for your learning path. Watch the
            full video, then complete the check-in questions below.
          </p>
        )}

        <p className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
          After watching, answer{" "}
          <span className="font-semibold text-[#475569]">
            {questionCount} check-in question{questionCount === 1 ? "" : "s"}
          </span>{" "}
          to confirm you understood the key concepts.
        </p>
      </div>
    </Card>
  );
}
