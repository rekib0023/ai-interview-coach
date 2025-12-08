import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { itemVariants } from "./shared-animation-variants";

interface SkillMetric {
  name: string;
  progress: number; // 0–100
  trend?: number; // +5 / -2 etc
}

interface DashboardSkillsSectionProps {
  areasToImprove: SkillMetric[];
  strengths: SkillMetric[];
  onViewAll?: (section: "improve" | "strengths") => void;
  onSkillClick?: (skillName: string, section: "improve" | "strengths") => void;
}

export function DashboardSkillsSection({
  areasToImprove,
  strengths,
  onViewAll,
  onSkillClick,
}: DashboardSkillsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Areas to Improve */}
      <DashboardCard
        title="Areas to Improve"
        description="Focus on these for maximum growth"
        icon={
          <TrendingUp className="h-5 w-5 text-orange-500 dark:text-orange-400" />
        }
        action={
          onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground h-8"
              onClick={() => onViewAll("improve")}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )
        }
        containerClassName="h-full"
        className="h-full flex flex-col"
        contentClassName="flex-1"
      >
        <div className="space-y-5">
          {areasToImprove.map((skill, index) => (
            <SkillItem
              key={skill.name}
              skill={skill}
              progressColor="bg-orange-500 dark:bg-orange-400"
              index={index}
              onClick={(name) => onSkillClick?.(name, "improve")}
            />
          ))}
        </div>
      </DashboardCard>

      {/* Strengths */}
      <DashboardCard
        title="Your Strengths"
        description="Keep practicing to maintain excellence"
        icon={
          <BarChart3 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        }
        action={
          onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground h-8"
              onClick={() => onViewAll("strengths")}
            >
              <span className="text-sm">View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )
        }
        containerClassName="h-full"
        className="h-full flex flex-col"
        contentClassName="flex-1"
      >
        <div className="space-y-5">
          {strengths.map((skill, index) => (
            <SkillItem
              key={skill.name}
              skill={skill}
              progressColor="bg-blue-500 dark:bg-blue-400"
              index={index}
              onClick={(name) => onSkillClick?.(name, "strengths")}
            />
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

// Skill Item Component
interface SkillItemProps {
  skill: SkillMetric;
  progressColor: string;
  onClick?: (skillName: string) => void;
  index: number;
}

function SkillItem({ skill, progressColor, onClick, index }: SkillItemProps) {
  const clickable = !!onClick;
  const { name, progress, trend } = skill;

  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  // Determine if this is a high-performing skill
  const isExcellent = progress >= 90;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "space-y-2 rounded-lg p-2 -mx-2 transition-colors",
        clickable && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={() => onClick?.(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium truncate",
              clickable && "group-hover:text-primary transition-colors"
            )}
          >
            {name}
          </span>

          {trend !== undefined && trend !== 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "h-5 gap-0.5 px-1.5 text-xs font-medium shrink-0",
                trendPositive &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
                trendNegative &&
                  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
              )}
            >
              {trendPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>

        <span className="text-sm font-semibold tabular-nums shrink-0 ml-2">
          {progress}%
        </span>
      </div>

      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
            className={cn("h-full rounded-full", progressColor)}
          />
        </div>

        {/* Glow effect for high scores */}
        {isExcellent && (
          <motion.div
            className={cn(
              "absolute inset-0 h-2 rounded-full opacity-30 blur-sm",
              progressColor
            )}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}
