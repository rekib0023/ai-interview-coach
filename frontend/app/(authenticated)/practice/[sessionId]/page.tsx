"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ResponseInput } from "@/components/practice/response-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useSession, useSubmitResponse } from "@/hooks/use-session";
import { type DifficultyLevel, type SessionStatus } from "@/lib/session-api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    MessageSquare,
    Target,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function SessionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = Number(params.sessionId);
    const { user, isLoading: authLoading } = useAuth();
    const { session, isLoading, error, refetch } = useSession(
        sessionId,
        !authLoading && !!user
    );
    const { submitResponse, isLoading: isSubmitting } = useSubmitResponse(sessionId);
    const [responseText, setResponseText] = useState("");

    const handleSubmit = async () => {
        if (!responseText.trim()) return;

        try {
            await submitResponse({ response_text: responseText });
            refetch();
        } catch (err) {
            console.error("Failed to submit response:", err);
        }
    };

    if (authLoading || isLoading) {
        return <SessionDetailSkeleton />;
    }

    if (error || !session) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive mb-4">{error || "Session not found"}</p>
                <Link href="/practice">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Practice
                    </Button>
                </Link>
            </div>
        );
    }

    const hasResponse = session.response_text || session.response_audio_url;
    const canSubmitResponse = ["created", "in_progress"].includes(session.status);
    const canRequestFeedback = hasResponse && session.status !== "completed";

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <Link href="/practice">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {session.topic}
                        </h1>
                        <Badge
                            variant="outline"
                            className={cn("text-xs", getDifficultyColor(session.difficulty))}
                        >
                            {session.difficulty}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn("text-xs", getStatusColor(session.status))}
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
                {session.score !== null && session.score !== undefined && (
                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{session.score}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                )}
            </motion.div>

            {/* Question Card */}
            <motion.div variants={fadeInUp}>
                <DashboardCard
                    title="Interview Question"
                    description="Practice responding to this question"
                    icon={<MessageSquare className="h-4 w-4 text-primary" />}
                    gradient="primary"
                >
                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg leading-relaxed">
                            {session.question || "No question provided for this session."}
                        </p>
                        {session.question_context && (
                            <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm text-muted-foreground mb-2 font-medium">
                                    Context:
                                </p>
                                <p className="text-sm">{session.question_context}</p>
                            </div>
                        )}
                    </div>
                </DashboardCard>
            </motion.div>

            {/* Skills Target */}
            {session.skill_targets && session.skill_targets.length > 0 && (
                <motion.div variants={fadeInUp}>
                    <DashboardCard
                        title="Target Skills"
                        description="Focus areas for this session"
                        icon={<Target className="h-4 w-4 text-primary" />}
                    >
                        <div className="flex flex-wrap gap-2">
                            {session.skill_targets.map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-primary/10 border-primary/30"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </DashboardCard>
                </motion.div>
            )}

            {/* Response Section */}
            <motion.div variants={fadeInUp}>
                <DashboardCard
                    title="Your Response"
                    description={hasResponse ? "Your submitted answer" : "Enter your response below"}
                    icon={<CheckCircle className="h-4 w-4 text-primary" />}
                    gradient="accent"
                >
                    {hasResponse ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="whitespace-pre-wrap">{session.response_text}</p>
                            </div>
                            {canRequestFeedback && (
                                <div className="flex justify-end">
                                    <Link href={`/practice/${sessionId}/feedback`}>
                                        <Button>
                                            Get AI Feedback
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : canSubmitResponse ? (
                        <ResponseInput
                            value={responseText}
                            onChange={setResponseText}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            placeholder="Type your response here. Be thorough and specific in your answer..."
                        />
                    ) : (
                        <p className="text-muted-foreground">
                            This session is no longer accepting responses.
                        </p>
                    )}
                </DashboardCard>
            </motion.div>

            {/* Actions */}
            {hasResponse && (
                <motion.div variants={fadeInUp} className="flex justify-end gap-3">
                    <Link href="/practice">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sessions
                        </Button>
                    </Link>
                    <Link href={`/practice/${sessionId}/feedback`}>
                        <Button>
                            View Feedback
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            )}
        </motion.div>
    );
}

function SessionDetailSkeleton() {
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
