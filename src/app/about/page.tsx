import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "RedSealGuide is AI-powered Red Seal exam prep built by trades folks for Canadian apprentices and journeypersons across all 56 Red Seal trades.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description:
      "Why we built RedSealGuide — modern, AI-powered Red Seal exam prep for Canadian tradespeople.",
    url: "/about",
  },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl("/about")}#webpage`,
    name: "About RedSealGuide",
    url: absoluteUrl("/about"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingContentPage
        kicker="About us"
        title="Study prep that actually fits the trades"
        intro="RedSealGuide is an independent, AI-powered study platform helping Canadian apprentices and journeypersons prepare for their Red Seal certification exams — without the dusty binders."
      >
        <ContentSection heading="Why we exist">
          <p>
            Preparing for a Red Seal exam usually means wrestling with outdated
            study guides, photocopied question banks, and material that never
            quite matches how the exam is actually written. We thought trades
            people deserved better.
          </p>
          <p>
            RedSealGuide was built by folks who&apos;ve been on the tools. We
            pair the Red Seal Occupational Standard (RSOS) with modern AI to
            generate realistic practice questions, full mock exams, and
            province-aware guidance — so your study time goes toward the
            material that matters.
          </p>
        </ContentSection>

        <ContentSection heading="What we cover">
          <ul className="list-disc space-y-2 pl-5">
            <li>All 56 Red Seal trades, aligned to the RSOS.</li>
            <li>
              Unlimited RSOS-aligned practice questions with explanations.
            </li>
            <li>Full-length, timed mock exams that mirror the real thing.</li>
            <li>
              Province-aware study guidance that flags code and registration
              differences.
            </li>
            <li>Readiness tracking so you know when you&apos;re exam-ready.</li>
          </ul>
        </ContentSection>

        <ContentSection heading="Independent by design">
          <p>
            RedSealGuide is an independent study aid. We are not affiliated with
            the Red Seal Program, the Canadian Council of Directors of
            Apprenticeship, or any provincial or territorial authority. Our goal
            is simple: help you walk into the exam room confident and prepared.
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
