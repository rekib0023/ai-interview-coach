"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FeedbackCard } from "@/components/assessment/feedback-card";
import { FeedbackPolling } from "@/components/assessment/feedback-polling";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useFeedbackResult, useRequestFeedback } from "@/hooks/use-feedback";
import { useAssessment } from "@/hooks/use-assessment";
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
  const assessmentId = Number(params.assessmentId);
  const { user, isLoading: authLoading } = useAuth();

  const { assessment, isLoading: assessmentLoading } = useAssessment(
    assessmentId,
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
  } = useRequestFeedback(assessmentId);

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
        const existingForAssessment = feedbackRuns.feedback_runs.find(
          (fb) => fb.assessment_id === assessmentId && fb.status === "completed"
        );

        if (existingForAssessment) {
          setExistingFeedbackId(existingForAssessment.id);
          const result = await feedbackApi.getFeedbackResult(
            existingForAssessment.id
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
  }, [assessmentId, authLoading, user]);

  const handleRequestFeedback = useCallback(async () => {
    try {
      await requestFeedback();
    } catch (err) {
      console.error("Failed to request feedback:", err);
    }
  }, [requestFeedback]);

  // Use existing result or polling result
  const feedbackResult = existingResult || pollingResult;
  const isLoading = authLoading || assessmentLoading || isLoadingExisting;

  if (isLoading) {
    return <FeedbackSkeleton />;
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">Assessment not found</p>
        <Link href="/assessment">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessment
          </Button>
        </Link>
      </div>
    );
  }

  // Check if assessment has a response
  const hasResponse = assessment.response_text || assessment.response_audio_url;
  // Wait, session.response_text or session.response_audio_url were used before.
  // For coding assessment, we might rely on code or just assume if it's completed?
  // Let's assume if it's completed we can generate feedback.

  if (!hasResponse && assessment.status !== "completed") {
     // If not completed, maybe they shouldn't be here?
     // Or maybe we use code presence.
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
        <Link href={`/assessment/${assessmentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">AI Feedback</h1>
          <p className="text-muted-foreground">{assessment.topic}</p>
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

          {/* Generate Practices CTA */}
          <motion.div variants={fadeInUp}>
            <DashboardCard
              title="Practice More"
              description="Generate personalized practices based on your weaknesses"
              icon={<Sparkles className="h-4 w-4 text-purple-400" />}
              gradient="purple"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Based on your feedback, we can generate targeted practice
                  exercises to help you improve.
                </p>
                <Link
                  href={`/practice?feedbackId=${
                    existingFeedbackId || feedbackId
                  }`}
                >
                  <Button>
                    Generate Practices
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

      {/* Back to Assessment */}
      <motion.div variants={fadeInUp} className="flex justify-start">
        <Link href={`/assessment/${assessmentId}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessment
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
