import Link from "next/link";
import {
  Shield,
  Sparkles,
  CheckCircle,
  BarChart3,
  Flag,
  FileText,
  Play,
  Newspaper,
  Wrench,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const adminLinks = [
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    desc: "Manage plans, subscriptions, refunds, and view progress",
  },
  {
    href: "/admin/trades",
    label: "Trades",
    icon: Wrench,
    desc: "Set trades active or draft",
  },
  {
    href: "/admin/generate",
    label: "AI Generation",
    icon: Sparkles,
    desc: "Generate questions, lessons, flashcards",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: Newspaper,
    desc: "Write SEO posts with TipTap + AI content & images",
  },
  {
    href: "/admin/video-learning",
    label: "Video Learning",
    icon: Play,
    desc: "Generate Jina-curated YouTube videos per block",
  },
  {
    href: "/admin/review",
    label: "Review Queue",
    icon: CheckCircle,
    desc: "Approve draft content with RAG citations",
  },
  {
    href: "/admin/coverage",
    label: "Coverage Dashboard",
    icon: BarChart3,
    desc: "Question counts vs RSOS targets",
  },
  {
    href: "/admin/qa",
    label: "QA Queue",
    icon: Flag,
    desc: "User error reports and flagged comments",
  },
  {
    href: "/admin/references",
    label: "Reference Docs",
    icon: FileText,
    desc: "Upload code books for RAG pipeline",
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#C0271E]" />
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            Admin Content Engine
          </h1>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer p-6 transition hover:border-[#C0271E] hover:shadow-lg">
                <link.icon className="h-8 w-8 text-[#C0271E]" />
                <h3 className="mt-3 font-semibold">{link.label}</h3>
                <p className="mt-1 text-sm text-[#64748B]">{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
