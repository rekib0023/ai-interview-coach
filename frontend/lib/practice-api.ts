/**
 * Practice API client for follow-up practice exercises.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types - Enums
// ============================================================================

export type PracticeDifficulty = "easy" | "medium" | "hard";
export type PracticeStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PracticeType =
    | "practice_question"
    | "code_exercise"
    | "concept_review"
    | "mock_scenario";

// ============================================================================
// Types - Request/Response
// ============================================================================

export interface PracticeGenerateRequest {
    count?: number;
    difficulty_ramp?: boolean;
}

export interface PracticeGenerateAcceptedResponse {
    message: string;
    feedback_run_id: number;
    requested_count: number;
    poll_url: string;
}

export interface PracticeSubmitResponse {
    user_response: string;
}

export interface Practice {
    id: number;
    feedback_run_id: number;
    user_id: number;
    title: string;
    prompt: string;
    practice_type: PracticeType;
    difficulty: PracticeDifficulty;
    target_weakness?: string;
    target_skill?: string;
    status: PracticeStatus;
    is_delivered: boolean;
    delivered_at?: string;
    user_response?: string;
    score?: number;
    sequence_order: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface PracticeWithHints extends Practice {
    hints?: string;
}

export interface PracticeSummary {
    id: number;
    title: string;
    practice_type: PracticeType;
    difficulty: PracticeDifficulty;
    status: PracticeStatus;
    score?: number;
}

export interface PracticeList {
    practices: PracticeSummary[];
    total: number;
}

export interface PracticeGenerationResult {
    practices: Practice[];
    feedback_run_id: number;
    count: number;
}

// ============================================================================
// API Error
// ============================================================================

class PracticeApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "PracticeApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function practiceRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/practices${endpoint}`;

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
        throw new PracticeApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}`
        );
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// ============================================================================
// Practice API
// ============================================================================

export const practiceApi = {
    /**
     * Generate practices from feedback weaknesses.
     * Returns 202 Accepted with poll URL.
     */
    async generatePractices(
        feedbackId: number,
        count: number = 3,
        difficultyRamp: boolean = false
    ): Promise<PracticeGenerateAcceptedResponse> {
        return practiceRequest<PracticeGenerateAcceptedResponse>(
            `/feedback/${feedbackId}/practices`,
            {
                method: "POST",
                body: JSON.stringify({
                    count,
                    difficulty_ramp: difficultyRamp,
                }),
            }
        );
    },

    /**
     * Get all practices generated for a specific feedback run.
     */
    async getPracticesForFeedback(feedbackId: number): Promise<PracticeGenerationResult> {
        return practiceRequest<PracticeGenerationResult>(`/feedback/${feedbackId}`);
    },

    /**
     * Get a paginated list of all user practices.
     */
    async listPractices(
        skip: number = 0,
        limit: number = 20,
        status?: PracticeStatus
    ): Promise<PracticeList> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (status) {
            params.append("status", status);
        }
        return practiceRequest<PracticeList>(`?${params.toString()}`);
    },

    /**
     * Get pending practices for the user.
     */
    async getPendingPractices(limit: number = 10): Promise<PracticeList> {
        return practiceRequest<PracticeList>(`/pending?limit=${limit}`);
    },

    /**
     * Get a single practice by ID.
     */
    async getPractice(practiceId: number): Promise<Practice> {
        return practiceRequest<Practice>(`/${practiceId}`);
    },

    /**
     * Get a practice with hints.
     */
    async getPracticeWithHints(practiceId: number): Promise<PracticeWithHints> {
        return practiceRequest<PracticeWithHints>(`/${practiceId}/hints`);
    },

    /**
     * Start a practice (mark as in_progress).
     */
    async startPractice(practiceId: number): Promise<Practice> {
        return practiceRequest<Practice>(`/${practiceId}/start`, {
            method: "POST",
        });
    },

    /**
     * Submit a response to a practice.
     */
    async submitPracticeResponse(
        practiceId: number,
        userResponse: string
    ): Promise<Practice> {
        return practiceRequest<Practice>(`/${practiceId}/submit`, {
            method: "POST",
            body: JSON.stringify({ user_response: userResponse }),
        });
    },

    /**
     * Mark a practice as completed with an optional score.
     */
    async completePractice(practiceId: number, score?: number): Promise<Practice> {
        const params = score !== undefined ? `?score=${score}` : "";
        return practiceRequest<Practice>(`/${practiceId}/complete${params}`, {
            method: "POST",
        });
    },

    /**
     * Skip a practice.
     */
    async skipPractice(practiceId: number): Promise<Practice> {
        return practiceRequest<Practice>(`/${practiceId}/skip`, {
            method: "POST",
        });
    },
};

export { PracticeApiError };
