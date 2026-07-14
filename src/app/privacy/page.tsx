import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RedSealGuide collects, uses, and protects your personal information when you use our Red Seal exam prep platform.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "How RedSealGuide collects, uses, and protects your personal information.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/privacy")}#webpage`,
    name: "RedSealGuide Privacy Policy",
    url: absoluteUrl("/privacy"),
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
        title="Privacy Policy"
        updated="July 13, 2026"
        intro="This policy explains what information RedSealGuide collects, how we use it, and the choices you have. We keep it as plain-language as we can."
        showCta={false}
      >
        <ContentSection heading="Information we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account information</strong> — your name, email, and
              password (stored securely) when you sign up.
            </li>
            <li>
              <strong>Study activity</strong> — quizzes taken, answers, scores,
              and readiness progress to power your dashboard.
            </li>
            <li>
              <strong>Billing information</strong> — handled by our payment
              processor (Stripe). We do not store full card numbers.
            </li>
            <li>
              <strong>Usage data</strong> — device, browser, and interaction
              data used to improve the product.
            </li>
          </ul>
        </ContentSection>

        <ContentSection heading="How we use your information">
          <ul className="list-disc space-y-2 pl-5">
            <li>To provide, personalize, and improve the study experience.</li>
            <li>To process subscriptions and send account notifications.</li>
            <li>To respond to support requests.</li>
            <li>To keep the platform secure and prevent abuse.</li>
          </ul>
        </ContentSection>

        <ContentSection heading="Sharing your information">
          <p>
            We do not sell your personal information. We share it only with
            service providers who help us operate the platform (such as hosting
            and payment processing), and only as needed to deliver the service —
            or when required by law.
          </p>
        </ContentSection>

        <ContentSection heading="Data retention & security">
          <p>
            We keep your data for as long as your account is active or as needed
            to provide the service. We use industry-standard safeguards to
            protect your information, though no method of transmission or
            storage is completely secure.
          </p>
        </ContentSection>

        <ContentSection heading="Your choices">
          <p>
            You can access, update, or delete your account information at any
            time from your settings. To request deletion of your data or ask a
            privacy question, email{" "}
            <a
              href="mailto:privacy@redsealguide.com"
              className="font-semibold text-[#D8232A] hover:underline"
            >
              privacy@redsealguide.com
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection heading="Changes to this policy">
          <p>
            We may update this policy from time to time. When we do, we&apos;ll
            revise the &ldquo;last updated&rdquo; date above and, for material
            changes, notify you where appropriate.
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
