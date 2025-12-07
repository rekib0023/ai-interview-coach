"use client";

import { DashboardAiInsight } from "@/components/dashboard/dashboard-ai-insight";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardQuickStats } from "@/components/dashboard/dashboard-quick-stats";
import { DashboardRecentSessionsSection } from "@/components/dashboard/dashboard-recent-sessions";
import { DashboardSkillsSection } from "@/components/dashboard/dashboard-skills";
import { DashboardWeeklyGoals } from "@/components/dashboard/dashboard-weekly-goals";
import { staggerContainer } from "@/components/dashboard/shared-animation-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  transformGoals,
  transformSessions,
  transformSkills,
  useDashboardData,
  useGreeting,
} from "@/hooks/use-dashboard";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const greeting = useGreeting();
  const { data, isLoading, error, refetch } = useDashboardData(!authLoading && !!user);

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={refetch} className="text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  // Transform data using helpers
  const recentInterviews = transformSessions(data.sessions);
  const { areasToImprove, strengths } = transformSkills(data.skills);
  const weeklyGoals = transformGoals(data.goals);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <DashboardHeader greeting={greeting} firstName={firstName} />
      <DashboardQuickStats />
      <DashboardAiInsight />
      <DashboardRecentSessionsSection interviews={recentInterviews} />
      <DashboardSkillsSection areasToImprove={areasToImprove} strengths={strengths} />
      <DashboardWeeklyGoals goals={weeklyGoals} />
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-20 rounded-lg" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
