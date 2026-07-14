import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "RedSealGuide is an independent study aid and is not affiliated with the Red Seal Program or any provincial authority.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: `Disclaimer | ${SITE_NAME}`,
    description:
      "RedSealGuide is an independent study aid, not an official Red Seal resource.",
    url: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/disclaimer")}#webpage`,
    name: "RedSealGuide Disclaimer",
    url: absoluteUrl("/disclaimer"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingContentPage
        kicker="Legal"
        title="Disclaimer"
        updated="July 13, 2026"
        intro="Please read this carefully so you understand exactly what RedSealGuide is — and what it isn't."
        showCta={false}
      >
        <ContentSection heading="Not an official Red Seal resource">
          <p>
            RedSealGuide is an independent study aid. We are{" "}
            <strong>not affiliated with, endorsed by, or connected to</strong>{" "}
            the Red Seal Program, the Canadian Council of Directors of
            Apprenticeship (CCDA), Employment and Social Development Canada, or
            any provincial or territorial apprenticeship authority.
          </p>
        </ContentSection>

        <ContentSection heading="No guarantee of results">
          <p>
            Our practice questions and mock exams are designed to help you
            prepare, but they are not the actual Red Seal exam and do not
            reproduce official exam content. Using RedSealGuide does not
            guarantee that you will pass any certification exam or achieve any
            particular score.
          </p>
        </ContentSection>

        <ContentSection heading="Educational content only">
          <p>
            Content is provided for general educational purposes and may contain
            errors or become out of date. It is not professional, legal, safety,
            or technical advice. Always follow current codes, standards, and the
            official materials published by the relevant authorities.
          </p>
        </ContentSection>

        <ContentSection heading="AI-generated material">
          <p>
            Some content is generated with the help of AI and reviewed for
            quality, but it may still contain inaccuracies. If you spot
            something that looks wrong, please let us know at{" "}
            <a
              href="mailto:support@redsealguide.com"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              support@redsealguide.com
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection heading="Official information">
          <p>
            For authoritative details about the Red Seal Program, exam
            eligibility, and certification, always refer to{" "}
            <a
              href="https://www.red-seal.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              red-seal.ca
            </a>{" "}
            and your provincial or territorial apprenticeship authority.
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
