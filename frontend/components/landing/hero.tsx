"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-50 via-cyan-50 to-white dark:from-teal-950/20 dark:via-cyan-950/20 dark:to-background" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          className="flex flex-col items-center text-center gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Practice
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl"
          >
            Master Technical Interviews with{" "}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent">
              AI-Powered Coaching
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
          >
            Practice coding interviews with real-time AI feedback, live code
            execution, and system design whiteboarding. Get hired at top tech
            companies.
          </motion.p>

          {/* Key Features List */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Real-time AI Interviewer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Live Code Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>System Design Practice</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Performance Analytics</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-lg h-14 px-8 gap-2 hover:scale-105 transition-transform"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 gap-2 hover:scale-105 transition-transform"
            >
              <Link href="#demo">
                <Play className="h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.p
            variants={fadeInUp}
            className="text-sm text-muted-foreground pt-4"
          >
            Join <span className="font-semibold text-foreground">10,000+</span>{" "}
            developers preparing for their dream jobs
          </motion.p>

          {/* Preview Image Placeholder with Animation */}
          <motion.div variants={fadeInUp} className="mt-12 w-full max-w-5xl">
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
              <div className="aspect-video bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-50 dark:from-teal-950 dark:via-cyan-950 dark:to-emerald-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/80 backdrop-blur cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="h-10 w-10 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground font-medium">
                    Product Demo Video
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
