"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SessionForm } from "@/components/practice/session-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useSessions } from "@/hooks/use-session";
import { type DifficultyLevel, type SessionStatus } from "@/lib/session-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  ListChecks,
  Plus,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

function getDifficultyColor(difficulty: DifficultyLevel) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Hard":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: SessionStatus) {
  switch (status) {
    case "created":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "in_progress":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "awaiting_feedback":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "cancelled":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PracticePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const {
    data: sessionsData,
    isLoading,
    refetch,
  } = useSessions(1, 10, undefined, !authLoading && !!user);

  if (authLoading) {
    return <PracticeSkeleton />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Practice Sessions
          </h1>
          <p className="text-muted-foreground">
            Start a new interview practice or continue a previous session
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </motion.div>

      {/* New Session Form */}
      {showForm && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <DashboardCard
            title="Start New Practice"
            description="Configure your practice session"
            icon={<Target className="h-4 w-4 text-primary" />}
            gradient="primary"
          >
            <SessionForm
              onSuccess={() => {
                setShowForm(false);
                refetch();
              }}
              onCancel={() => setShowForm(false)}
            />
          </DashboardCard>
        </motion.div>
      )}

      {/* Sessions List */}
      <motion.div variants={fadeInUp}>
        <DashboardCard
          title="Your Sessions"
          description={`${sessionsData?.total || 0} total sessions`}
          icon={<ListChecks className="h-4 w-4 text-primary" />}
          action={
            <Link
              href="/practice?page=1"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : sessionsData?.sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted/50 p-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">No sessions yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start your first practice session to begin improving
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Start Practice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsData?.sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/practice/${session.id}`}
                  className="block"
                >
                  <div
                    className={cn(
                      "group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4",
                      "transition-all duration-200",
                      "hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium truncate">
                          {session.topic}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getDifficultyColor(session.difficulty)
                          )}
                        >
                          {session.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getStatusColor(session.status)
                          )}
                        >
                          {session.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(session.created_at)}
                        </span>
                        {session.role && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" />
                            {session.role}
                          </span>
                        )}
                        {session.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.score !== null &&
                        session.score !== undefined && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {session.score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Score
                            </div>
                          </div>
                        )}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
}

function PracticeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
