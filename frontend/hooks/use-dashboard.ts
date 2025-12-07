"use client";

import {
    dashboardApi,
    type GoalsResponse,
    type RecentSessionsResponse,
    type SkillsResponse,
} from "@/lib/dashboard-api";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
    sessions: RecentSessionsResponse | null;
    skills: SkillsResponse | null;
    goals: GoalsResponse | null;
}

interface UseDashboardDataReturn {
    data: DashboardData;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// ============================================================================
// useDashboardData Hook
// ============================================================================

/**
 * Custom hook for fetching all dashboard data.
 * Fetches sessions, skills, and goals in parallel.
 */
export function useDashboardData(enabled: boolean = true): UseDashboardDataReturn {
    const [data, setData] = useState<DashboardData>({
        sessions: null,
        skills: null,
        goals: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [sessions, skills, goals] = await Promise.all([
                dashboardApi.getRecentSessions(),
                dashboardApi.getSkills(),
                dashboardApi.getGoals(),
            ]);

            setData({ sessions, skills, goals });
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useGreeting Hook
// ============================================================================

/**
 * Returns a time-based greeting message.
 */
export function useGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

// ============================================================================
// Transform Helpers
// ============================================================================

/**
 * Transforms API session data to component props format.
 */
export function transformSessions(sessions: RecentSessionsResponse | null) {
    return sessions?.sessions.map((s) => ({
        id: s.id,
        topic: s.topic,
        date: s.date,
        difficulty: s.difficulty,
        score: s.score,
        duration: s.duration,
        trend: s.trend === "neutral" ? ("same" as const) : s.trend,
    })) || [];
}

/**
 * Transforms API skills data to component props format.
 */
export function transformSkills(skills: SkillsResponse | null) {
    return {
        areasToImprove: skills?.areas_to_improve.map((s) => ({
            name: s.name,
            progress: s.progress,
            trend: s.trend,
        })) || [],
        strengths: skills?.strengths.map((s) => ({
            name: s.name,
            progress: s.progress,
            trend: s.trend,
        })) || [],
    };
}

/**
 * Transforms API goals data to component props format.
 */
export function transformGoals(goals: GoalsResponse | null) {
    return goals?.goals.map((g) => ({
        label: g.label,
        current: g.current,
        total: g.total,
        priority: g.priority,
    })) || [];
}
