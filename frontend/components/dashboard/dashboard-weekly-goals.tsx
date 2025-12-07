import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Target, Zap } from "lucide-react";
import { cardVariants, itemVariants } from "./shared-animation-variants";

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
  const completionRate =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Weekly Goals</h2>
            {completedGoals > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
              >
                {completedGoals}/{totalGoals} completed
              </Badge>
            )}
          </div>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground -mt-1"
              onClick={onViewAll}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Goals Card */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="space-y-4 pt-6">
            {goals.length === 0 ? (
              <EmptyGoals />
            ) : (
              <>
                {goals.map((goal, index) => (
                  <GoalProgress
                    key={goal.label}
                    goal={goal}
                    index={index}
                    onClick={onGoalClick}
                  />
                ))}

                {/* Overall Progress */}
                {totalGoals > 1 && (
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-muted-foreground">
                        Overall Progress
                      </span>
                      <span className="font-semibold">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                        className={cn(
                          "h-full rounded-full",
                          completionRate === 100
                            ? "bg-emerald-500"
                            : "bg-primary"
                        )}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Goal Progress Item
interface GoalProgressProps {
  goal: WeeklyGoal;
  index: number;
  onClick?: (label: string) => void;
}

function GoalProgress({ goal, index, onClick }: GoalProgressProps) {
  const { label, current, total, priority, category } = goal;
  const percentage = (current / total) * 100;
  const isCompleted = current >= total;
  const isAlmostDone = percentage >= 80 && !isCompleted;
  const clickable = !!onClick;

  // Get priority indicator
  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "text-rose-500 dark:text-rose-400";
      case "medium":
        return "text-amber-500 dark:text-amber-400";
      case "low":
        return "text-blue-500 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        "space-y-2 rounded-lg p-2 -mx-2 transition-colors",
        clickable && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={() => onClick?.(label)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Completion Icon */}
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <Circle
              className={cn("h-4 w-4 mt-0.5 shrink-0", getPriorityColor())}
            />
          )}

          {/* Label and Category */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {label}
              </span>
              {category && (
                <Badge variant="outline" className="text-xs h-5">
                  {category}
                </Badge>
              )}
              {isAlmostDone && (
                <Badge
                  variant="secondary"
                  className="text-xs h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                >
                  <Zap className="h-3 w-3 mr-0.5" />
                  Almost there!
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Progress Counter */}
        <span
          className={cn(
            "text-sm font-semibold tabular-nums shrink-0",
            isCompleted
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          )}
        >
          {current}/{total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative ml-6">
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
            className={cn(
              "h-full rounded-full transition-colors",
              isCompleted ? "bg-emerald-500" : "bg-foreground"
            )}
          />
        </div>

        {/* Glow effect for completed goals */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 h-2.5 rounded-full bg-emerald-500 opacity-30 blur-sm"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Empty State
function EmptyGoals() {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="rounded-full bg-muted p-3 mb-3">
        <Target className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No goals set</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Set weekly goals to track your progress
      </p>
      <Button size="sm" variant="outline">
        Add Goal
      </Button>
    </motion.div>
  );
}

// Compact version for smaller spaces
export function DashboardWeeklyGoalsCompact({
  goals,
}: Pick<DashboardWeeklyGoalsProps, "goals">) {
  const completedGoals = goals.filter((g) => g.current >= g.total).length;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Weekly Goals</h3>
            </div>
            <Badge variant="secondary" className="text-xs h-5">
              {completedGoals}/{goals.length}
            </Badge>
          </div>

          {goals.slice(0, 3).map((goal) => {
            const percentage = (goal.current / goal.total) * 100;
            const isCompleted = goal.current >= goal.total;

            return (
              <div key={goal.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "font-medium truncate",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {goal.label}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums ml-2">
                    {goal.current}/{goal.total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted ml-4">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isCompleted ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
