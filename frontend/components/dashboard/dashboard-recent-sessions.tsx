import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Download,
  Eye,
  Minus,
  MoreVertical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "./dashboard-card";
import { itemVariants } from "./shared-animation-variants";

interface Interview {
  id: number;
  topic: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  score: number;
  duration?: string;
  trend?: "up" | "down" | "same";
}

interface DashboardRecentSessionsSectionProps {
  interviews: Interview[];
  onViewAll?: () => void;
}

const difficultyConfig = {
  Easy: {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  Medium: {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  Hard: {
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500",
  },
};

function getScoreColor(score: number) {
  if (score >= 85) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function DashboardRecentSessionsSection({
  interviews,
  onViewAll,
}: DashboardRecentSessionsSectionProps) {
  return (
    <DashboardCard
      title="Recent Sessions"
      description="Review your latest interview performance"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground h-8"
          onClick={onViewAll}
        >
          <span className="text-sm">View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      }
      className="col-span-full"
    >
      {interviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Desktop View */}
          <div className="hidden md:block rounded-md border border-border/50 overflow-hidden">
            <div className="bg-muted/40 px-6 py-3 border-b border-border/50">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div className="col-span-5">Topic</div>
                <div className="col-span-3">Date & Time</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
            </div>
            <div className="divide-y divide-border/50 bg-card">
              {interviews.map((interview, index) => (
                <motion.div key={interview.id} variants={itemVariants}>
                  <DesktopSessionRow
                    interview={interview}
                    index={index}
                    totalRows={interviews.length}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {interviews.map((interview, index) => (
              <motion.div key={interview.id} variants={itemVariants}>
                <MobileSessionCard interview={interview} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function DesktopSessionRow({
  interview,
}: {
  interview: Interview;
  index: number;
  totalRows: number;
}) {
  return (
    <div className="group hover:bg-muted/30 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
        {/* Topic */}
        <div className="col-span-5 flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0 ring-4 ring-background",
              difficultyConfig[interview.difficulty].dot
            )}
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {interview.topic}
            </p>
            {interview.duration && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {interview.duration}
              </p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="col-span-3 text-sm text-muted-foreground">
          {interview.date}
        </div>

        {/* Difficulty */}
        <div className="col-span-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border",
              difficultyConfig[interview.difficulty].badge
            )}
          >
            {interview.difficulty}
          </Badge>
        </div>

        {/* Score & Actions */}
        <div className="col-span-2 flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  getScoreColor(interview.score)
                )}
              >
                {interview.score}%
              </span>
              {interview.trend && (
                <span>
                  {interview.trend === "up" && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {interview.trend === "down" && (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  {interview.trend === "same" && (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/sessions/${interview.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/analytics/${interview.id}`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function MobileSessionCard({ interview }: { interview: Interview }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              difficultyConfig[interview.difficulty].dot
            )}
          />
          <h3 className="font-medium text-sm truncate">{interview.topic}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2 text-muted-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/sessions/${interview.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/analytics/${interview.id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span>{interview.date}</span>
        {interview.duration && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {interview.duration}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium border",
            difficultyConfig[interview.difficulty].badge
          )}
        >
          {interview.difficulty}
        </Badge>

        <div className="flex items-center gap-2">
          {interview.trend && (
            <>
              {interview.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
              {interview.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              {interview.trend === "same" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              getScoreColor(interview.score)
            )}
          >
            {interview.score}%
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-dashed border-2 rounded-lg bg-muted/10">
      <div className="rounded-full bg-muted p-4 mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No sessions yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
        Start your first interview to see your progress here
      </p>
      <Button variant="outline">Start Interview</Button>
    </div>
  );
}
