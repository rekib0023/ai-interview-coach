"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

export function DashboardAiInsight() {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl p-4",
          "bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10",
          "border border-teal-200/50 dark:border-teal-800/50",
          "shadow-sm hover:shadow-md transition-all duration-300"
        )}
      >
        {/* Animated sparkle background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 blur-2xl"
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
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 text-sm font-semibold text-foreground">
              AI Insight
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've improved significantly in{" "}
              <span className="font-medium text-foreground">System Design</span>{" "}
              this week! Consider tackling{" "}
              <span className="font-medium text-foreground">
                Dynamic Programming
              </span>{" "}
              next for balanced growth.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "shrink-0 gap-2 h-9 px-4",
              "bg-teal-100 hover:bg-teal-200 text-teal-700",
              "dark:bg-teal-950/50 dark:hover:bg-teal-900/50 dark:text-teal-300",
              "border border-teal-200 dark:border-teal-800",
              "transition-colors"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Practice Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
