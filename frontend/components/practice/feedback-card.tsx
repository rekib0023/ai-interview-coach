"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { type FeedbackResult } from "@/lib/feedback-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
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

function getBgScoreColor(score: number) {
  if (score >= 80) return "bg-green-400";
  if (score >= 60) return "bg-yellow-400";
  return "bg-red-400";
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
    <div className="space-y-8">
      {/* Overall Score Section - Redesigned */}
      <DashboardCard gradient="primary" className="overflow-visible">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 p-2">
          {/* Enhanced Score Circle */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
            <svg className="h-40 w-40 -rotate-90 transform relative z-10">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/5"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${score * 4.4} 440`}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-1000 ease-out drop-shadow-lg",
                  scoreColor
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "text-5xl font-black tracking-tighter",
                  scoreColor
                )}
              >
                {score}
              </motion.span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                Score
              </span>
            </div>
          </div>

          {/* Score Context */}
          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <div>
              <h3 className={cn("text-3xl font-bold mb-2", scoreColor)}>
                {scoreLabel}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {result.rubric_name
                  ? `Evaluated using ${result.rubric_name}`
                  : "AI-powered comprehensive evaluation of your interview performance."}
              </p>
            </div>

            {/* Criterion Scores - Grid Layout */}
            {result.criterion_scores &&
              Object.keys(result.criterion_scores).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {Object.entries(result.criterion_scores).map(
                    ([name, criterionScore]) => (
                      <div
                        key={name}
                        className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span className="capitalize text-foreground/80">
                            {name.replace(/_/g, " ")}
                          </span>
                          <span className={getScoreColor(criterionScore)}>
                            {criterionScore}%
                          </span>
                        </div>
                        <Progress
                          value={criterionScore}
                          className="h-2 bg-white/5"
                          // Note: We might need a custom Progress component to support dynamic indicator colors elegantly,
                          // but for now we can rely on standard or create a workaround if needed.
                          // Shadcn Progress doesn't easily accept indicatorClassName in props directly without customization.
                          // Assuming default color for now or standard progress bar.
                        />
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {result.strengths.length > 0 && (
          <DashboardCard
            title="Strengths"
            icon={<CheckCircle className="h-5 w-5 text-green-400" />}
            className="h-full border-green-500/20 bg-green-500/5"
          >
            <ul className="space-y-3">
              {result.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm text-foreground/90 leading-relaxed"
                >
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
                  {strength}
                </li>
              ))}
            </ul>
          </DashboardCard>
        )}

        {/* Weaknesses */}
        {result.weaknesses.length > 0 && (
          <DashboardCard
            title="Areas for Improvement"
            icon={<AlertTriangle className="h-5 w-5 text-yellow-400" />}
            className="h-full border-yellow-500/20 bg-yellow-500/5"
          >
            <ul className="space-y-3">
              {result.weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm text-foreground/90 leading-relaxed"
                >
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2" />
                  {weakness}
                </li>
              ))}
            </ul>
          </DashboardCard>
        )}
      </div>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <DashboardCard
          title="Actionable Suggestions"
          icon={<Lightbulb className="h-5 w-5 text-purple-400" />}
          className="border-purple-500/20 bg-purple-500/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/10 flex flex-col gap-3"
              >
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <p className="text-sm font-medium">{suggestion}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Detailed Feedback */}
      {result.detailed_feedback && (
        <DashboardCard
          title="Detailed Analysis"
          icon={<Activity className="h-5 w-5 text-primary" />}
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 whitespace-pre-wrap">
              {result.detailed_feedback}
            </div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
