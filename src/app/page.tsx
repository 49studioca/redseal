import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/sections";
import {
  CompactFinalCta,
  CompactHowItWorks,
  CompactProof,
  CompactTrades,
  ConversionHero,
  FeatureBento,
  TrustStrip,
} from "@/components/marketing/conversion-home";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { homepageSchema, jsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <div className="app-mobile-content min-h-screen overflow-x-hidden bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(homepageSchema()) }}
      />
      <MarketingHeader />
      <main>
        <ConversionHero />
        <TrustStrip />
        <CompactHowItWorks />
        <FeatureBento />
        <CompactTrades />
        <CompactProof />
        <PricingSection />
        <FaqSection compact />
        <CompactFinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
