import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CircleCheck, Clock, Flame, LucideIcon, Trophy } from "lucide-react";
import { cardVariants } from "./shared-animation-variants";

export function DashboardQuickStats() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <StatsCard
        title="Overall Score"
        value="78%"
        change="+5%"
        icon={Trophy}
        iconColor="text-amber-500"
      />
      <StatsCard
        title="Problems Solved"
        value={42}
        subtitle="Top 15% of users"
        icon={CircleCheck}
        iconColor="text-blue-500"
      />
      <StatsCard
        title="Current Streak"
        value="5 Days"
        subtitle="Keep it up!"
        icon={Flame}
        iconColor="text-orange-500"
      />
      <StatsCard
        title="Time Invested"
        value="12.5h"
        subtitle="This week"
        icon={Clock}
        iconColor="text-purple-500"
      />
    </motion.div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeColor?: string;
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  changeColor = "text-muted-foreground",
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
              {change && (
                <div
                  className={cn(
                    "text-xs mt-2 flex items-center gap-1.5 font-medium",
                    changeColor
                  )}
                >
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                    {change.split(" ")[0]}
                  </span>
                  <span className="text-muted-foreground">from last week</span>
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            <div
              className={cn(
                "p-2 rounded-lg bg-background border border-border/50"
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
