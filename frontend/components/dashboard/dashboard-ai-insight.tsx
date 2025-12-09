"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

export function DashboardAiInsight() {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-5",
          "bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10",
          "border border-purple-500/20",
          "backdrop-blur-xl",
          "transition-all duration-500 group",
          "hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10"
        )}
      >
        {/* Animated glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <motion.div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                AI Insight
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;ve improved significantly in{" "}
              <span className="font-medium text-foreground">System Design</span>{" "}
              this week! Consider tackling{" "}
              <span className="font-medium text-foreground">
                Dynamic Programming
              </span>{" "}
              next for balanced growth.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="sm"
            className={cn(
              "shrink-0 gap-2 h-10 px-5",
              "bg-gradient-to-r from-purple-500 to-indigo-500",
              "hover:from-purple-600 hover:to-indigo-600",
              "text-white font-medium",
              "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
              "transition-all duration-300",
              "group/btn"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Practice Now
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
