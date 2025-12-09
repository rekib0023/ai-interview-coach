"use client";

import {
    feedbackApi,
    type FeedbackAcceptedResponse,
    type FeedbackResult,
    type FeedbackRun,
    type FeedbackRunList,
    type FeedbackStatus,
    type FeedbackStatusResponse,
} from "@/lib/feedback-api";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Polling Configuration
// ============================================================================

const INITIAL_POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_INTERVAL = 10000; // 10 seconds
const POLL_TIMEOUT = 120000; // 2 minutes max polling time
const BACKOFF_MULTIPLIER = 1.5;

// ============================================================================
// useFeedbackRuns - Paginated list of feedback runs
// ============================================================================

interface UseFeedbackRunsReturn {
    data: FeedbackRunList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFeedbackRuns(
    skip: number = 0,
    limit: number = 20,
    status?: FeedbackStatus,
    enabled: boolean = true
): UseFeedbackRunsReturn {
    const [data, setData] = useState<FeedbackRunList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await feedbackApi.listFeedbackRuns(skip, limit, status);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch feedback runs:", err);
            setError("Failed to load feedback runs. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [skip, limit, status]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useFeedback - Single feedback run details
// ============================================================================

interface UseFeedbackReturn {
    feedback: FeedbackRun | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFeedback(
    feedbackId: number | null,
    enabled: boolean = true
): UseFeedbackReturn {
    const [feedback, setFeedback] = useState<FeedbackRun | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (feedbackId === null) {
            setFeedback(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await feedbackApi.getFeedback(feedbackId);
            setFeedback(result);
        } catch (err) {
            console.error("Failed to fetch feedback:", err);
            setError("Failed to load feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [feedbackId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { feedback, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useFeedbackResult - Feedback result (completed feedback only)
// ============================================================================

interface UseFeedbackResultReturn {
    result: FeedbackResult | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useFeedbackResult(
    feedbackId: number | null,
    enabled: boolean = true
): UseFeedbackResultReturn {
    const [result, setResult] = useState<FeedbackResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (feedbackId === null) {
            setResult(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await feedbackApi.getFeedbackResult(feedbackId);
            setResult(data);
        } catch (err) {
            console.error("Failed to fetch feedback result:", err);
            setError("Failed to load feedback result. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [feedbackId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { result, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useRequestFeedback - Request feedback mutation with polling
// ============================================================================

interface UseRequestFeedbackReturn {
    requestFeedback: (rubricId?: number) => Promise<void>;
    feedbackId: number | null;
    status: FeedbackStatusResponse | null;
    result: FeedbackResult | null;
    isRequesting: boolean;
    isPolling: boolean;
    error: string | null;
    reset: () => void;
}

export function useRequestFeedback(sessionId: number): UseRequestFeedbackReturn {
    const [feedbackId, setFeedbackId] = useState<number | null>(null);
    const [status, setStatus] = useState<FeedbackStatusResponse | null>(null);
    const [result, setResult] = useState<FeedbackResult | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollIntervalRef = useRef<number>(INITIAL_POLL_INTERVAL);
    const pollStartTimeRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        cleanup();
        setFeedbackId(null);
        setStatus(null);
        setResult(null);
        setIsRequesting(false);
        setIsPolling(false);
        setError(null);
        pollIntervalRef.current = INITIAL_POLL_INTERVAL;
    }, [cleanup]);

    const pollStatus = useCallback(
        async (id: number) => {
            // Check if we've exceeded timeout
            if (Date.now() - pollStartTimeRef.current > POLL_TIMEOUT) {
                setIsPolling(false);
                setError("Feedback generation timed out. Please try again.");
                return;
            }

            try {
                const statusResponse = await feedbackApi.getFeedbackStatus(id);
                setStatus(statusResponse);

                if (statusResponse.status === "completed") {
                    // Fetch the full result
                    const resultData = await feedbackApi.getFeedbackResult(id);
                    setResult(resultData);
                    setIsPolling(false);
                } else if (statusResponse.status === "failed") {
                    setIsPolling(false);
                    setError(statusResponse.progress_message || "Feedback generation failed.");
                } else {
                    // Schedule next poll with exponential backoff
                    pollIntervalRef.current = Math.min(
                        pollIntervalRef.current * BACKOFF_MULTIPLIER,
                        MAX_POLL_INTERVAL
                    );
                    timeoutRef.current = setTimeout(() => pollStatus(id), pollIntervalRef.current);
                }
            } catch (err) {
                console.error("Failed to poll feedback status:", err);
                // Retry on error, but count towards timeout
                pollIntervalRef.current = Math.min(
                    pollIntervalRef.current * BACKOFF_MULTIPLIER,
                    MAX_POLL_INTERVAL
                );
                timeoutRef.current = setTimeout(() => pollStatus(id), pollIntervalRef.current);
            }
        },
        []
    );

    const requestFeedback = useCallback(
        async (rubricId?: number) => {
            cleanup();
            setError(null);
            setResult(null);
            setStatus(null);

            try {
                setIsRequesting(true);
                const response = await feedbackApi.requestFeedback(sessionId, rubricId);
                setFeedbackId(response.id);
                setStatus({ id: response.id, status: response.status });

                // Start polling
                setIsRequesting(false);
                setIsPolling(true);
                pollIntervalRef.current = INITIAL_POLL_INTERVAL;
                pollStartTimeRef.current = Date.now();
                pollStatus(response.id);
            } catch (err) {
                setIsRequesting(false);
                const message = err instanceof Error ? err.message : "Failed to request feedback";
                setError(message);
                throw err;
            }
        },
        [sessionId, cleanup, pollStatus]
    );

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        requestFeedback,
        feedbackId,
        status,
        result,
        isRequesting,
        isPolling,
        error,
        reset,
    };
}

// ============================================================================
// usePollFeedback - Standalone polling hook (for when you already have feedbackId)
// ============================================================================

interface UsePollFeedbackReturn {
    status: FeedbackStatusResponse | null;
    result: FeedbackResult | null;
    isPolling: boolean;
    error: string | null;
    startPolling: () => void;
    stopPolling: () => void;
}

export function usePollFeedback(feedbackId: number | null): UsePollFeedbackReturn {
    const [status, setStatus] = useState<FeedbackStatusResponse | null>(null);
    const [result, setResult] = useState<FeedbackResult | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollIntervalRef = useRef<number>(INITIAL_POLL_INTERVAL);
    const pollStartTimeRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopPolling = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const pollStatus = useCallback(
        async (id: number) => {
            if (Date.now() - pollStartTimeRef.current > POLL_TIMEOUT) {
                setIsPolling(false);
                setError("Polling timed out. Please refresh to check status.");
                return;
            }

            try {
                const statusResponse = await feedbackApi.getFeedbackStatus(id);
                setStatus(statusResponse);

                if (statusResponse.status === "completed") {
                    const resultData = await feedbackApi.getFeedbackResult(id);
                    setResult(resultData);
                    setIsPolling(false);
                } else if (statusResponse.status === "failed") {
                    setIsPolling(false);
                    setError(statusResponse.progress_message || "Feedback generation failed.");
                } else {
                    pollIntervalRef.current = Math.min(
                        pollIntervalRef.current * BACKOFF_MULTIPLIER,
                        MAX_POLL_INTERVAL
                    );
                    timeoutRef.current = setTimeout(() => pollStatus(id), pollIntervalRef.current);
                }
            } catch (err) {
                console.error("Failed to poll feedback status:", err);
                pollIntervalRef.current = Math.min(
                    pollIntervalRef.current * BACKOFF_MULTIPLIER,
                    MAX_POLL_INTERVAL
                );
                timeoutRef.current = setTimeout(() => pollStatus(id), pollIntervalRef.current);
            }
        },
        []
    );

    const startPolling = useCallback(() => {
        if (feedbackId === null) return;

        setError(null);
        setIsPolling(true);
        pollIntervalRef.current = INITIAL_POLL_INTERVAL;
        pollStartTimeRef.current = Date.now();
        pollStatus(feedbackId);
    }, [feedbackId, pollStatus]);

    useEffect(() => {
        return stopPolling;
    }, [stopPolling]);

    return { status, result, isPolling, error, startPolling, stopPolling };
}

// ============================================================================
// useRetryFeedback - Retry failed feedback mutation
// ============================================================================

interface UseRetryFeedbackReturn {
    retryFeedback: () => Promise<FeedbackStatusResponse>;
    isLoading: boolean;
    error: string | null;
}

export function useRetryFeedback(feedbackId: number): UseRetryFeedbackReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const retryFeedback = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await feedbackApi.retryFeedback(feedbackId);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to retry feedback";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [feedbackId]);

    return { retryFeedback, isLoading, error };
}
