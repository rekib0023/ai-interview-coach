import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
  LucideIcon,
  Sparkles,
} from "lucide-react";

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
      <div className="space-y-4">
        <SectionHeader
          icon={TrendingUp}
          iconColor="text-amber-500"
          title="Areas to Improve"
          subtitle="Focus on these for maximum growth"
          onViewAll={() => onViewAll?.("improve")}
        />
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6 space-y-5">
            {areasToImprove.map((skill, index) => (
              <SkillItem
                key={skill.name}
                skill={skill}
                progressColor="bg-amber-500"
                index={index}
                onClick={(name) => onSkillClick?.(name, "improve")}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strengths */}
      <div className="space-y-4">
        <SectionHeader
          icon={BarChart3}
          iconColor="text-emerald-500"
          title="Your Strengths"
          subtitle="Keep practicing to maintain excellence"
          onViewAll={() => onViewAll?.("strengths")}
        />
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6 space-y-5">
            {strengths.map((skill, index) => (
              <SkillItem
                key={skill.name}
                skill={skill}
                progressColor="bg-emerald-500"
                index={index}
                onClick={(name) => onSkillClick?.(name, "strengths")}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Section Header Component
interface SectionHeaderProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  subtitle: string;
  onViewAll?: () => void;
}

function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  onViewAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon className={cn("h-5 w-5", iconColor)} />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
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
  const isGood = progress >= 75 && progress < 90;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.25 }}
      viewport={{ once: true }}
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
                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                trendNegative && "bg-rose-50 text-rose-700 border-rose-200"
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
            transition={{ duration: 0.8, ease: "easeOut" }}
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

      {/* Achievement badges */}
      {/* {progress === 100 && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Sparkles className="h-3 w-3" />
          <span>Mastered!</span>
        </div>
      )}

      {isExcellent && progress < 100 && (
        <p className="text-xs text-emerald-600/80 font-medium">
          Almost there! Keep going 💪
        </p>
      )}

      {isGood && (
        <p className="text-xs text-amber-600/80 font-medium">
          Good progress! Practice more 📈
        </p>
      )} */}
    </motion.div>
  );
}

// Optional: Compact version for smaller spaces
export function DashboardSkillsSectionCompact({
  areasToImprove,
  strengths,
}: Omit<DashboardSkillsSectionProps, "onViewAll" | "onSkillClick">) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CompactSkillCard
        title="Areas to Improve"
        icon={TrendingUp}
        iconColor="text-amber-500"
        skills={areasToImprove}
        progressColor="bg-amber-500"
      />
      <CompactSkillCard
        title="Your Strengths"
        icon={BarChart3}
        iconColor="text-emerald-500"
        skills={strengths}
        progressColor="bg-emerald-500"
      />
    </div>
  );
}

function CompactSkillCard({
  title,
  icon: Icon,
  iconColor,
  skills,
  progressColor,
}: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  skills: SkillMetric[];
  progressColor: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {skills.slice(0, 3).map((skill) => (
          <div key={skill.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium truncate flex-1">{skill.name}</span>
              <span className="font-semibold tabular-nums ml-2">
                {skill.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn("h-full rounded-full", progressColor)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
