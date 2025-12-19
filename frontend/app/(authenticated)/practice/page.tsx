"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PracticeCard } from "@/components/practice/practice-card";
import { PracticeList } from "@/components/practice/practice-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  usePractices,
  useGeneratePractices,
  usePendingPractices,
} from "@/hooks/use-practice";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PracticeListPage() {
  const searchParams = useSearchParams();
  const feedbackIdParam = searchParams.get("feedbackId");
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: pendingPractices,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = usePendingPractices(10, !authLoading && !!user);

  const {
    data: allPractices,
    isLoading: allLoading,
    refetch: refetchAll,
  } = usePractices(0, 20, undefined, !authLoading && !!user);

  // Handle practice generation if feedbackId is provided
  const feedbackId = feedbackIdParam ? Number(feedbackIdParam) : null;
  const {
    generatePractices,
    practices: generatedPractices,
    isGenerating,
    isPolling,
    error: generateError,
  } = useGeneratePractices(feedbackId || 0);

  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  useEffect(() => {
    if (feedbackId && !hasTriggeredGeneration && !authLoading && user) {
      setHasTriggeredGeneration(true);
      generatePractices(3, true).catch(console.error);
    }
  }, [feedbackId, hasTriggeredGeneration, authLoading, user, generatePractices]);

  useEffect(() => {
    if (generatedPractices) {
      refetchPending();
      refetchAll();
    }
  }, [generatedPractices, refetchPending, refetchAll]);

  if (authLoading) {
    return <PracticesSkeleton />;
  }

  const isGenerationInProgress = isGenerating || isPolling;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Practice Exercises</h1>
          <p className="text-muted-foreground">
            Targeted exercises to improve your weak areas
          </p>
        </div>
      </motion.div>

      {/* Generation Status */}
      {isGenerationInProgress && (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Generating Practices"
            description="Creating personalized practice exercises"
            icon={<Sparkles className="h-4 w-4 text-primary animate-pulse" />}
            gradient="primary"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">
                    {isGenerating
                      ? "Starting generation..."
                      : "Creating practices..."}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments. Your practices will appear below
                  once ready.
                </p>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      )}

      {generateError && (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Generation Failed"
            description="Unable to generate practices"
            icon={<Target className="h-4 w-4 text-destructive" />}
          >
            <p className="text-sm text-destructive mb-4">{generateError}</p>
            <Button
              variant="outline"
              onClick={() => feedbackId && generatePractices(3, true)}
            >
              Try Again
            </Button>
          </DashboardCard>
        </motion.div>
      )}

      {/* Pending Practices */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="Pending Practices"
          description={`${pendingPractices?.total || 0} exercises waiting for you`}
          icon={<Dumbbell className="h-4 w-4 text-yellow-400" />}
          gradient="accent"
        >
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : !pendingPractices?.practices.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">No pending practices</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete an assessment session and get feedback to generate practices
              </p>
              <Link href="/assessment">
                <Button variant="outline">
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingPractices.practices.map((practice) => (
                <PracticeCard key={practice.id} practice={practice} />
              ))}
            </div>
          )}
        </DashboardCard>
      </motion.div>

      {/* All Practices */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="All Practices"
          description={`${allPractices?.total || 0} total exercises`}
          icon={<ListChecks className="h-4 w-4 text-primary" />}
        >
          {allLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : !allPractices?.practices.length ? (
            <p className="text-center text-muted-foreground py-8">
              No practices yet. Practice and get feedback to generate exercises.
            </p>
          ) : (
            <PracticeList practices={allPractices.practices} />
          )}
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
}

function PracticesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}
