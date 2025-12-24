/**
 * Assessment API client for assessment sessions.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types - Enums
// ============================================================================

export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type AssessmentStatus =
    | "created"
    | "in_progress"
    | "awaiting_feedback"
    | "completed"
    | "cancelled";

// ============================================================================
// Types - Request/Response
// ============================================================================

export interface AssessmentCreate {
    topic: string;
    difficulty?: DifficultyLevel;
    role?: string;
    skill_targets?: string[];
    question?: string;
    question_context?: string;
}

export interface AssessmentUpdate {
    topic?: string;
    difficulty?: DifficultyLevel;
    status?: AssessmentStatus;
    role?: string;
    skill_targets?: string[];
    question?: string;
    question_context?: string;
    response_audio_url?: string;
    response_text?: string;
    transcript?: string;
    transcript_status?: string;
    score?: number;
    duration_minutes?: number;
    session_metadata?: Record<string, unknown>;
}

export interface AssessmentSubmitResponse {
    response_text?: string;
    response_audio_url?: string;
}

export interface Assessment {
    id: number;
    user_id: number;
    topic: string;
    difficulty: DifficultyLevel;
    status: AssessmentStatus;
    role?: string;
    skill_targets?: string[];
    question?: string;
    question_context?: string;
    score?: number;
    duration_minutes?: number;
    response_audio_url?: string;
    response_text?: string;
    transcript?: string;
    transcript_status?: string;
    session_metadata?: Record<string, unknown>;
    started_at: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface AssessmentList {
    assessments: Assessment[];
    total: number;
    page: number;
    page_size: number;
}

export interface AssessmentSummary {
    id: number;
    topic: string;
    difficulty: DifficultyLevel;
    status: AssessmentStatus;
    score?: number;
    started_at: string;
    completed_at?: string;
}

// ============================================================================
// API Error
// ============================================================================

class AssessmentApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "AssessmentApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function assessmentRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/assessments${endpoint}`;

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
        throw new AssessmentApiError(
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
// Assessment API
// ============================================================================

export const assessmentApi = {
    /**
     * Create a new assessment session.
     */
    async createAssessment(data: AssessmentCreate): Promise<Assessment> {
        return assessmentRequest<Assessment>("", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Get a paginated list of assessments.
     */
    async getAssessments(
        page: number = 1,
        pageSize: number = 20,
        status?: AssessmentStatus
    ): Promise<AssessmentList> {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });
        if (status) {
            params.append("status", status);
        }
        return assessmentRequest<AssessmentList>(`?${params.toString()}`);
    },

    /**
     * Get a single assessment by ID.
     */
    async getAssessment(assessmentId: number): Promise<Assessment> {
        return assessmentRequest<Assessment>(`/${assessmentId}`);
    },

    /**
     * Update an assessment.
     */
    async updateAssessment(
        assessmentId: number,
        data: AssessmentUpdate
    ): Promise<Assessment> {
        return assessmentRequest<Assessment>(`/${assessmentId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Submit a response (text or audio) for an assessment session.
     */
    async submitResponse(
        assessmentId: number,
        data: AssessmentSubmitResponse
    ): Promise<Assessment> {
        return assessmentRequest<Assessment>(`/${assessmentId}/submit`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Mark an assessment as completed.
     */
    async completeAssessment(
        assessmentId: number,
        score?: number
    ): Promise<Assessment> {
        const params = score !== undefined ? `?score=${score}` : "";
        return assessmentRequest<Assessment>(`/${assessmentId}/complete${params}`, {
            method: "POST",
        });
    },

    /**
     * Delete an assessment.
     */
    async deleteAssessment(assessmentId: number): Promise<void> {
        return assessmentRequest<void>(`/${assessmentId}`, {
            method: "DELETE",
        });
    },
};

export { AssessmentApiError };
