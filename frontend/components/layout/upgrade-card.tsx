"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { cardVariants } from "../dashboard/shared-animation-variants";

export function UpgradeCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className={cn(
        "relative overflow-hidden border-0",
        "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600",
        "shadow-xl shadow-violet-500/20"
      )}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <CardContent className="relative p-4">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white">
                Upgrade Your Plan
              </CardTitle>
              <CardDescription className="text-xs text-white/70">
                Your trial ends in 12 days
              </CardDescription>
            </div>
          </div>

          <p className="text-xs text-white/80 mb-3">
            Unlock unlimited interviews, advanced analytics, and personalized learning paths.
          </p>

          {/* Progress indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
              <span>Trial usage</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white/80"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <Button
            className={cn(
              "w-full gap-2 font-semibold",
              "bg-white text-violet-700 hover:bg-white/90",
              "shadow-lg shadow-black/10"
            )}
            size="sm"
          >
            <Zap className="h-4 w-4" />
            See All Plans
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
