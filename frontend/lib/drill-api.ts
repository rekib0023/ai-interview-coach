/**
 * Drill API client for follow-up practice exercises.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types - Enums
// ============================================================================

export type DrillDifficulty = "easy" | "medium" | "hard";
export type DrillStatus = "pending" | "in_progress" | "completed" | "skipped";
export type DrillType =
    | "practice_question"
    | "code_exercise"
    | "concept_review"
    | "mock_scenario";

// ============================================================================
// Types - Request/Response
// ============================================================================

export interface DrillGenerateRequest {
    count?: number;
    difficulty_ramp?: boolean;
}

export interface DrillGenerateAcceptedResponse {
    message: string;
    feedback_run_id: number;
    requested_count: number;
    poll_url: string;
}

export interface DrillSubmitResponse {
    user_response: string;
}

export interface Drill {
    id: number;
    feedback_run_id: number;
    user_id: number;
    title: string;
    prompt: string;
    drill_type: DrillType;
    difficulty: DrillDifficulty;
    target_weakness?: string;
    target_skill?: string;
    status: DrillStatus;
    is_delivered: boolean;
    delivered_at?: string;
    user_response?: string;
    score?: number;
    sequence_order: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface DrillWithHints extends Drill {
    hints?: string;
}

export interface DrillSummary {
    id: number;
    title: string;
    drill_type: DrillType;
    difficulty: DrillDifficulty;
    status: DrillStatus;
    score?: number;
}

export interface DrillList {
    drills: DrillSummary[];
    total: number;
}

export interface DrillGenerationResult {
    drills: Drill[];
    feedback_run_id: number;
    count: number;
}

// ============================================================================
// API Error
// ============================================================================

class DrillApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "DrillApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function drillRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/drills${endpoint}`;

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
        throw new DrillApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}`
        );
    }

    return response.json();
}

// ============================================================================
// Drill API
// ============================================================================

export const drillApi = {
    /**
     * Generate drills from feedback weaknesses.
     * Returns 202 Accepted with poll URL.
     */
    async generateDrills(
        feedbackId: number,
        count: number = 3,
        difficultyRamp: boolean = false
    ): Promise<DrillGenerateAcceptedResponse> {
        return drillRequest<DrillGenerateAcceptedResponse>(
            `/feedback/${feedbackId}/drills`,
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
     * Get all drills generated for a specific feedback run.
     */
    async getDrillsForFeedback(feedbackId: number): Promise<DrillGenerationResult> {
        return drillRequest<DrillGenerationResult>(`/feedback/${feedbackId}`);
    },

    /**
     * Get a paginated list of all user drills.
     */
    async listDrills(
        skip: number = 0,
        limit: number = 20,
        status?: DrillStatus
    ): Promise<DrillList> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (status) {
            params.append("status", status);
        }
        return drillRequest<DrillList>(`?${params.toString()}`);
    },

    /**
     * Get pending drills for the user.
     */
    async getPendingDrills(limit: number = 10): Promise<DrillList> {
        return drillRequest<DrillList>(`/pending?limit=${limit}`);
    },

    /**
     * Get a single drill by ID.
     */
    async getDrill(drillId: number): Promise<Drill> {
        return drillRequest<Drill>(`/${drillId}`);
    },

    /**
     * Get a drill with hints.
     */
    async getDrillWithHints(drillId: number): Promise<DrillWithHints> {
        return drillRequest<DrillWithHints>(`/${drillId}/hints`);
    },

    /**
     * Start a drill (mark as in_progress).
     */
    async startDrill(drillId: number): Promise<Drill> {
        return drillRequest<Drill>(`/${drillId}/start`, {
            method: "POST",
        });
    },

    /**
     * Submit a response to a drill.
     */
    async submitDrillResponse(
        drillId: number,
        userResponse: string
    ): Promise<Drill> {
        return drillRequest<Drill>(`/${drillId}/submit`, {
            method: "POST",
            body: JSON.stringify({ user_response: userResponse }),
        });
    },

    /**
     * Mark a drill as completed with an optional score.
     */
    async completeDrill(drillId: number, score?: number): Promise<Drill> {
        const params = score !== undefined ? `?score=${score}` : "";
        return drillRequest<Drill>(`/${drillId}/complete${params}`, {
            method: "POST",
        });
    },

    /**
     * Skip a drill.
     */
    async skipDrill(drillId: number): Promise<Drill> {
        return drillRequest<Drill>(`/${drillId}/skip`, {
            method: "POST",
        });
    },
};

export { DrillApiError };
