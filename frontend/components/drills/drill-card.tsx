"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type DrillDifficulty,
  type DrillStatus,
  type DrillSummary,
  type DrillType,
} from "@/lib/drill-api";
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

interface DrillCardProps {
  drill: DrillSummary;
}

function getDifficultyColor(difficulty: DrillDifficulty) {
  switch (difficulty) {
    case "easy":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "hard":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: DrillStatus) {
  switch (status) {
    case "pending":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "in_progress":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "skipped":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getDrillTypeIcon(type: DrillType) {
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

function getStatusIcon(status: DrillStatus) {
  switch (status) {
    case "pending":
      return <Play className="h-4 w-4" />;
    case "in_progress":
      return <Play className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "skipped":
      return <SkipForward className="h-4 w-4" />;
    default:
      return <Play className="h-4 w-4" />;
  }
}

export function DrillCard({ drill }: DrillCardProps) {
  const isPending = drill.status === "pending";
  const isCompleted = drill.status === "completed";
  const isSkipped = drill.status === "skipped";

  return (
    <Link href={`/drills/${drill.id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4",
          "transition-all duration-200",
          "hover:border-white/20 hover:bg-white/10"
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                {getDrillTypeIcon(drill.drill_type)}
              </div>
              <div>
                <h3 className="font-medium line-clamp-1">{drill.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {drill.drill_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            {drill.score !== null && drill.score !== undefined && (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {drill.score}
                </div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs", getDifficultyColor(drill.difficulty))}
            >
              {drill.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", getStatusColor(drill.status))}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(drill.status)}
                {drill.status.replace("_", " ")}
              </span>
            </Badge>
          </div>

          {/* Action */}
          <div className="flex justify-end pt-2">
            <Button
              variant={isPending ? "default" : "outline"}
              size="sm"
              className="group-hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  Start
                  <Play className="h-3.5 w-3.5" />
                </>
              ) : isCompleted || isSkipped ? (
                <>
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
