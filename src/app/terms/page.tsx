import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions that govern your use of the RedSealGuide Red Seal exam prep platform.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      "The terms and conditions that govern your use of RedSealGuide.",
    url: "/terms",
  },
};

export default function TermsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/terms")}#webpage`,
    name: "RedSealGuide Terms of Service",
    url: absoluteUrl("/terms"),
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
        title="Terms of Service"
        updated="July 13, 2026"
        intro="By using RedSealGuide, you agree to these terms. Please read them carefully."
        showCta={false}
      >
        <ContentSection heading="1. Acceptance of terms">
          <p>
            By accessing or using RedSealGuide (the &ldquo;Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree,
            please do not use the Service.
          </p>
        </ContentSection>

        <ContentSection heading="2. The service">
          <p>
            RedSealGuide provides AI-powered study materials, practice
            questions, and mock exams for Red Seal certification preparation.
            The Service is a study aid only and does not guarantee any exam
            result or certification outcome.
          </p>
        </ContentSection>

        <ContentSection heading="3. Accounts">
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity under your account. You
            must provide accurate information and be at least the age of
            majority in your province or territory.
          </p>
        </ContentSection>

        <ContentSection heading="4. Subscriptions & billing">
          <p>
            Paid plans are billed in advance on a recurring basis until
            cancelled. You can cancel at any time from your settings; access
            continues through the end of the current billing period. Refunds are
            governed by our{" "}
            <a
              href="/refunds"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              Refund Policy
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection heading="5. Acceptable use">
          <ul className="list-disc space-y-2 pl-5">
            <li>Do not share, resell, or redistribute the content.</li>
            <li>
              Do not attempt to scrape, copy, or reverse-engineer the Service.
            </li>
            <li>Do not use the Service for any unlawful purpose.</li>
          </ul>
        </ContentSection>

        <ContentSection heading="6. Intellectual property">
          <p>
            All content and materials on the Service are owned by RedSealGuide
            or its licensors and are protected by applicable laws. Your
            subscription grants you a limited, non-transferable license for
            personal study use only.
          </p>
        </ContentSection>

        <ContentSection heading="7. Disclaimers & limitation of liability">
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of
            any kind. See our{" "}
            <a
              href="/disclaimer"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              Disclaimer
            </a>{" "}
            for details. To the fullest extent permitted by law, RedSealGuide is
            not liable for any indirect or consequential damages arising from
            your use of the Service.
          </p>
        </ContentSection>

        <ContentSection heading="8. Changes & contact">
          <p>
            We may update these terms from time to time. Continued use after
            changes take effect constitutes acceptance. Questions? Email{" "}
            <a
              href="mailto:support@redsealguide.com"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              support@redsealguide.com
            </a>
            .
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
