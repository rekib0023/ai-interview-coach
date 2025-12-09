"use client";

import {
    sessionApi,
    type InterviewSession,
    type InterviewSessionList,
    type SessionCreate,
    type SessionStatus,
    type SessionSubmitResponse,
} from "@/lib/session-api";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// useSessions - Paginated list of sessions
// ============================================================================

interface UseSessionsReturn {
    data: InterviewSessionList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useSessions(
    page: number = 1,
    pageSize: number = 20,
    status?: SessionStatus,
    enabled: boolean = true
): UseSessionsReturn {
    const [data, setData] = useState<InterviewSessionList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await sessionApi.getSessions(page, pageSize, status);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
            setError("Failed to load sessions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, status]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useSession - Single session
// ============================================================================

interface UseSessionReturn {
    session: InterviewSession | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useSession(
    sessionId: number | null,
    enabled: boolean = true
): UseSessionReturn {
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (sessionId === null) {
            setSession(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await sessionApi.getSession(sessionId);
            setSession(result);
        } catch (err) {
            console.error("Failed to fetch session:", err);
            setError("Failed to load session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { session, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useCreateSession - Create new session mutation
// ============================================================================

interface UseCreateSessionReturn {
    createSession: (data: SessionCreate) => Promise<InterviewSession>;
    isLoading: boolean;
    error: string | null;
}

export function useCreateSession(): UseCreateSessionReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSession = useCallback(async (data: SessionCreate) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await sessionApi.createSession(data);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create session";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createSession, isLoading, error };
}

// ============================================================================
// useSubmitResponse - Submit response mutation
// ============================================================================

interface UseSubmitResponseReturn {
    submitResponse: (data: SessionSubmitResponse) => Promise<InterviewSession>;
    isLoading: boolean;
    error: string | null;
}

export function useSubmitResponse(sessionId: number): UseSubmitResponseReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitResponse = useCallback(
        async (data: SessionSubmitResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await sessionApi.submitResponse(sessionId, data);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to submit response";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [sessionId]
    );

    return { submitResponse, isLoading, error };
}

// ============================================================================
// useCompleteSession - Complete session mutation
// ============================================================================

interface UseCompleteSessionReturn {
    completeSession: (score?: number) => Promise<InterviewSession>;
    isLoading: boolean;
    error: string | null;
}

export function useCompleteSession(sessionId: number): UseCompleteSessionReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completeSession = useCallback(
        async (score?: number) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await sessionApi.completeSession(sessionId, score);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to complete session";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [sessionId]
    );

    return { completeSession, isLoading, error };
}

// ============================================================================
// useDeleteSession - Delete session mutation
// ============================================================================

interface UseDeleteSessionReturn {
    deleteSession: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export function useDeleteSession(sessionId: number): UseDeleteSessionReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSession = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await sessionApi.deleteSession(sessionId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete session";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    return { deleteSession, isLoading, error };
}
