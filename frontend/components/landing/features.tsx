"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Code2,
  GitBranch,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: MessageSquare,
    title: "AI Interviewer Chat",
    description:
      "Practice with an AI that simulates real FAANG interviewers. It adapts to your skill level, asks follow-up questions, and provides hints when you're stuck.",
    benefit: "Feel confident walking into any technical interview",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description:
      "Write and execute code in 15+ languages with syntax highlighting, auto-completion, and instant test case validation. Just like a real coding interview.",
    benefit: "No setup needed — start coding instantly",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress across problem types, difficulty levels, and time spent. Identify patterns in your mistakes and watch your scores improve over time.",
    benefit: "Know exactly where to focus your practice",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    title: "System Design Whiteboard",
    description:
      "Design scalable systems with our interactive whiteboard. Draw architecture diagrams, explain trade-offs, and get AI feedback on your design decisions.",
    benefit: "Ace senior-level interviews with confidence",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Brain,
    title: "Smart Feedback",
    description:
      "Receive detailed analysis on your code quality, time/space complexity, communication style, and problem-solving approach after every session.",
    benefit: "Learn from every mistake like having a personal tutor",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description:
      "Run your code against comprehensive test cases instantly. See edge cases you missed, understand why tests fail, and iterate quickly.",
    benefit: "Debug faster and build confidence in your solutions",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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

export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
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
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Features
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ace your interview
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed by engineers who&apos;ve interviewed at
            Google, Meta, Amazon, and more. Practice smarter, not harder.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative h-full p-6 rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-card/50 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-card/70 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Glow effect */}
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} blur-3xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Benefit highlight */}
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <ArrowRight className="h-4 w-4" />
                      {feature.benefit}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Feature Highlight - Personalized Learning Path */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative p-8 md:p-12 rounded-3xl border border-border bg-gradient-to-br from-card via-card/80 to-card dark:border-white/10 dark:from-card/80 dark:via-card/50 dark:to-card/80 dark:backdrop-blur-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <Target className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Personalized Learning Path
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mb-4">
                  Our AI analyzes your performance across hundreds of data
                  points to create a custom study plan. Whether you&apos;re
                  targeting Google, a startup, or preparing for a promotion —
                  we&apos;ll help you focus on exactly what matters.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Create your personalized plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Stats with context */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-6 lg:gap-8">
                <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    85%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Interview Success Rate
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Users who completed 20+ sessions
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="text-3xl md:text-4xl font-bold text-accent">
                    2x
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Faster Preparation
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    vs. traditional study methods
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
