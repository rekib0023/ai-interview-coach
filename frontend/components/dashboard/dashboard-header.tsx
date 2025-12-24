"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Play, Sparkles } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

interface DashboardHeaderProps {
  greeting: string;
  firstName: string;
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-xl p-6"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 blur-3xl rounded-full" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {greeting},{" "}
              </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {firstName}!
              </span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-12">
            Ready to level up your interview skills?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            className="gap-2 px-4 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 backdrop-blur-md transition-all"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </Button>
          <Button
            size="default"
            className="gap-2 px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          >
            <Play className="h-4 w-4" />
            Start Interview
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
