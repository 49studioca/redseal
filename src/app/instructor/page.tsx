import type { Metadata } from "next";
import Link from "next/link";
import { Users, TrendingUp, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Instructor Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const roster = [
  { name: "Marcus R.", trade: "309A", readiness: 62, mocks: 3, streak: 7 },
  { name: "Sarah K.", trade: "309A", readiness: 78, mocks: 5, streak: 12 },
  { name: "James T.", trade: "309A", readiness: 45, mocks: 1, streak: 3 },
];

export default function InstructorDashboardPage() {
  const avgReadiness = Math.round(
    roster.reduce((a, r) => a + r.readiness, 0) / roster.length,
  );
  const weakArea = "Block C — Distribution equipment";

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-[#64748B]">
              Metro Electrical Training — 30 seats
            </p>
          </div>
          <Link href="/api/stripe/checkout">
            <Button variant="secondary">Manage seats</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <Users className="h-6 w-6 text-[#C0271E]" />
            <div className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
              {roster.length}/30
            </div>
            <div className="text-sm text-[#64748B]">Active apprentices</div>
          </Card>
          <Card className="p-5">
            <TrendingUp className="h-6 w-6 text-[#047857]" />
            <div className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
              {avgReadiness}%
            </div>
            <div className="text-sm text-[#64748B]">Class avg readiness</div>
          </Card>
          <Card className="p-5">
            <ClipboardCheck className="h-6 w-6 text-[#B45309]" />
            <div className="mt-2 text-sm font-semibold">{weakArea}</div>
            <div className="text-sm text-[#64748B]">Class weak area</div>
          </Card>
        </div>

        <Card className="mt-8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1F2A37] text-left text-white">
              <tr>
                <th className="p-4">Apprentice</th>
                <th className="p-4">Readiness</th>
                <th className="p-4">Mock exams</th>
                <th className="p-4">Streak</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.name} className="border-b border-[#E5E0D8]">
                  <td className="p-4 font-semibold">{r.name}</td>
                  <td className="p-4">
                    <span
                      className={
                        r.readiness >= 70
                          ? "text-[#047857] font-bold"
                          : "text-[#B45309] font-bold"
                      }
                    >
                      {r.readiness}%
                    </span>
                  </td>
                  <td className="p-4">{r.mocks}</td>
                  <td className="p-4">{r.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
