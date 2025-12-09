"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type FeedbackStatusResponse } from "@/lib/feedback-api";
import { AlertCircle, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface FeedbackPollingProps {
  status: FeedbackStatusResponse | null;
  error: string | null;
  onRetry: () => void;
}

export function FeedbackPolling({
  status,
  error,
  onRetry,
}: FeedbackPollingProps) {
  const [progress, setProgress] = useState(0);

  // Simulate progress based on status
  useEffect(() => {
    if (!status) return;

    let targetProgress = 0;
    switch (status.status) {
      case "pending":
        targetProgress = 20;
        break;
      case "processing":
        targetProgress = 60;
        break;
      case "completed":
        targetProgress = 100;
        break;
      case "failed":
        targetProgress = 0;
        break;
    }

    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [status]);

  if (error) {
    return (
      <DashboardCard
        title="Feedback Error"
        description="Something went wrong"
        icon={<AlertCircle className="h-4 w-4 text-destructive" />}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/20 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </DashboardCard>
    );
  }

  const statusMessage = status?.progress_message || "Starting analysis...";
  const estimatedSeconds = status?.estimated_completion_seconds;

  return (
    <DashboardCard
      title="Generating Feedback"
      description="AI is analyzing your response"
      icon={<Sparkles className="h-4 w-4 text-primary animate-pulse" />}
      gradient="primary"
    >
      <div className="space-y-6 py-4">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative rounded-full bg-primary/30 p-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          <p className="font-medium mb-1">{statusMessage}</p>
          {estimatedSeconds && (
            <p className="text-sm text-muted-foreground">
              Estimated time: ~{estimatedSeconds}s
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Analyzing response</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div
            className={`p-2 rounded-lg ${
              progress >= 20
                ? "bg-primary/20 text-primary"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <div className="font-medium">Step 1</div>
            <div>Parsing</div>
          </div>
          <div
            className={`p-2 rounded-lg ${
              progress >= 60
                ? "bg-primary/20 text-primary"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <div className="font-medium">Step 2</div>
            <div>Analyzing</div>
          </div>
          <div
            className={`p-2 rounded-lg ${
              progress >= 100
                ? "bg-primary/20 text-primary"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <div className="font-medium">Step 3</div>
            <div>Scoring</div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
