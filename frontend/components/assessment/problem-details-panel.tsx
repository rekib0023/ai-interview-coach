"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssessmentTimer } from "./assessment-timer";
import {
  Clock,
  Target,
  List,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type DifficultyLevel, type AssessmentStatus } from "@/lib/assessment-api";

interface ProblemDetailsPanelProps {
  assessment: {
    id: number;
    topic: string;
    difficulty: DifficultyLevel;
    status: AssessmentStatus;
    duration_minutes?: number | null;
    started_at?: string | null;
    score?: number | null;
    question?: string | null;
    question_context?: string | null;
  };
  onTimerExpire?: () => void;
  onRequestHint?: () => void;
  hintCount?: number;
  maxHints?: number;
  testResults?: {
    passed?: number;
    total?: number;
  };
}

export function ProblemDetailsPanel({
  assessment,
  onTimerExpire,
  onRequestHint,
  hintCount = 0,
  maxHints = 3,
  testResults,
}: ProblemDetailsPanelProps) {
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [constraintsOpen, setConstraintsOpen] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState("00:00");

  const isActive =
    assessment.status === "in_progress" || assessment.status === "created";
  const passRate = testResults?.total
    ? ((testResults.passed || 0) / testResults.total) * 100
    : 0;

  // Update timer display in real-time
  useEffect(() => {
    if (!isActive || !assessment.started_at) {
      setTimerDisplay("00:00");
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(assessment.started_at!).getTime();
      const durationMs = (assessment.duration_minutes || 45) * 60 * 1000;
      const endTime = startTime + durationMs;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimerDisplay(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isActive, assessment.started_at, assessment.duration_minutes]);

  // Parse question context for examples and constraints
  const parseQuestionContext = () => {
    if (!assessment.question_context) return { examples: [], constraints: [] };
    try {
      const context = JSON.parse(assessment.question_context);
      return {
        examples: context.examples || [],
        constraints: context.constraints || [],
      };
    } catch {
      return { examples: [], constraints: [] };
    }
  };

  const { examples, constraints } = parseQuestionContext();

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-green-500" : "bg-gray-500"
              )}
            />
            <span className="text-sm font-medium">
              {isActive ? "In Progress" : assessment.status.replace("_", " ")}
            </span>
          </div>

          {isActive && assessment.started_at && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-semibold">
                {timerDisplay}
              </span>
            </div>
          )}

          {assessment.score !== null && assessment.score !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {Math.round(assessment.score)}%
              </span>
            </div>
          )}

          {testResults?.total !== undefined && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <List className="w-4 h-4 text-muted-foreground" />
                <span>
                  <span className="font-semibold">
                    {testResults.passed || 0}
                  </span>
                  /{testResults.total}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pass Rate</span>
                  <span className="font-medium">{Math.round(passRate)}%</span>
                </div>
                <Progress value={passRate} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Problem Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{assessment.topic}</h2>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            assessment.difficulty === "Easy"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : assessment.difficulty === "Medium"
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          )}
        >
          {assessment.difficulty}
        </Badge>
      </div>

      {/* Description */}
      {assessment.question && (
        <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="font-medium text-sm">Description</span>
            {descriptionOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {assessment.question}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="font-medium text-sm">Examples</span>
            {examplesOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="space-y-4">
              {examples.map((example: any, idx: number) => (
                <div key={idx} className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Input:</span>{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {typeof example.input === "object"
                        ? JSON.stringify(example.input)
                        : example.input}
                    </code>
                  </div>
                  {example.output && (
                    <div>
                      <span className="font-semibold">Output:</span>{" "}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {typeof example.output === "object"
                          ? JSON.stringify(example.output)
                          : example.output}
                      </code>
                    </div>
                  )}
                  {example.explanation && (
                    <div className="text-xs text-muted-foreground">
                      {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Constraints */}
      {constraints.length > 0 && (
        <Collapsible open={constraintsOpen} onOpenChange={setConstraintsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
            <span className="font-medium text-sm">Constraints</span>
            {constraintsOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {constraints.map((constraint: string, idx: number) => (
                <li key={idx}>{constraint}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Request Hint Button */}
      {isActive && onRequestHint && (
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onRequestHint}
          disabled={hintCount >= maxHints}
        >
          <Lightbulb className="w-4 h-4" />
          Request Hint ({hintCount}/{maxHints})
        </Button>
      )}
    </div>
  );
}
