"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import {
  useCompleteDrill,
  useDrillWithHints,
  useSkipDrill,
  useStartDrill,
  useSubmitDrill,
} from "@/hooks/use-drills";
import {
  type DrillDifficulty,
  type DrillStatus,
  type DrillType,
} from "@/lib/drill-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Dumbbell,
  Eye,
  Lightbulb,
  Play,
  Send,
  SkipForward,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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

function getDrillTypeLabel(type: DrillType) {
  switch (type) {
    case "practice_question":
      return "Practice Question";
    case "code_exercise":
      return "Code Exercise";
    case "concept_review":
      return "Concept Review";
    case "mock_scenario":
      return "Mock Scenario";
    default:
      return type;
  }
}

export default function DrillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const drillId = Number(params.drillId);
  const { user, isLoading: authLoading } = useAuth();

  const { drill, isLoading, error, refetch } = useDrillWithHints(
    drillId,
    !authLoading && !!user
  );

  const { startDrill, isLoading: isStarting } = useStartDrill(drillId);
  const { submitDrill, isLoading: isSubmitting } = useSubmitDrill(drillId);
  const { completeDrill, isLoading: isCompleting } = useCompleteDrill(drillId);
  const { skipDrill, isLoading: isSkipping } = useSkipDrill(drillId);

  const [response, setResponse] = useState("");
  const [showHints, setShowHints] = useState(false);

  const handleStart = async () => {
    try {
      await startDrill();
      refetch();
    } catch (err) {
      console.error("Failed to start drill:", err);
    }
  };

  const handleSubmit = async () => {
    if (!response.trim()) return;

    try {
      await submitDrill(response);
      await completeDrill();
      refetch();
    } catch (err) {
      console.error("Failed to submit drill:", err);
    }
  };

  const handleSkip = async () => {
    try {
      await skipDrill();
      router.push("/drills");
    } catch (err) {
      console.error("Failed to skip drill:", err);
    }
  };

  if (authLoading || isLoading) {
    return <DrillDetailSkeleton />;
  }

  if (error || !drill) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">{error || "Drill not found"}</p>
        <Link href="/drills">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = drill.status === "pending";
  const isInProgress = drill.status === "in_progress";
  const isCompleted = drill.status === "completed";
  const isSkippedStatus = drill.status === "skipped";
  const canRespond = isInProgress && !drill.user_response;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <Link href="/drills">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{drill.title}</h1>
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
              {drill.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {getDrillTypeLabel(drill.drill_type)}
            </span>
            {drill.target_skill && (
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {drill.target_skill}
              </span>
            )}
          </div>
        </div>
        {drill.score !== null && drill.score !== undefined && (
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{drill.score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        )}
      </motion.div>

      {/* Target Weakness */}
      {drill.target_weakness && (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Focus Area"
            description="This drill targets"
            icon={<Target className="h-4 w-4 text-yellow-400" />}
          >
            <p className="text-sm">{drill.target_weakness}</p>
          </DashboardCard>
        </motion.div>
      )}

      {/* Drill Prompt */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="Exercise"
          description="Complete the following"
          icon={<Dumbbell className="h-4 w-4 text-primary" />}
          gradient="primary"
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {drill.prompt}
            </p>
          </div>
        </DashboardCard>
      </motion.div>

      {/* Hints */}
      {drill.hints && (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Hints"
            description={showHints ? "Here are some hints" : "Need help?"}
            icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                <Eye className="h-4 w-4" />
                {showHints ? "Hide" : "Show"}
              </Button>
            }
          >
            {showHints ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{drill.hints}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "Show" to reveal hints. Try to solve it yourself first!
              </p>
            )}
          </DashboardCard>
        </motion.div>
      )}

      {/* Response Section */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="Your Response"
          description={
            isCompleted || isSkippedStatus
              ? "Your submitted answer"
              : isPending
              ? "Start the drill to respond"
              : "Enter your response"
          }
          icon={<CheckCircle className="h-4 w-4 text-primary" />}
          gradient="accent"
        >
          {isPending ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-primary/20 p-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">
                Ready to start this drill?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isSkipping}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
                <Button onClick={handleStart} disabled={isStarting}>
                  <Play className="h-4 w-4" />
                  Start Drill
                </Button>
              </div>
            </div>
          ) : canRespond ? (
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[200px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSkipping}
                >
                  <SkipForward className="h-4 w-4" />
                  Skip Drill
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isCompleting || !response.trim()}
                >
                  <Send className="h-4 w-4" />
                  Submit Response
                </Button>
              </div>
            </div>
          ) : drill.user_response ? (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="whitespace-pre-wrap">{drill.user_response}</p>
            </div>
          ) : isSkippedStatus ? (
            <p className="text-center text-muted-foreground py-4">
              This drill was skipped.
            </p>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No response submitted yet.
            </p>
          )}
        </DashboardCard>
      </motion.div>

      {/* Back to Drills */}
      <motion.div variants={fadeInUp} className="flex justify-start">
        <Link href="/drills">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function DrillDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
