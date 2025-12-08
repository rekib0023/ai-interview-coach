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
    iconColor: "text-primary",
    iconBg: "bg-primary/10 dark:bg-primary/20",
    trend: "up",
  },
  {
    title: "Problems Solved",
    value: 42,
    subtitle: "Top 15% of users",
    icon: CircleCheck,
    iconColor: "text-chart-2",
    iconBg: "bg-chart-2/10 dark:bg-chart-2/20",
  },
  {
    title: "Current Streak",
    value: "5 Days",
    subtitle: "Keep it up!",
    icon: Flame,
    iconColor: "text-accent",
    iconBg: "bg-accent/10 dark:bg-accent/20",
  },
  {
    title: "Time Invested",
    value: "12.5h",
    subtitle: "This week",
    icon: Clock,
    iconColor: "text-chart-3",
    iconBg: "bg-chart-3/10 dark:bg-chart-3/20",
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
                        "text-chart-4 bg-chart-4/10 dark:text-chart-4 dark:bg-chart-4/20",
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
