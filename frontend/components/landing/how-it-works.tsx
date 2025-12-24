"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Choose Your Path",
    description:
      "Select from algorithms, system design, or behavioral interviews. Pick your difficulty level and programming language.",
    details: [
      "500+ curated problems from real interviews",
      "Filter by company (Google, Meta, Amazon...)",
      "Adaptive difficulty based on your level",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Start Interview",
    description:
      "Our AI interviewer asks realistic questions, provides hints when needed, and adapts to your responses in real-time.",
    details: [
      "Natural conversation flow like real interviews",
      "Clarifying questions and edge case prompts",
      "Behavioral + technical question formats",
    ],
    color: "from-violet-500 to-purple-500",
  },
  {
    number: "03",
    icon: Code2,
    title: "Code & Execute",
    description:
      "Write code in our powerful editor with syntax highlighting and run it against comprehensive test cases instantly.",
    details: [
      "15+ programming languages supported",
      "Real-time code execution & debugging",
      "Hidden test cases reveal edge cases",
    ],
    color: "from-emerald-500 to-teal-500",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Get Feedback",
    description:
      "Receive detailed analysis on your performance including code quality, complexity analysis, and improvement tips.",
    details: [
      "Line-by-line code review",
      "Time & space complexity analysis",
      "Personalized improvement roadmap",
    ],
    color: "from-orange-500 to-amber-500",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-primary/30 bg-primary/10"
          >
            Simple Process
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Works
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with AI Interview Coach in four simple steps. No setup
            required — begin practicing in under 2 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Connector line (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-16 -right-4 w-10 items-center justify-center z-20 translate-x-1/2">
                    <div className="w-full border-t-2 border-dashed border-muted-foreground/30" />
                    <ChevronRight className="absolute -right-1 h-4 w-4 text-muted-foreground/50 bg-background" />
                  </div>
                )}

                <div className="relative h-full p-6 rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-card/50 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-card/70 overflow-hidden">
                  {/* Gradient glow on hover */}
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${step.color} blur-3xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    {/* Step Number */}
                    <div className="text-6xl font-bold text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors mb-4 select-none">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Details list */}
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-8 text-lg gap-2 shadow-lg shadow-primary/20"
          >
            <Link href="/signup">
              Start Your First Interview
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Free to start • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
