"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FeedbackCard } from "@/components/practice/feedback-card";
import { FeedbackPolling } from "@/components/practice/feedback-polling";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useFeedbackResult, useRequestFeedback } from "@/hooks/use-feedback";
import { useSession } from "@/hooks/use-session";
import { feedbackApi, type FeedbackResult } from "@/lib/feedback-api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.sessionId);
  const { user, isLoading: authLoading } = useAuth();

  const { session, isLoading: sessionLoading } = useSession(
    sessionId,
    !authLoading && !!user
  );

  const {
    requestFeedback,
    feedbackId,
    status,
    result: pollingResult,
    isRequesting,
    isPolling,
    error: requestError,
    reset,
  } = useRequestFeedback(sessionId);

  const [existingFeedbackId, setExistingFeedbackId] = useState<number | null>(
    null
  );
  const [existingResult, setExistingResult] = useState<FeedbackResult | null>(
    null
  );
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Check for existing feedback on mount
  useEffect(() => {
    async function checkExistingFeedback() {
      if (authLoading || !user) return;

      try {
        const feedbackRuns = await feedbackApi.listFeedbackRuns(0, 10);
        const existingForSession = feedbackRuns.feedback_runs.find(
          (fb) => fb.session_id === sessionId && fb.status === "completed"
        );

        if (existingForSession) {
          setExistingFeedbackId(existingForSession.id);
          const result = await feedbackApi.getFeedbackResult(
            existingForSession.id
          );
          setExistingResult(result);
        }
      } catch (err) {
        console.error("Failed to check existing feedback:", err);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    checkExistingFeedback();
  }, [sessionId, authLoading, user]);

  const handleRequestFeedback = useCallback(async () => {
    try {
      await requestFeedback();
    } catch (err) {
      console.error("Failed to request feedback:", err);
    }
  }, [requestFeedback]);

  // Use existing result or polling result
  const feedbackResult = existingResult || pollingResult;
  const isLoading = authLoading || sessionLoading || isLoadingExisting;

  if (isLoading) {
    return <FeedbackSkeleton />;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">Session not found</p>
        <Link href="/practice">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Practice
          </Button>
        </Link>
      </div>
    );
  }

  // Check if session has a response
  const hasResponse = session.response_text || session.response_audio_url;
  if (!hasResponse) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <Link href={`/practice/${sessionId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Feedback</h1>
            <p className="text-muted-foreground">
              Get personalized feedback on your response
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="No Response Yet"
            description="Submit a response first to get feedback"
            icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
          >
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                You need to submit a response to this interview question before
                you can receive AI feedback.
              </p>
              <Link href={`/practice/${sessionId}`}>
                <Button>
                  <ArrowLeft className="h-4 w-4" />
                  Go Back to Session
                </Button>
              </Link>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center gap-4">
        <Link href={`/practice/${sessionId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">AI Feedback</h1>
          <p className="text-muted-foreground">{session.topic}</p>
        </div>
        {feedbackResult && (
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setExistingResult(null);
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            New Feedback
          </Button>
        )}
      </motion.div>

      {/* Feedback Content */}
      {feedbackResult ? (
        <>
          <motion.div variants={fadeInUp}>
            <FeedbackCard result={feedbackResult} />
          </motion.div>

          {/* Generate Drills CTA */}
          <motion.div variants={fadeInUp}>
            <DashboardCard
              title="Practice More"
              description="Generate personalized drills based on your weaknesses"
              icon={<Sparkles className="h-4 w-4 text-purple-400" />}
              gradient="purple"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Based on your feedback, we can generate targeted practice
                  exercises to help you improve.
                </p>
                <Link
                  href={`/drills?feedbackId=${
                    existingFeedbackId || feedbackId
                  }`}
                >
                  <Button>
                    Generate Drills
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </DashboardCard>
          </motion.div>
        </>
      ) : isRequesting || isPolling ? (
        <motion.div variants={fadeInUp}>
          <FeedbackPolling
            status={status}
            error={requestError}
            onRetry={handleRequestFeedback}
          />
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Request AI Feedback"
            description="Get detailed analysis of your response"
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            gradient="primary"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Our AI will analyze your response and provide:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Overall score based on industry standards
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Key strengths in your response
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Areas for improvement
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Actionable suggestions
                </li>
              </ul>
              {requestError && (
                <p className="text-sm text-destructive">{requestError}</p>
              )}
              <div className="flex justify-end pt-2">
                <Button onClick={handleRequestFeedback} disabled={isRequesting}>
                  <Sparkles className="h-4 w-4" />
                  Generate Feedback
                </Button>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      )}

      {/* Back to Session */}
      <motion.div variants={fadeInUp} className="flex justify-start">
        <Link href={`/practice/${sessionId}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Session
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
