"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  MessageSquare,
  Play,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react";
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

// Simulated chat messages for the demo
const chatMessages = [
  {
    type: "ai",
    message:
      "Can you explain your approach to solving this two-sum problem?",
  },
  {
    type: "user",
    message:
      "I'll use a hash map to store values and check for complements in O(n) time.",
  },
  {
    type: "ai",
    message:
      "Great approach! Now implement it. Consider edge cases like duplicate values.",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 pb-20 overflow-hidden flex items-center">
      {/* Abstract Blob Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50" />

        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] animate-blob">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-chart-3/40 blur-3xl rounded-full animate-blob-pulse" />
        </div>

        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] animate-blob animation-delay-2000">
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/20 to-chart-4/30 blur-3xl rounded-full animate-blob-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] animate-blob animation-delay-4000">
          <div
            className="absolute inset-0 bg-gradient-to-br from-chart-3/30 via-accent/20 to-primary/30 blur-3xl rounded-full animate-blob-pulse"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 noise" />
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
            execution, and system design whiteboarding. Get hired at your dream
            company.
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
              className="text-lg h-14 px-8 gap-2 border-border bg-background/50 hover:bg-muted/50 backdrop-blur-md transition-all duration-300 group"
            >
              <Link href="#how-it-works">
                <Play className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-6 pt-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-purple-500",
                  "bg-orange-500",
                  "bg-pink-500",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${color} border-2 border-background flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  10,000+ Engineers
                </p>
                <p className="text-xs text-muted-foreground">
                  Landed jobs at FAANG companies
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold">4.9/5</span>
              <span className="text-muted-foreground">(2,400+ reviews)</span>
            </div>
          </motion.div>

          {/* Dashboard Preview - Interactive Product Demo */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 w-full max-w-6xl px-4 md:px-0"
            id="demo"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

              {/* Main preview card */}
              <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground">
                      AI Interview Session — Two Sum Problem
                    </div>
                  </div>
                </div>

                {/* Preview content - Split view */}
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                  {/* Left side - AI Chat */}
                  <div className="p-6 border-r border-border bg-background">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">AI Interviewer</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Active
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.3 + 0.5 }}
                          className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-xl text-sm ${
                              msg.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Code Editor */}
                  <div className="p-6 bg-[#1e1e1e] text-white font-mono text-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Code Editor
                        </p>
                        <p className="text-xs text-white/60">Python 3.11</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          All tests passing
                        </Badge>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="space-y-1 text-xs sm:text-sm"
                    >
                      <div>
                        <span className="text-purple-400">def</span>{" "}
                        <span className="text-yellow-300">two_sum</span>
                        <span className="text-white">(</span>
                        <span className="text-orange-300">nums</span>
                        <span className="text-white">, </span>
                        <span className="text-orange-300">target</span>
                        <span className="text-white">):</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-gray-500"># Hash map approach</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-white">seen = {"{}"}</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-purple-400">for</span>{" "}
                        <span className="text-white">i, num </span>
                        <span className="text-purple-400">in</span>
                        <span className="text-yellow-300"> enumerate</span>
                        <span className="text-white">(nums):</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-white">complement = target - num</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-purple-400">if</span>
                        <span className="text-white"> complement </span>
                        <span className="text-purple-400">in</span>
                        <span className="text-white"> seen:</span>
                      </div>
                      <div className="pl-12">
                        <span className="text-purple-400">return</span>
                        <span className="text-white"> [seen[complement], i]</span>
                      </div>
                      <div className="pl-8">
                        <span className="text-white">seen[num] = i</span>
                      </div>
                    </motion.div>

                    {/* Terminal output */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 }}
                      className="mt-4 p-3 rounded-lg bg-black/50 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">Output</span>
                      </div>
                      <div className="text-xs text-green-400">
                        ✓ Test case 1: [0, 1] — Passed (2ms)
                        <br />
                        ✓ Test case 2: [1, 2] — Passed (1ms)
                        <br />✓ Test case 3: [0, 3] — Passed (1ms)
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom feedback bar */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Performance Score:{" "}
                        <span className="text-green-500">92/100</span>
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Time: O(n)</span>
                      <span>•</span>
                      <span>Space: O(n)</span>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get AI Feedback
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
