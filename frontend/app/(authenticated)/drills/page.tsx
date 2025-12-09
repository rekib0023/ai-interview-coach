"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DrillCard } from "@/components/drills/drill-card";
import { DrillList } from "@/components/drills/drill-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  useDrills,
  useGenerateDrills,
  usePendingDrills,
} from "@/hooks/use-drills";
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

export default function DrillsPage() {
  const searchParams = useSearchParams();
  const feedbackIdParam = searchParams.get("feedbackId");
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: pendingDrills,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = usePendingDrills(10, !authLoading && !!user);

  const {
    data: allDrills,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useDrills(0, 20, undefined, !authLoading && !!user);

  // Handle drill generation if feedbackId is provided
  const feedbackId = feedbackIdParam ? Number(feedbackIdParam) : null;
  const {
    generateDrills,
    drills: generatedDrills,
    isGenerating,
    isPolling,
    error: generateError,
  } = useGenerateDrills(feedbackId || 0);

  const [hasTriggeredGeneration, setHasTriggeredGeneration] = useState(false);

  useEffect(() => {
    if (feedbackId && !hasTriggeredGeneration && !authLoading && user) {
      setHasTriggeredGeneration(true);
      generateDrills(3, true).catch(console.error);
    }
  }, [feedbackId, hasTriggeredGeneration, authLoading, user, generateDrills]);

  useEffect(() => {
    if (generatedDrills) {
      refetchPending();
      refetchAll();
    }
  }, [generatedDrills, refetchPending, refetchAll]);

  if (authLoading) {
    return <DrillsSkeleton />;
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
          <h1 className="text-2xl font-bold tracking-tight">Practice Drills</h1>
          <p className="text-muted-foreground">
            Targeted exercises to improve your weak areas
          </p>
        </div>
      </motion.div>

      {/* Generation Status */}
      {isGenerationInProgress && (
        <motion.div variants={fadeInUp}>
          <DashboardCard
            title="Generating Drills"
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
                      : "Creating drills..."}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments. Your drills will appear below
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
            description="Unable to generate drills"
            icon={<Target className="h-4 w-4 text-destructive" />}
          >
            <p className="text-sm text-destructive mb-4">{generateError}</p>
            <Button
              variant="outline"
              onClick={() => feedbackId && generateDrills(3, true)}
            >
              Try Again
            </Button>
          </DashboardCard>
        </motion.div>
      )}

      {/* Pending Drills */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="Pending Drills"
          description={`${pendingDrills?.total || 0} drills waiting for you`}
          icon={<Dumbbell className="h-4 w-4 text-yellow-400" />}
          gradient="accent"
        >
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : !pendingDrills?.drills.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">No pending drills</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete a practice session and get feedback to generate drills
              </p>
              <Link href="/practice">
                <Button variant="outline">
                  Start Practice
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingDrills.drills.map((drill) => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
            </div>
          )}
        </DashboardCard>
      </motion.div>

      {/* All Drills */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="All Drills"
          description={`${allDrills?.total || 0} total drills`}
          icon={<ListChecks className="h-4 w-4 text-primary" />}
        >
          {allLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : !allDrills?.drills.length ? (
            <p className="text-center text-muted-foreground py-8">
              No drills yet. Practice and get feedback to generate drills.
            </p>
          ) : (
            <DrillList drills={allDrills.drills} />
          )}
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
}

function DrillsSkeleton() {
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
