"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Target, Zap } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { itemVariants } from "./shared-animation-variants";

interface WeeklyGoal {
  label: string;
  current: number;
  total: number;
  priority?: "high" | "medium" | "low";
  category?: string;
}

interface DashboardWeeklyGoalsProps {
  goals: WeeklyGoal[];
  onViewAll?: () => void;
  onGoalClick?: (label: string) => void;
}

export function DashboardWeeklyGoals({
  goals,
  onViewAll,
  onGoalClick,
}: DashboardWeeklyGoalsProps) {
  const completedGoals = goals.filter((g) => g.current >= g.total).length;
  const totalGoals = goals.length;

  return (
    <DashboardCard
      title="Weekly Goals"
      icon={<Target className="h-5 w-5 text-primary" />}
      action={
        <div className="flex items-center gap-2">
          {completedGoals > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "hidden sm:inline-flex",
                "bg-chart-4/10 text-chart-4 border-chart-4/30",
                "dark:bg-chart-4/20 dark:text-chart-4 dark:border-chart-4/40"
              )}
            >
              {completedGoals}/{totalGoals} completed
            </Badge>
          )}
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground h-8"
              onClick={onViewAll}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      }
    >
      {goals.length === 0 ? (
        <EmptyGoals />
      ) : (
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <GoalProgress
              key={goal.label}
              goal={goal}
              index={index}
              onClick={onGoalClick}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

interface GoalProgressProps {
  goal: WeeklyGoal;
  index: number;
  onClick?: (label: string) => void;
}

function GoalProgress({ goal, index, onClick }: GoalProgressProps) {
  const { label, current, total, priority } = goal;
  const percentage = Math.min((current / total) * 100, 100);
  const isCompleted = current >= total;
  const isAlmostDone = percentage >= 80 && !isCompleted;
  const clickable = !!onClick;

  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "text-rose-500 dark:text-rose-400";
      case "medium":
        return "text-amber-500 dark:text-amber-400";
      case "low":
        return "text-chart-2";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative rounded-lg bg-muted/30 border border-transparent p-3",
        "transition-all duration-200",
        "hover:bg-muted/50 hover:border-border/50",
        clickable && "cursor-pointer"
      )}
      onClick={() => onClick?.(label)}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </motion.div>
          ) : (
            <Circle className={cn("h-3 w-3 shrink-0", getPriorityColor())} />
          )}

          <span
            className={cn(
              "text-sm font-medium truncate transition-colors",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {label}
          </span>

          {isAlmostDone && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] h-5 px-1.5",
                "bg-amber-50 text-amber-600 border-amber-200",
                "dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
                "animate-pulse"
              )}
            >
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              Almost!
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums",
            "bg-background border border-border/50",
            isCompleted
              ? "text-chart-4"
              : "text-foreground"
          )}
        >
          <span>{current}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{total}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
          className={cn(
            "h-full rounded-full",
            isCompleted ? "bg-chart-4" : "bg-primary"
          )}
        />
      </div>
    </motion.div>
  );
}

function EmptyGoals() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Target className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No goals set</h3>
      <p className="text-xs mb-4">Set weekly goals to track your progress</p>
      <Button size="sm" variant="outline">
        Add Goal
      </Button>
    </div>
  );
}
