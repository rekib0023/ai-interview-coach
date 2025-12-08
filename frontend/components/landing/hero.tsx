"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Users } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 pb-20 overflow-hidden flex items-center">
      {/* Abstract Blob Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-background" />

        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50" />

        {/* Animated Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] animate-blob">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-chart-3/40 blur-3xl rounded-full animate-blob-pulse" />
        </div>

        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] animate-blob animation-delay-2000">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/20 to-chart-4/30 blur-3xl rounded-full animate-blob-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] animate-blob animation-delay-4000">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/30 via-accent/20 to-primary/30 blur-3xl rounded-full animate-blob-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-50" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise" />

        {/* Radial gradient fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,transparent,var(--background)_70%)]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          className="flex flex-col items-center text-center gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Announcement Badge */}
          <motion.div variants={fadeInUp}>
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium gap-2 border-primary/30 bg-primary/10 hover:bg-primary/15 transition-all duration-300 backdrop-blur-md cursor-pointer group"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-foreground/90">
                AI-Powered Interview Practice
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight max-w-5xl leading-[1.1]"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50">
              Master Technical
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50">
              Interviews with{" "}
            </span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
              AI
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
          >
            Practice coding interviews with real-time AI feedback, live code
            execution, and system design whiteboarding. Get hired at your dream company.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-4 pt-6"
          >
            <Button
              asChild
              size="lg"
              className="group relative bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 px-8 gap-2 overflow-hidden transition-all duration-300 shadow-[0_0_30px_-5px_var(--primary)] hover:shadow-[0_0_40px_-5px_var(--primary)]"
            >
              <Link href="/signup">
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-gradient-x" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 gap-2 border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 group"
            >
              <Link href="#demo">
                <Play className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-4 pt-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center"
                >
                  <Users className="h-4 w-4 text-primary/70" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">
                +10,000 Users
              </p>
              <p className="text-xs text-muted-foreground">
                Preparing for their dream jobs
              </p>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 w-full max-w-6xl px-4 md:px-0"
          >
            <div className="relative group">
              {/* Glow effect behind the card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

              {/* Main preview card */}
              <div className="relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-muted-foreground">
                      AI Interview Coach
                    </div>
                  </div>
                </div>

                {/* Preview content */}
                <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
                  <div className="absolute inset-0 bg-grid-small opacity-30" />

                  {/* Center play button */}
                  <motion.div
                    className="flex flex-col items-center gap-6 relative z-10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md border border-white/10 cursor-pointer shadow-[0_0_40px_-5px_var(--primary)] hover:shadow-[0_0_60px_-5px_var(--primary)] transition-all duration-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="h-8 w-8 text-primary fill-primary/30" />
                    </motion.div>

                    <div className="space-y-2 text-center">
                      <p className="text-foreground font-semibold text-lg tracking-tight">
                        See it in action
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Watch how our AI conducts a technical interview
                      </p>
                    </div>
                  </motion.div>

                  {/* Floating elements */}
                  <motion.div
                    className="absolute top-6 left-6 px-3 py-1.5 rounded-lg bg-primary/20 backdrop-blur-md border border-white/10 text-xs font-medium text-foreground"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      AI Interviewer Active
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-accent/20 backdrop-blur-md border border-white/10 text-xs font-medium text-foreground"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <span className="flex items-center gap-1.5">
                      Real-time Feedback
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
