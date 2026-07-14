import {
  MarketingHeader,
  HeroSection,
  StatsBar,
  HowItWorks,
  TradesPreview,
  FeatureHighlight,
  TestimonialSection,
  CtaBand,
  MarketingFooter,
} from "@/components/marketing/sections";
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
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeatureHighlight />
      <TradesPreview />
      <TestimonialSection />
      <PricingSection />
      <FaqSection />
      <CtaBand />
      <MarketingFooter />
    </div>
  );
}
