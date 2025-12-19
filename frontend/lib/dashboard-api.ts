/**
 * Dashboard API client for fetching dashboard data from the backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types
// ============================================================================

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Trend = "up" | "down" | "neutral";
export type Priority = "high" | "medium" | "low";

export interface StatItem {
    title: string;
    value: string;
    subtitle?: string;
    change?: string;
    trend?: Trend;
    icon_type: "trophy" | "check" | "flame" | "clock";
}

export interface QuickStatsResponse {
    stats: StatItem[];
}

export interface Assessment {
    id: number;
    topic: string;
    date: string;
    difficulty: Difficulty;
    score: number;
    duration: string;
    trend: Trend;
}

export interface RecentSessionsResponse {
    sessions: Assessment[];
    total_count: number;
}

export interface SkillMetric {
    name: string;
    progress: number;
    trend?: number;
}

export interface SkillsResponse {
    areas_to_improve: SkillMetric[];
    strengths: SkillMetric[];
}

export interface WeeklyGoal {
    id: number;
    label: string;
    current: number;
    total: number;
    priority: Priority;
}

export interface GoalsResponse {
    goals: WeeklyGoal[];
    completed_count: number;
    total_count: number;
}

export interface AiInsightResponse {
    message: string;
    highlight_topic: string;
    suggested_topic: string;
    action_label: string;
}

// ============================================================================
// API Error
// ============================================================================

class DashboardApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "DashboardApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function dashboardRequest<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/dashboard${endpoint}`;

    const response = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new DashboardApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}`
        );
    }

    return response.json();
}

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
    /**
     * Get quick stats for the dashboard.
     */
    async getStats(): Promise<QuickStatsResponse> {
        return dashboardRequest<QuickStatsResponse>("/stats");
    },

    /**
     * Get recent assessments.
     */
    async getRecentAssessments(limit = 5): Promise<RecentSessionsResponse> {
        return dashboardRequest<RecentSessionsResponse>(
            `/recent-sessions?limit=${limit}`
        );
    },

    /**
     * Get skills progress (areas to improve + strengths).
     */
    async getSkills(): Promise<SkillsResponse> {
        return dashboardRequest<SkillsResponse>("/skills");
    },

    /**
     * Get weekly goals.
     */
    async getGoals(): Promise<GoalsResponse> {
        return dashboardRequest<GoalsResponse>("/goals");
    },

    /**
     * Get AI-generated insight.
     */
    async getAiInsight(): Promise<AiInsightResponse> {
        return dashboardRequest<AiInsightResponse>("/ai-insight");
    },
};

export { DashboardApiError };
