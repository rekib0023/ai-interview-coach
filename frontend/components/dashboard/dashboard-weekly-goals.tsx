"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Zap,
} from "lucide-react";
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
              variant="outline"
              className={cn(
                "hidden sm:inline-flex border",
                "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              )}
            >
              {completedGoals}/{totalGoals} completed
            </Badge>
          )}
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 hover:bg-white/5"
              onClick={onViewAll}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      }
      gradient="primary"
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
        return "text-rose-400";
      case "medium":
        return "text-amber-400";
      case "low":
        return "text-emerald-400";
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
        "group relative rounded-xl p-4",
        "bg-white/5 border border-transparent",
        "transition-all duration-300",
        "hover:bg-white/10 hover:border-white/10",
        clickable && "cursor-pointer"
      )}
      onClick={() => onClick?.(label)}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shrink-0 shadow-lg shadow-emerald-500/30"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.div>
          ) : (
            <Circle className={cn("h-4 w-4 shrink-0", getPriorityColor())} />
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
              variant="outline"
              className={cn(
                "text-[10px] h-5 px-2 gap-1 shrink-0",
                "bg-amber-500/20 text-amber-400 border-amber-500/30",
                "animate-pulse"
              )}
            >
              <Zap className="h-2.5 w-2.5" />
              Almost!
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums",
            "bg-white/10 border border-white/10",
            isCompleted ? "text-emerald-400" : "text-foreground"
          )}
        >
          <span>{current}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{total}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
          className={cn(
            "h-full rounded-full",
            isCompleted
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-primary to-accent"
          )}
        />
      </div>
    </motion.div>
  );
}

function EmptyGoals() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-white/10 bg-white/5">
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-4 mb-4">
        <Target className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No goals set</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Set weekly goals to track your progress
      </p>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 border-white/10 bg-white/5 hover:bg-white/10"
      >
        <Plus className="h-4 w-4" />
        Add Goal
      </Button>
    </div>
  );
}
