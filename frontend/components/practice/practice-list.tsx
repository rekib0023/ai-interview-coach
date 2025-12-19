"use client";

import { Badge } from "@/components/ui/badge";
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

interface PracticeListProps {
  practices: PracticeSummary[];
}

function getDifficultyColor(difficulty: PracticeDifficulty) {
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

function getStatusColor(status: PracticeStatus) {
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
      return <Play className="h-3.5 w-3.5" />;
    case "in_progress":
      return <Play className="h-3.5 w-3.5" />;
    case "completed":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "skipped":
      return <SkipForward className="h-3.5 w-3.5" />;
    default:
      return <Play className="h-3.5 w-3.5" />;
  }
}

export function PracticeList({ practices }: PracticeListProps) {
  if (practices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-muted/50 p-4">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-semibold">No practices</h3>
        <p className="text-sm text-muted-foreground">
          Complete assessment sessions to generate practices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {practices.map((practice) => (
        <Link key={practice.id} href={`/practice/${practice.id}`}>
          <div
            className={cn(
              "group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3",
              "transition-all duration-200",
              "hover:border-white/20 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                {getPracticeTypeIcon(practice.practice_type)}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium truncate">{practice.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {practice.practice_type.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getDifficultyColor(practice.difficulty)
                  )}
                >
                  {practice.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs flex items-center gap-1",
                    getStatusColor(practice.status)
                  )}
                >
                  {getStatusIcon(practice.status)}
                  {practice.status.replace("_", " ")}
                </Badge>
              </div>

              {practice.score !== null && practice.score !== undefined && (
                <div className="text-right min-w-[3rem]">
                  <div className="text-lg font-bold text-primary">
                    {practice.score}
                  </div>
                </div>
              )}

              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
