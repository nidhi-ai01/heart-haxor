import FeatureSection from "@/components/FeatureSection";
import HeroSection from "@/components/HeroSection";
import Header from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0F1A35] to-[#0A0F1F]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(99,102,241,0.14),transparent)]"
        aria-hidden
      />
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <FeatureSection />
      </div>
    </div>
  );
}
