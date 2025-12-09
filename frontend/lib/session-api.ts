/**
 * Session API client for interview sessions.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types - Enums
// ============================================================================

export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type SessionStatus =
    | "created"
    | "in_progress"
    | "awaiting_feedback"
    | "completed"
    | "cancelled";

// ============================================================================
// Types - Request/Response
// ============================================================================

export interface SessionCreate {
    topic: string;
    difficulty?: DifficultyLevel;
    role?: string;
    skill_targets?: string[];
    question?: string;
    question_context?: string;
}

export interface SessionUpdate {
    topic?: string;
    difficulty?: DifficultyLevel;
    status?: SessionStatus;
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

export interface SessionSubmitResponse {
    response_text?: string;
    response_audio_url?: string;
}

export interface InterviewSession {
    id: number;
    user_id: number;
    topic: string;
    difficulty: DifficultyLevel;
    status: SessionStatus;
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

export interface InterviewSessionList {
    sessions: InterviewSession[];
    total: number;
    page: number;
    page_size: number;
}

export interface InterviewSessionSummary {
    id: number;
    topic: string;
    difficulty: DifficultyLevel;
    status: SessionStatus;
    score?: number;
    started_at: string;
    completed_at?: string;
}

// ============================================================================
// API Error
// ============================================================================

class SessionApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "SessionApiError";
    }
}

// ============================================================================
// API Request Helper
// ============================================================================

async function sessionRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1/sessions${endpoint}`;

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
        throw new SessionApiError(
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
// Session API
// ============================================================================

export const sessionApi = {
    /**
     * Create a new interview session.
     */
    async createSession(data: SessionCreate): Promise<InterviewSession> {
        return sessionRequest<InterviewSession>("", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Get a paginated list of sessions.
     */
    async getSessions(
        page: number = 1,
        pageSize: number = 20,
        status?: SessionStatus
    ): Promise<InterviewSessionList> {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });
        if (status) {
            params.append("status", status);
        }
        return sessionRequest<InterviewSessionList>(`?${params.toString()}`);
    },

    /**
     * Get a single session by ID.
     */
    async getSession(sessionId: number): Promise<InterviewSession> {
        return sessionRequest<InterviewSession>(`/${sessionId}`);
    },

    /**
     * Update a session.
     */
    async updateSession(
        sessionId: number,
        data: SessionUpdate
    ): Promise<InterviewSession> {
        return sessionRequest<InterviewSession>(`/${sessionId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Submit a response (text or audio) for an interview session.
     */
    async submitResponse(
        sessionId: number,
        data: SessionSubmitResponse
    ): Promise<InterviewSession> {
        return sessionRequest<InterviewSession>(`/${sessionId}/submit`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Mark a session as completed.
     */
    async completeSession(
        sessionId: number,
        score?: number
    ): Promise<InterviewSession> {
        const params = score !== undefined ? `?score=${score}` : "";
        return sessionRequest<InterviewSession>(`/${sessionId}/complete${params}`, {
            method: "POST",
        });
    },

    /**
     * Delete a session.
     */
    async deleteSession(sessionId: number): Promise<void> {
        return sessionRequest<void>(`/${sessionId}`, {
            method: "DELETE",
        });
    },
};

export { SessionApiError };
