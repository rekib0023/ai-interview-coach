"use client";

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
        icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
        action={
          onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 hover:bg-white/5"
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
        gradient="accent"
      >
        <div className="space-y-4">
          {areasToImprove.map((skill, index) => (
            <SkillItem
              key={skill.name}
              skill={skill}
              progressGradient="from-orange-500 to-amber-500"
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
        icon={<BarChart3 className="h-5 w-5 text-blue-400" />}
        action={
          onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 hover:bg-white/5"
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
        gradient="primary"
      >
        <div className="space-y-4">
          {strengths.map((skill, index) => (
            <SkillItem
              key={skill.name}
              skill={skill}
              progressGradient="from-blue-500 to-cyan-500"
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
  progressGradient: string;
  onClick?: (skillName: string) => void;
  index: number;
}

function SkillItem({
  skill,
  progressGradient,
  onClick,
  index,
}: SkillItemProps) {
  const clickable = !!onClick;
  const { name, progress, trend } = skill;

  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      className={cn(
        "space-y-2.5 rounded-xl p-3 -mx-1 transition-all duration-300",
        "bg-white/5 border border-transparent",
        clickable && "cursor-pointer hover:bg-white/10 hover:border-white/10"
      )}
      onClick={() => onClick?.(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{name}</span>

          {trend !== undefined && trend !== 0 && (
            <Badge
              variant="outline"
              className={cn(
                "h-5 gap-0.5 px-1.5 text-xs font-medium shrink-0 border",
                trendPositive &&
                  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                trendNegative &&
                  "bg-rose-500/20 text-rose-400 border-rose-500/30"
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

        <span className="text-sm font-bold tabular-nums shrink-0 ml-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            progressGradient
          )}
        />
      </div>
    </motion.div>
  );
}
