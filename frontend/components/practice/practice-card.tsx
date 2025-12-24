"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type PracticeDifficulty,
  type PracticeStatus,
  type PracticeSummary,
  type PracticeType,
} from "@/lib/practice-api";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Dumbbell,
  FileQuestion,
  Play,
  SkipForward,
  Users,
} from "lucide-react";
import Link from "next/link";

interface PracticeCardProps {
  practice: PracticeSummary;
}

function getDifficultyColor(difficulty: PracticeDifficulty) {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: PracticeStatus) {
  switch (status) {
    case "pending":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "in_progress":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "skipped":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPracticeTypeIcon(type: PracticeType) {
  switch (type) {
    case "practice_question":
      return <FileQuestion className="h-4 w-4" />;
    case "code_exercise":
      return <Code className="h-4 w-4" />;
    case "concept_review":
      return <Dumbbell className="h-4 w-4" />;
    case "mock_scenario":
      return <Users className="h-4 w-4" />;
    default:
      return <Dumbbell className="h-4 w-4" />;
  }
}

function getStatusIcon(status: PracticeStatus) {
  switch (status) {
    case "pending":
      return <Play className="h-3 w-3" />;
    case "in_progress":
      return <Play className="h-3 w-3" />;
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
    case "skipped":
      return <SkipForward className="h-3 w-3" />;
    default:
      return <Play className="h-3 w-3" />;
  }
}

export function PracticeCard({ practice }: PracticeCardProps) {
  const isPending = practice.status === "pending";
  const isCompleted = practice.status === "completed";
  const isSkipped = practice.status === "skipped";

  return (
    <Link href={`/practice/${practice.id}`} className="group block h-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-5 h-full flex flex-col",
          "transition-all duration-300 ease-out",
          "hover:border-primary/20 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg shrink-0 transition-colors duration-300",
                  "bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                {getPracticeTypeIcon(practice.practice_type)}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors duration-300">
                  {practice.title}
                </h3>
                <p className="text-xs text-muted-foreground capitalize font-medium">
                  {practice.practice_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            {practice.score !== null && practice.score !== undefined && (
              <div className="text-right shrink-0 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                <div className="text-lg font-bold text-primary leading-none">
                  {practice.score}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-end justify-between gap-4 pt-2 border-t border-white/5 mt-auto">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0.5 h-5 font-medium border-0",
                  getDifficultyColor(practice.difficulty)
                )}
              >
                {practice.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0.5 h-5 font-medium border-0",
                  getStatusColor(practice.status)
                )}
              >
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(practice.status)}
                  {practice.status.replace("_", " ")}
                </span>
              </Badge>
            </div>

            <Button
              variant={isPending ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 text-xs transition-all duration-300",
                isPending
                  ? "bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
                  : "hover:bg-white/10"
              )}
            >
              {isPending ? (
                <>
                  Start
                  <Play className="ml-1.5 h-3 w-3 fill-current" />
                </>
              ) : isCompleted || isSkipped ? (
                <>
                  Review
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </>
              ) : (
                <>
                  Resume
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
