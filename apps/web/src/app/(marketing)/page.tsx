import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureBentoGrid } from "@/components/landing/FeatureBentoGrid";
import { InteractiveTabs } from "@/components/landing/InteractiveTabs";
import { PricingSection } from "@/components/landing/PricingSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      <main className="flex-1 w-full">
        <HeroSection />
        <FeatureBentoGrid />
        <InteractiveTabs />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
