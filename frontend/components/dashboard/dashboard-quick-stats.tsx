"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CircleCheck,
  Clock,
  Flame,
  LucideIcon,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cardVariants, staggerContainer } from "./shared-animation-variants";

interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down" | "neutral";
}

const statsData: StatItem[] = [
  {
    title: "Overall Score",
    value: "78%",
    change: "+5%",
    subtitle: "from last week",
    icon: Trophy,
    iconColor: "text-amber-600 dark:text-amber-500",
    iconBg:
      "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50",
    trend: "up",
  },
  {
    title: "Problems Solved",
    value: 42,
    subtitle: "Top 15% of users",
    icon: CircleCheck,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg:
      "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50",
  },
  {
    title: "Current Streak",
    value: "5 Days",
    subtitle: "Keep it up!",
    icon: Flame,
    iconColor: "text-orange-600 dark:text-orange-500",
    iconBg:
      "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50",
  },
  {
    title: "Time Invested",
    value: "12.5h",
    subtitle: "This week",
    icon: Clock,
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg:
      "bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-950/50 dark:to-cyan-950/50",
  },
];

export function DashboardQuickStats() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statsData.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </motion.div>
  );
}

interface StatsCardProps extends StatItem {
  index?: number;
}

function StatsCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}: StatsCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Card
        className={cn(
          "relative overflow-hidden border-border shadow-sm",
          "dark:border-border/80",
          "transition-all duration-300 group",
          "hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 hover:-translate-y-0.5"
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  {value}
                </h3>
                {change && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded",
                      trend === "up" &&
                        "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50",
                      trend === "down" &&
                        "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/50",
                      !trend && "text-muted-foreground bg-muted"
                    )}
                  >
                    {trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {change}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {subtitle}
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex items-center justify-center h-11 w-11 rounded-xl border border-border/50",
                "transition-transform duration-300 group-hover:scale-110",
                iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
