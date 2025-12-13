"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useSession } from "@/hooks/use-session";
import { type DifficultyLevel, type SessionStatus } from "@/lib/session-api";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Clock,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChatInput } from "@/components/practice/chat-input";
import { ChatMessage, type Message } from "@/components/practice/chat-message";

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
    const sessionId = Number(params.sessionId);
    const { user, isLoading: authLoading } = useAuth();
    const { session, isLoading, error } = useSession(
        sessionId,
        !authLoading && !!user
    );

    // We'll use this to store the chat history.
    // In a real app, this would be loaded from the backend.
    const [messages, setMessages] = useState<Message[]>([]);

    // Initialize chat with the question when session loads
    useEffect(() => {
        if (session?.question && messages.length === 0) {
            setMessages([
                {
                    id: "initial-question",
                    role: "ai",
                    content: session.question,
                    timestamp: new Date(session.created_at),
                },
            ]);
        }
    }, [session, messages.length]);

    const handleSendMessage = async (text: string) => {
        // Add user message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);

        // Simulate AI "thinking" and response (mock for now)
        // In reality, this would be a websocket or API call
        setTimeout(() => {
             // You can add a specific mock response if you want,
             // but strictly speaking the user said "no implementation require as of now, just the UI"
             // so we can just leave it as user sending a message.
        }, 1000);
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

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 bg-background">
             {/* Header Section */}
            <header className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3 flex items-center gap-4">
                <Link href="/practice">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-semibold truncate">
                            {session.topic}
                        </h1>
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] h-5 px-2", getDifficultyColor(session.difficulty))}
                        >
                            {session.difficulty}
                        </Badge>
                    </div>
                     <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {session.role && <span>{session.role}</span>}
                        {session.duration_minutes && (
                            <>
                             <span>•</span>
                             <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.duration_minutes}m
                             </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="hidden sm:flex">
                        End Session
                    </Button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-3xl mx-auto w-full pb-4">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p>Starting interview session...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none">
                <ChatInput onSend={handleSendMessage} disabled={session.status === 'completed'} />
            </div>
        </div>
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
