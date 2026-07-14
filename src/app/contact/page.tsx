import type { Metadata } from "next";
import {
  MarketingContentPage,
  ContentSection,
} from "@/components/marketing/content-page";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the RedSealGuide team for support, billing questions, partnerships, or feedback.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact | ${SITE_NAME}`,
    description:
      "Reach the RedSealGuide team for support, billing, partnerships, or feedback.",
    url: "/contact",
  },
};

const channels = [
  {
    label: "General & support",
    email: "support@redsealguide.com",
    blurb: "Questions about your account, studying, or the platform.",
  },
  {
    label: "Billing & refunds",
    email: "billing@redsealguide.com",
    blurb: "Subscription, payment, or refund questions.",
  },
  {
    label: "Partnerships",
    email: "hello@redsealguide.com",
    blurb: "Trade schools, unions, and employer programs.",
  },
];

export default function ContactPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/contact")}#webpage`,
    name: "Contact RedSealGuide",
    url: absoluteUrl("/contact"),
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingContentPage
        kicker="Contact"
        title="We'd love to hear from you"
        intro="Whether you're stuck on something, have a billing question, or want to partner with us, reach out and a real person will get back to you."
      >
        <ContentSection heading="How to reach us">
          <div className="space-y-4">
            {channels.map((channel) => (
              <div
                key={channel.email}
                className="rounded-2xl border border-[#F1ECE3] bg-[#FBF8F2] p-5"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
                  {channel.label}
                </div>
                <a
                  href={`mailto:${channel.email}`}
                  className="mt-1 block font-[family-name:var(--font-barlow-condensed)] text-[20px] font-bold tracking-tight text-[#1F2A37] hover:text-[#D8232A]"
                >
                  {channel.email}
                </a>
                <p className="mt-1 text-[14.5px] leading-relaxed text-[#4A5A6A]">
                  {channel.blurb}
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection heading="Response times">
          <p>
            We&apos;re a small team and typically reply within one to two
            business days. For account or exam-access issues, include your
            account email so we can help faster.
          </p>
        </ContentSection>
      </MarketingContentPage>
    </>
  );
}
