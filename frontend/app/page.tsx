"use client";

import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";
import { TrustedBy } from "@/components/landing/trusted-by";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background relative">
      {/* Fixed Header */}
      <Header />

      <main className="relative">
        {/* Hero Section */}
        <Hero />

        {/* Trusted By / Logos Marquee */}
        <TrustedBy />

        {/* Stats Section */}
        <Stats />

        {/* Features Section */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* Pricing Section */}
        <Pricing />

        {/* CTA Section */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
