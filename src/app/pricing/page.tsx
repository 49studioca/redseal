import type { Metadata } from "next";
import {
  MarketingHeader,
  MarketingFooter,
  CtaBand,
} from "@/components/marketing/sections";
import { PricingSection } from "@/components/marketing/pricing-section";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RedSealGuide pricing for Red Seal exam prep — monthly, 3-month Exam Prep, and annual plans. Free tier to try first. All 56 trades, unlimited quizzes and mock exams.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: `Pricing | ${SITE_NAME}`,
    description:
      "Affordable Red Seal exam prep — monthly, 3-month Exam Prep, or annual. Free to try.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/pricing")}#webpage`,
    name: "RedSealGuide Pricing",
    description:
      "Subscription plans for AI-powered Red Seal exam prep across all Canadian trades.",
    url: absoluteUrl("/pricing"),
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
  };

  return (
    <div className="app-mobile-content min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingHeader />
      <PricingSection />
      <CtaBand />
      <MarketingFooter />
    </div>
  );
}
