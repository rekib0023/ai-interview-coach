"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dumbbell,
  Eye,
  EyeOff,
  Lightbulb,
  Play,
  Send,
  Target
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
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: DrillStatus) {
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive mb-6 text-lg">
          {error || "Drill not found"}
        </p>
        <Link href="/drills">
          <Button variant="outline" className="gap-2">
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
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      {/* Header Navigation */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
      >
        <Link
          href="/drills"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Drills
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {drill.title}
        </span>
      </motion.div>

      {/* Main Header Card */}
      <motion.div
        variants={fadeInUp}
        className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-0.5 border-0 font-medium",
                      getDifficultyColor(drill.difficulty)
                    )}
                  >
                    {drill.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-0.5 border-0 font-medium",
                      getStatusColor(drill.status)
                    )}
                  >
                    {drill.status.replace("_", " ")}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {drill.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  {getDrillTypeLabel(drill.drill_type)}
                </span>
                {drill.target_skill && (
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Target className="h-4 w-4 text-accent" />
                    {drill.target_skill}
                  </span>
                )}
              </div>
            </div>

            {drill.score !== null && drill.score !== undefined && (
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-4 border border-white/10 min-w-[100px]">
                <div className="text-4xl font-bold text-primary">
                  {drill.score}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-1">
                  Score
                </div>
              </div>
            )}
          </div>

          {/* Target Weakness Banner */}
          {drill.target_weakness && (
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
              <Target className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">
                  Focus Area
                </p>
                <p className="text-sm text-yellow-100/90">
                  {drill.target_weakness}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Prompt & Hints */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={fadeInUp}>
            <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Exercise Prompt</h3>
              </div>
              <div className="p-6 md:p-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap text-foreground/90 font-light">
                    {drill.prompt}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hints */}
          {drill.hints && (
            <motion.div variants={fadeInUp}>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-card/30">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb
                      className={cn(
                        "h-4 w-4",
                        showHints ? "text-yellow-400" : "text-muted-foreground"
                      )}
                    />
                    <span className="font-semibold">Hints</span>
                  </div>
                  {showHints ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showHints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/10 bg-yellow-500/5"
                  >
                    <div className="p-6 prose prose-invert prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-yellow-200/90">
                        {drill.hints}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Response Area */}
        <div className="lg:col-span-1">
          <motion.div variants={fadeInUp} className="sticky top-6">
            <div
              className={cn(
                "rounded-xl border border-white/10 overflow-hidden flex flex-col h-full min-h-[400px]",
                isPending
                  ? "bg-gradient-to-b from-primary/10 to-transparent"
                  : "bg-card/50"
              )}
            >
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Your Response</h3>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                {isPending ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <div className="relative bg-primary/20 p-4 rounded-full ring-1 ring-primary/40">
                        <Play className="h-8 w-8 text-primary fill-current" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        Ready to Start?
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                        Begin the drill to unlock the response area and timer.
                      </p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                      <Button
                        onClick={handleStart}
                        disabled={isStarting}
                        size="lg"
                        className="w-full font-semibold shadow-lg shadow-primary/20"
                      >
                        Start Drill
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isSkipping}
                        size="sm"
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        Skip for now
                      </Button>
                    </div>
                  </div>
                ) : canRespond ? (
                  <div className="flex-1 flex flex-col gap-4">
                    <textarea
                      className="flex-1 w-full min-h-[200px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all"
                      placeholder="Type your response here..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      autoFocus
                    />
                    <div className="flex flex-col gap-3 mt-auto">
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting || isCompleting || !response.trim()
                        }
                        className="w-full"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Response
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        disabled={isSkipping}
                        size="sm"
                        className="w-full text-muted-foreground"
                      >
                        Skip Drill
                      </Button>
                    </div>
                  </div>
                ) : drill.user_response ? (
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm whitespace-pre-wrap text-muted-foreground italic mb-4">
                      "{drill.user_response}"
                    </div>
                    {drill.score !== null && (
                      <div className="mt-auto pt-4 border-t border-white/10 text-center">
                        <span className="text-sm text-muted-foreground">
                          Drill completed
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">
                    {isSkippedStatus ? "Drill skipped" : "No response"}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function DrillDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
      <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="lg:col-span-1">
          <div className="h-[400px] bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
