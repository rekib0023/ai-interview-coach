/**
 * Feedback API client for AI feedback on interview sessions.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types - Enums
// ============================================================================

export type FeedbackStatus = "pending" | "processing" | "completed" | "failed";

// ============================================================================
// Types - Request/Response
// ============================================================================

export interface FeedbackRunRequest {
    rubric_id?: number;
}

export interface FeedbackAcceptedResponse {
    id: number;
    status: FeedbackStatus;
    message: string;
    poll_url: string;
}

export interface CriterionScore {
    criterion_name: string;
    score: number;
    feedback?: string;
}

export interface FeedbackRun {
    id: number;
    assessment_id: number;
    rubric_id?: number;
    status: FeedbackStatus;
    model_name?: string;
    model_version?: string;
    prompt_id?: string;
    prompt_template_version?: string;
    overall_score?: number;
    criterion_scores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
    detailed_feedback?: string;
    safety_flags?: Record<string, boolean>;
    content_filtered: boolean;
    refusal_reason?: string;
    latency_ms?: number;
    input_tokens?: number;
    output_tokens?: number;
    total_cost_usd?: number;
    error_message?: string;
    retry_count: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface FeedbackRunSummary {
    id: number;
    assessment_id: number;
    status: FeedbackStatus;
    overall_score?: number;
    created_at: string;
    completed_at?: string;
}

export interface FeedbackRunList {
    feedback_runs: FeedbackRunSummary[];
    total: number;
}

export interface FeedbackResult {
    id: number;
    assessment_id: number;
    status: FeedbackStatus;
    overall_score?: number;
    criterion_scores?: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    detailed_feedback?: string;
    rubric_name?: string;
    rubric_version?: string;
    created_at: string;
    completed_at?: string;
}

export interface FeedbackStatusResponse {
    id: number;
    status: FeedbackStatus;
    progress_message?: string;
    estimated_completion_seconds?: number;
}

// ============================================================================
// API Error
// ============================================================================

class FeedbackApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "FeedbackApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function feedbackRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/feedback${endpoint}`;

    const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FeedbackApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}`
        );
    }

    return response.json();
}

// ============================================================================
// Feedback API
// ============================================================================

export const feedbackApi = {
    /**
     * Request AI feedback for a session.
     * Returns 202 Accepted with poll URL.
     */
    async requestFeedback(
        assessmentId: number,
        rubricId?: number
    ): Promise<FeedbackAcceptedResponse> {
        const url = `${API_BASE_URL}/api/v1/feedback/assessments/${assessmentId}/feedback`;
        const body = rubricId ? JSON.stringify({ rubric_id: rubricId }) : undefined;

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new FeedbackApiError(
                response.status,
                errorData.detail || `HTTP ${response.status}`
            );
        }

        return response.json();
    },

    /**
     * Get feedback run details.
     */
    async getFeedback(feedbackId: number): Promise<FeedbackRun> {
        return feedbackRequest<FeedbackRun>(`/${feedbackId}`);
    },

    /**
     * Poll feedback status (lightweight endpoint for polling).
     */
    async getFeedbackStatus(feedbackId: number): Promise<FeedbackStatusResponse> {
        return feedbackRequest<FeedbackStatusResponse>(`/${feedbackId}/status`);
    },

    /**
     * Get the complete feedback result (only when completed).
     */
    async getFeedbackResult(feedbackId: number): Promise<FeedbackResult> {
        return feedbackRequest<FeedbackResult>(`/${feedbackId}/result`);
    },

    /**
     * List feedback runs for the current user.
     */
    async listFeedbackRuns(
        skip: number = 0,
        limit: number = 20,
        status?: FeedbackStatus
    ): Promise<FeedbackRunList> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (status) {
            params.append("status", status);
        }
        return feedbackRequest<FeedbackRunList>(`?${params.toString()}`);
    },

    /**
     * Retry a failed feedback run.
     */
    async retryFeedback(feedbackId: number): Promise<FeedbackStatusResponse> {
        return feedbackRequest<FeedbackStatusResponse>(`/${feedbackId}/retry`, {
            method: "POST",
        });
    },
};

export { FeedbackApiError };
