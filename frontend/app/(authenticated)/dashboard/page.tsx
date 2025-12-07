"use client";

import { DashboardAiInsight } from "@/components/dashboard/dashboard-ai-insight";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardQuickStats } from "@/components/dashboard/dashboard-quick-stats";
import { DashboardRecentSessionsSection } from "@/components/dashboard/dashboard-recent-sessions";
import { DashboardSkillsSection } from "@/components/dashboard/dashboard-skills";
import { DashboardWeeklyGoals } from "@/components/dashboard/dashboard-weekly-goals";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { motion, Variants } from "framer-motion";
import { useMemo } from "react";

// Mock data - replace with API calls
const recentInterviews = [
  {
    id: 1,
    topic: "React Hooks & State Management",
    date: "Today, 10:23 AM",
    difficulty: "Medium" as const,
    score: 85,
    duration: "45 min",
    trend: "up" as const,
  },
  {
    id: 2,
    topic: "Binary Search Trees",
    date: "Yesterday, 3:15 PM",
    difficulty: "Hard" as const,
    score: 72,
    duration: "52 min",
    trend: "down" as const,
  },
  {
    id: 3,
    topic: "System Design - URL Shortener",
    date: "2 days ago",
    difficulty: "Medium" as const,
    score: 88,
    duration: "38 min",
    trend: "up" as const,
  },
];

const areasToImprove = [
  { name: "Dynamic Programming", progress: 65, trend: 5 },
  { name: "System Design", progress: 70, trend: 8 },
  { name: "Graph Algorithms", progress: 72, trend: -2 },
];

const strengths = [
  { name: "Array & Strings", progress: 92, trend: 3 },
  { name: "Trees & Graphs", progress: 88, trend: 5 },
  { name: "Problem Solving", progress: 85, trend: 2 },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "Rekib";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <DashboardHeader greeting={greeting} firstName={firstName} />
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <DashboardQuickStats />
      </motion.div>

      {/* AI Insights Card */}
      <motion.div variants={itemVariants}>
        <DashboardAiInsight />
      </motion.div>

      {/* Recent Sessions */}
      <motion.div variants={itemVariants}>
        <DashboardRecentSessionsSection interviews={recentInterviews} />
      </motion.div>

      {/* Skills Progress Grid */}
      <motion.div variants={itemVariants}>
        <DashboardSkillsSection
          areasToImprove={areasToImprove}
          strengths={strengths}
        />
      </motion.div>

      {/* Weekly Goals */}
      <motion.div variants={itemVariants}>
        <DashboardWeeklyGoals
          goals={[
            {
              label: "Complete 5 coding interviews",
              current: 3,
              total: 5,
            },
            {
              label: "Practice system design",
              current: 2,
              total: 3,
            },
            {
              label: "Maintain 7-day streak",
              current: 5,
              total: 7,
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
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

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* AI Insight Skeleton */}
      <Skeleton className="h-20 rounded-lg" />

      {/* Recent Sessions Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>

      {/* Skills Progress Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Goals Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
