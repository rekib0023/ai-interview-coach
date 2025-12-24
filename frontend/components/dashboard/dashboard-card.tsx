"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cardVariants } from "./shared-animation-variants";

interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  containerClassName?: string;
  icon?: ReactNode;
  gradient?: "primary" | "accent" | "secondary" | "purple" | "none";
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  containerClassName,
  icon,
  gradient = "none",
}: DashboardCardProps) {
  const showHeader = title || description || action || icon;

  // Gradient glow colors
  const gradientGlowClasses = {
    primary: "group-hover:shadow-primary/20",
    accent: "group-hover:shadow-accent/20",
    secondary: "group-hover:shadow-secondary/20",
    purple: "group-hover:shadow-purple-500/20",
    none: "",
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn("group", containerClassName)}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          "border-white/10 bg-card/50 backdrop-blur-md",
          "transition-all duration-500",
          "hover:border-white/20 hover:bg-card/70",
          "hover:shadow-xl",
          gradient !== "none" && gradientGlowClasses[gradient],
          className
        )}
      >
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {showHeader && (
          <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
                {icon && (
                  <span className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-inner">
                    {icon}
                  </span>
                )}
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {title}
                </span>
              </CardTitle>
              {description && (
                <CardDescription className="text-xs text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </CardHeader>
        )}
        <CardContent className={cn("relative z-10 pt-4", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
