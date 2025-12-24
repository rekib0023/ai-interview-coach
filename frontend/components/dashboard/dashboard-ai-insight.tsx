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
          "relative overflow-hidden rounded-xl p-4",
          "bg-gradient-to-r from-primary/10 via-blue-500/10 to-accent/10",
          "border border-primary/20 dark:border-primary/30",
          "shadow-sm hover:shadow-md transition-all duration-300"
        )}
      >
        {/* Animated sparkle background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/20 blur-2xl"
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-foreground">
                AI Insight
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-chart-4/10 text-chart-4 border border-chart-4/30">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-4 animate-pulse" />
                Live
              </span>
            </div>
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
            size="sm"
            className={cn(
              "shrink-0 gap-2 h-9 px-4",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "shadow-md shadow-primary/20",
              "transition-all"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Practice Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
