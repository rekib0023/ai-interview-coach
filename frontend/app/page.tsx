"use client";

import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";
import {
  FloatingDataElement,
  ParallaxSection,
} from "@/components/landing/parallax-section";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    // Main Scroll Container with Scroll Snap
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-auto overflow-x-hidden bg-background relative scroll-smooth snap-y snap-mandatory"
    >
      {/* Header should be sticky or fixed within the container */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="relative z-10">
        {/* Background Floating Elements */}
        {/* We fix these relative to the viewport/container so they scroll nicely with parallax */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
          <FloatingDataElement
            className="top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-30"
            depth={0.5}
            containerRef={containerRef}
          />
          <FloatingDataElement
            className="top-[40%] right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"
            depth={1.2}
            containerRef={containerRef}
          />
           <FloatingDataElement
            className="bottom-20 left-[20%] w-72 h-72 bg-accent/10 rounded-full blur-3xl opacity-20"
            depth={0.8}
            containerRef={containerRef}
          />
        </div>

        {/* Sections */}
        {/* Hero needs manual snap-start as it's not a ParallaxSection */}
        <section className="relative snap-start scroll-mt-0">
          <Hero />
        </section>

        <ParallaxSection
          offset={30}
          direction={-1}
          className="py-8"
          containerRef={containerRef}
        >
          <Stats />
        </ParallaxSection>

        <ParallaxSection offset={50} direction={1} containerRef={containerRef}>
          <Features />
        </ParallaxSection>

        <ParallaxSection
          offset={40}
          direction={-1}
          className="bg-slate-50/50 dark:bg-slate-900/50"
          containerRef={containerRef}
        >
          <HowItWorks />
        </ParallaxSection>

        <ParallaxSection offset={60} direction={1} containerRef={containerRef}>
          <Pricing />
        </ParallaxSection>

        <ParallaxSection
          offset={20}
          direction={1}
          className="pb-20"
          containerRef={containerRef}
        >
          <CTA />
        </ParallaxSection>
      </main>

      <div className="snap-start">
        <Footer />
      </div>
    </div>
  );
}
