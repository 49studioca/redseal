import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "RedSealGuide refund policy: refunds are available within 24 hours of starting your plan. Here's how it works and how to request one.",
  alternates: { canonical: "/refunds" },
  openGraph: {
    title: `Refund Policy | ${SITE_NAME}`,
    description:
      "How refunds work at RedSealGuide, including our 24-hour refund window.",
    url: "/refunds",
  },
};

export default function RefundsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/refunds")}#webpage`,
    name: "RedSealGuide Refund Policy",
    url: absoluteUrl("/refunds"),
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
        title="Refund Policy"
        updated="July 13, 2026"
        intro="We want you to feel confident trying RedSealGuide. Here's exactly how refunds work."
        showCta={false}
      >
        <ContentSection heading="24-hour refund window">
          <p>
            You can request a full refund within{" "}
            <strong>24 hours of starting your plan</strong>. During this window,
            you can cancel and be refunded directly from your profile. After the
            first 24 hours, payments are non-refundable.
          </p>
        </ContentSection>

        <ContentSection heading="Recurring subscriptions">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Subscriptions renew automatically at the end of each billing
              period until you cancel.
            </li>
            <li>
              You can cancel any time from your settings; access continues
              through the end of the current period.
            </li>
            <li>
              Renewal charges after the initial 24-hour window are
              non-refundable, but cancelling stops all future charges.
            </li>
          </ul>
        </ContentSection>

        <ContentSection heading="How to request a refund">
          <p>
            If you&apos;re within the 24-hour window, open your profile and use
            the refund option to be refunded and cancelled instantly. If you run
            into any trouble, email{" "}
            <a
              href="mailto:billing@redsealguide.com"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              billing@redsealguide.com
            </a>{" "}
            with your account email and we&apos;ll help.
          </p>
        </ContentSection>

        <ContentSection heading="Processing time">
          <p>
            Approved refunds are issued to your original payment method through
            our payment processor (Stripe). It typically takes 5–10 business
            days for the funds to appear, depending on your bank or card issuer.
          </p>
        </ContentSection>

        <ContentSection heading="Exceptions">
          <p>
            We reserve the right to decline refunds in cases of suspected abuse
            or violations of our{" "}
            <a
              href="/terms"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              Terms of Service
            </a>
            . Nothing in this policy limits any rights you may have under
            applicable consumer protection laws.
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
