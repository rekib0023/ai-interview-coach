"use client";

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
  Play,
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
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  Medium: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    dot: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  Hard: {
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    dot: "bg-rose-500",
    glow: "shadow-rose-500/20",
  },
};

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-rose-400";
}

function getScoreGlow(score: number) {
  if (score >= 85) return "shadow-emerald-500/30";
  if (score >= 70) return "shadow-amber-500/30";
  return "shadow-rose-500/30";
}

export function DashboardRecentSessionsSection({
  interviews,
  onViewAll,
}: DashboardRecentSessionsSectionProps) {
  return (
    <DashboardCard
      title="Recent Sessions"
      description="Review your latest interview performance"
      icon={<BarChart3 className="h-5 w-5 text-primary" />}
      action={
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-8 hover:bg-white/5"
          onClick={onViewAll}
        >
          <span className="text-sm">View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      }
      className="col-span-full"
      gradient="primary"
    >
      {interviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Desktop View */}
          <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden bg-white/5">
            <div className="bg-white/5 px-6 py-3 border-b border-white/5">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div className="col-span-5">Topic</div>
                <div className="col-span-3">Date & Time</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                >
                  <DesktopSessionRow interview={interview} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
              >
                <MobileSessionCard interview={interview} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function DesktopSessionRow({ interview }: { interview: Interview }) {
  return (
    <div className="group hover:bg-white/5 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
        {/* Topic */}
        <div className="col-span-5 flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full flex-shrink-0 ring-4 ring-background shadow-lg",
              difficultyConfig[interview.difficulty].dot,
              difficultyConfig[interview.difficulty].glow
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
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold tabular-nums px-2 py-0.5 rounded-md bg-white/5",
                getScoreColor(interview.score)
              )}
            >
              {interview.score}%
            </span>
            {interview.trend && (
              <span>
                {interview.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                )}
                {interview.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                )}
                {interview.trend === "same" && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            )}
          </div>

          <SessionActionsMenu interviewId={interview.id} />
        </div>
      </div>
    </div>
  );
}

function MobileSessionCard({ interview }: { interview: Interview }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-lg",
              difficultyConfig[interview.difficulty].dot,
              difficultyConfig[interview.difficulty].glow
            )}
          />
          <h3 className="font-medium text-sm truncate">{interview.topic}</h3>
        </div>

        <SessionActionsMenu interviewId={interview.id} />
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
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              )}
              {interview.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-rose-400" />
              )}
              {interview.trend === "same" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
          <span
            className={cn(
              "text-sm font-bold tabular-nums px-2 py-0.5 rounded-md bg-white/5",
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

function SessionActionsMenu({ interviewId }: { interviewId: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-white/10 bg-card/95 backdrop-blur-xl"
      >
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/sessions/${interviewId}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/analytics/${interviewId}`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Export Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border-2 border-dashed border-white/10 bg-white/5">
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-4 mb-4">
        <Play className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-base font-semibold mb-1">No sessions yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
        Start your first interview to see your progress here
      </p>
      <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25">
        <Play className="h-4 w-4" />
        Start Interview
      </Button>
    </div>
  );
}
