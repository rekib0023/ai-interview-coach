"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import {
  CircleCheck,
  Clock,
  Flame,
  LucideIcon,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { cardVariants, staggerContainer } from "./shared-animation-variants";

interface StatItem {
  title: string;
  value: number;
  suffix: string;
  subtitle?: string;
  change?: string;
  icon: LucideIcon;
  gradient: string;
  trend?: "up" | "down" | "neutral";
}

const statsData: StatItem[] = [
  {
    title: "Overall Score",
    value: 78,
    suffix: "%",
    change: "+5%",
    subtitle: "from last week",
    icon: Trophy,
    gradient: "from-yellow-500 to-orange-500",
    trend: "up",
  },
  {
    title: "Problems Solved",
    value: 42,
    suffix: "",
    subtitle: "Top 15% of users",
    icon: CircleCheck,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Current Streak",
    value: 5,
    suffix: " Days",
    subtitle: "Keep it up!",
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Time Invested",
    value: 12.5,
    suffix: "h",
    subtitle: "This week",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    if (value < 10 && value % 1 !== 0) {
      return current.toFixed(1);
    }
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

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
  suffix,
  subtitle,
  change,
  icon: Icon,
  gradient,
  trend,
}: StatsCardProps) {
  return (
    <motion.div variants={cardVariants} className="group">
      <Card
        className={cn(
          "relative overflow-hidden",
          "border-white/10 bg-card/50 backdrop-blur-md",
          "transition-all duration-500",
          "hover:border-white/20 hover:bg-card/70",
          "hover:shadow-xl hover:-translate-y-1"
        )}
      >
        {/* Gradient glow on hover */}
        <div
          className={cn(
            "absolute -top-20 -right-20 w-40 h-40 blur-3xl rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500",
            `bg-gradient-to-br ${gradient}`
          )}
        />

        <CardContent className="relative z-10 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  <AnimatedNumber value={value} suffix={suffix} />
                </h3>
                {change && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                      trend === "up" &&
                        "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30",
                      trend === "down" &&
                        "text-rose-400 bg-rose-500/20 border border-rose-500/30",
                      !trend && "text-muted-foreground bg-muted"
                    )}
                  >
                    {trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {change}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>

            <motion.div
              className={cn(
                "flex items-center justify-center h-12 w-12 rounded-xl",
                "bg-gradient-to-br shadow-lg",
                gradient,
                "group-hover:scale-110 transition-transform duration-300"
              )}
              whileHover={{ rotate: 5 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
