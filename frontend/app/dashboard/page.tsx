"use client";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSessionsTable } from "@/components/dashboard/recent-sessions-table";
import { SkillProgressCard } from "@/components/dashboard/skill-progress-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Code2,
  CircleCheck,
  Flame,
  Play,
  Trophy,
  TrendingUp,
} from "lucide-react";

// Mock data for demo
const recentInterviews = [
  {
    id: 1,
    topic: "React Hooks",
    date: "Today, 10:23 AM",
    difficulty: "Medium",
    score: 85,
  },
  {
    id: 2,
    topic: "Algorithms",
    date: "Yesterday",
    difficulty: "Hard",
    score: 72,
  },
  {
    id: 3,
    topic: "System Design",
    date: "2 days ago",
    difficulty: "Medium",
    score: 88,
  },
];

const areasToImprove = [
  { name: "Dynamic Programming", progress: 65 },
  { name: "System Design", progress: 70 },
  { name: "Graph Algorithms", progress: 72 },
];

const strengths = [
  { name: "Array & Strings", progress: 92 },
  { name: "Trees & Graphs", progress: 88 },
  { name: "Problem Solving", progress: 85 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                  Good morning, {firstName}!
                </h1>
                <p className="text-slate-500 mt-1">
                  Ready to tackle some problems today?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4" />
                  Start New Interview
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <StatsCard
                title="Overall Score"
                value="78%"
                change="+5%"
                changeColor="text-green-600"
                icon={Trophy}
                iconColor="text-amber-600"
              />
              <StatsCard
                title="Problems Solved"
                value={42}
                subtitle="Top 15% of users"
                icon={CircleCheck}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Streak"
                value="5 Days"
                subtitle="Keep it up!"
                icon={Flame}
                iconColor="text-orange-600"
              />
              <StatsCard
                title="Weak Area"
                value="Dynamic Programming"
                subtitle="Practice now"
                icon={AlertTriangle}
                iconColor="text-red-600"
              />
            </motion.div>

            {/* Recent Sessions */}
            <motion.div variants={itemVariants}>
              <RecentSessionsTable interviews={recentInterviews} />
            </motion.div>

            {/* Skills Progress */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <SkillProgressCard
                title="Areas to Improve"
                skills={areasToImprove}
                icon={AlertTriangle}
                iconColor="text-amber-500"
              />
              <SkillProgressCard
                title="Strengths"
                skills={strengths}
                icon={BarChart3}
                iconColor="text-green-500"
                progressColor="bg-green-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-stone-200">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 lg:pl-64">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>

          <Skeleton className="h-64 w-full mb-8 rounded-lg" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
