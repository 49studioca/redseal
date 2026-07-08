import {
  MarketingHeader,
  HeroSection,
  StatsBar,
  HowItWorks,
  TradesPreview,
  FeatureHighlight,
  TestimonialSection,
  PricingSection,
  CtaBand,
  MarketingFooter,
} from "@/components/marketing/sections";
import { FaqSection } from "@/components/marketing/faq-section";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
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
