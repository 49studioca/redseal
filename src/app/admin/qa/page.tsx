import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

const mockReports = [
  {
    id: "1",
    question: "Voltage drop branch circuit limit",
    reason: "wrong_answer",
    status: "open",
  },
  {
    id: "2",
    question: "AFCI bedroom requirement",
    reason: "outdated_code",
    status: "open",
  },
];

export default function AdminQAPage() {
  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 text-2xl font-bold">QA Queue</h1>
        <p className="text-sm text-[#64748B]">
          User error reports and flagged comments
        </p>
        <div className="mt-6 space-y-3">
          {mockReports.map((r) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{r.question}</div>
                <div className="text-sm text-[#64748B]">
                  {r.reason} · {r.status}
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <button className="font-semibold text-[#047857]">Edit</button>
                <button className="font-semibold text-[#B45309]">
                  Regenerate
                </button>
                <button className="font-semibold text-[#B91C1C]">Retire</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
