"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type FeedbackResult } from "@/lib/feedback-api";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Star,
  TrendingUp,
} from "lucide-react";

interface FeedbackCardProps {
  result: FeedbackResult;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
}

export function FeedbackCard({ result }: FeedbackCardProps) {
  const score = result.overall_score ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <DashboardCard
        title="Overall Score"
        description={
          result.rubric_name
            ? `Evaluated using ${result.rubric_name}`
            : "AI Evaluation"
        }
        icon={<Star className="h-4 w-4 text-yellow-400" />}
        gradient="primary"
      >
        <div className="flex items-center gap-8">
          {/* Score Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${score * 3.52} 352`}
                strokeLinecap="round"
                className={cn("transition-all duration-1000", scoreColor)}
              />
            </svg>
            <div className="absolute text-center">
              <div className={cn("text-4xl font-bold", scoreColor)}>
                {score}
              </div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-3">
            <div>
              <div className={cn("text-2xl font-bold", scoreColor)}>
                {scoreLabel}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on comprehensive analysis of your response
              </p>
            </div>

            {/* Criterion Scores */}
            {result.criterion_scores &&
              Object.keys(result.criterion_scores).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(result.criterion_scores).map(
                    ([name, criterionScore]) => (
                      <div key={name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">
                            {name.replace(/_/g, " ")}
                          </span>
                          <span className={getScoreColor(criterionScore)}>
                            {criterionScore}%
                          </span>
                        </div>
                        <Progress value={criterionScore} className="h-1.5" />
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </DashboardCard>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <DashboardCard
          title="Strengths"
          description="What you did well"
          icon={<CheckCircle className="h-4 w-4 text-green-400" />}
        >
          <ul className="space-y-3">
            {result.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {/* Weaknesses */}
      {result.weaknesses.length > 0 && (
        <DashboardCard
          title="Areas for Improvement"
          description="Where you can grow"
          icon={<AlertTriangle className="h-4 w-4 text-yellow-400" />}
        >
          <ul className="space-y-3">
            {result.weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <span className="text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <DashboardCard
          title="Suggestions"
          description="Actionable tips to improve"
          icon={<Lightbulb className="h-4 w-4 text-purple-400" />}
        >
          <ul className="space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
              >
                <TrendingUp className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {/* Detailed Feedback */}
      {result.detailed_feedback && (
        <DashboardCard
          title="Detailed Analysis"
          description="In-depth breakdown of your response"
          icon={<Star className="h-4 w-4 text-primary" />}
        >
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 whitespace-pre-wrap">
              {result.detailed_feedback}
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
