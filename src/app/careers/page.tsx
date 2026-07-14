import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join RedSealGuide. We're a small, remote-first Canadian team building AI-powered Red Seal exam prep for the skilled trades.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: `Careers | ${SITE_NAME}`,
    description:
      "Help build the future of Red Seal exam prep. Remote-first roles across engineering, content, and trades expertise.",
    url: "/careers",
  },
};

const roles = [
  {
    title: "Trades Content Specialist (Red Seal)",
    type: "Contract · Remote (Canada)",
    blurb:
      "Certified journeyperson to review AI-generated questions for technical accuracy and RSOS alignment.",
  },
  {
    title: "Full-Stack Engineer",
    type: "Full-time · Remote (Canada)",
    blurb:
      "Ship features across our Next.js app — from adaptive quizzing to readiness analytics.",
  },
  {
    title: "Growth Marketer",
    type: "Full-time · Remote (Canada)",
    blurb:
      "Reach apprentices and journeypersons where they are, from trade schools to job sites.",
  },
];

export default function CareersPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/careers")}#webpage`,
    name: "Careers at RedSealGuide",
    url: absoluteUrl("/careers"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingContentPage
        kicker="Careers"
        title="Build the future of trades education"
        intro="We're a small, remote-first Canadian team on a mission to make Red Seal certification more accessible. If that resonates, we'd love to hear from you."
      >
        <ContentSection heading="Why work here">
          <ul className="list-disc space-y-2 pl-5">
            <li>Remote-first, anywhere in Canada.</li>
            <li>Small team, real ownership, fast shipping.</li>
            <li>
              Work that directly helps tradespeople advance their careers.
            </li>
          </ul>
        </ContentSection>

        <ContentSection heading="Open roles">
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-[#F1ECE3] bg-[#FBF8F2] p-5"
              >
                <div className="font-[family-name:var(--font-barlow-condensed)] text-[20px] font-bold tracking-tight text-[#1F2A37]">
                  {role.title}
                </div>
                <div className="mt-1 font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                  {role.type}
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#4A5A6A]">
                  {role.blurb}
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection heading="Don't see your role?">
          <p>
            We&apos;re always happy to meet talented people who care about the
            trades. Send us a note at{" "}
            <a
              href="mailto:careers@redsealguide.com"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              careers@redsealguide.com
            </a>{" "}
            or reach out through our{" "}
            <Link
              href="/contact"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              contact page
            </Link>
            .
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
