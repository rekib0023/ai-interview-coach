"use client";

import {
    practiceApi,
    type Practice,
    type PracticeGenerationResult,
    type PracticeList,
    type PracticeStatus,
    type PracticeWithHints,
} from "@/lib/practice-api";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Polling Configuration
// ============================================================================

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 30; // 1 minute max polling

// ============================================================================
// usePractices - Paginated list of practices
// ============================================================================

interface UsePracticesReturn {
    data: PracticeList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePractices(
    skip: number = 0,
    limit: number = 20,
    status?: PracticeStatus,
    enabled: boolean = true
): UsePracticesReturn {
    const [data, setData] = useState<PracticeList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.listPractices(skip, limit, status);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch practices:", err);
            setError("Failed to load practices. Please try again.");
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
// usePendingPractices - Quick access to pending practices
// ============================================================================

interface UsePendingPracticesReturn {
    data: PracticeList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePendingPractices(
    limit: number = 10,
    enabled: boolean = true
): UsePendingPracticesReturn {
    const [data, setData] = useState<PracticeList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.getPendingPractices(limit);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch pending practices:", err);
            setError("Failed to load pending practices. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// usePractice - Single practice
// ============================================================================

interface UsePracticeReturn {
    practice: Practice | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePractice(
    practiceId: number | null,
    enabled: boolean = true
): UsePracticeReturn {
    const [practice, setPractice] = useState<Practice | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (practiceId === null) {
            setPractice(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.getPractice(practiceId);
            setPractice(result);
        } catch (err) {
            console.error("Failed to fetch practice:", err);
            setError("Failed to load practice. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [practiceId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { practice, isLoading, error, refetch: fetchData };
}

// ============================================================================
// usePracticeWithHints - Practice with hints
// ============================================================================

interface UsePracticeWithHintsReturn {
    practice: PracticeWithHints | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePracticeWithHints(
    practiceId: number | null,
    enabled: boolean = true
): UsePracticeWithHintsReturn {
    const [practice, setPractice] = useState<PracticeWithHints | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (practiceId === null) {
            setPractice(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.getPracticeWithHints(practiceId);
            setPractice(result);
        } catch (err) {
            console.error("Failed to fetch practice with hints:", err);
            setError("Failed to load practice. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [practiceId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { practice, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useGeneratePractices - Generate practices mutation with polling
// ============================================================================

interface UseGeneratePracticesReturn {
    generatePractices: (count?: number, difficultyRamp?: boolean) => Promise<void>;
    practices: PracticeGenerationResult | null;
    isGenerating: boolean;
    isPolling: boolean;
    error: string | null;
    reset: () => void;
}

export function useGeneratePractices(feedbackId: number): UseGeneratePracticesReturn {
    const [practices, setPractices] = useState<PracticeGenerationResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollAttemptsRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        cleanup();
        setPractices(null);
        setIsGenerating(false);
        setIsPolling(false);
        setError(null);
        pollAttemptsRef.current = 0;
    }, [cleanup]);

    const pollPractices = useCallback(
        async (fbId: number) => {
            pollAttemptsRef.current += 1;

            if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
                setIsPolling(false);
                setError("Practice generation timed out. Please try again.");
                return;
            }

            try {
                const result = await practiceApi.getPracticesForFeedback(fbId);
                if (result.count > 0) {
                    setPractices(result);
                    setIsPolling(false);
                } else {
                    // Keep polling
                    timeoutRef.current = setTimeout(() => pollPractices(fbId), POLL_INTERVAL);
                }
            } catch (err) {
                console.error("Failed to poll practices:", err);
                // Keep polling on error
                timeoutRef.current = setTimeout(() => pollPractices(fbId), POLL_INTERVAL);
            }
        },
        []
    );

    const generatePractices = useCallback(
        async (count: number = 3, difficultyRamp: boolean = false) => {
            cleanup();
            setError(null);
            setPractices(null);

            try {
                setIsGenerating(true);
                await practiceApi.generatePractices(feedbackId, count, difficultyRamp);

                // Start polling for practices
                setIsGenerating(false);
                setIsPolling(true);
                pollAttemptsRef.current = 0;
                pollPractices(feedbackId);
            } catch (err) {
                setIsGenerating(false);
                const message = err instanceof Error ? err.message : "Failed to generate practices";
                setError(message);
                throw err;
            }
        },
        [feedbackId, cleanup, pollPractices]
    );

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        generatePractices,
        practices,
        isGenerating,
        isPolling,
        error,
        reset,
    };
}

// ============================================================================
// usePracticesForFeedback - Get practices for a specific feedback run
// ============================================================================

interface UsePracticesForFeedbackReturn {
    data: PracticeGenerationResult | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePracticesForFeedback(
    feedbackId: number | null,
    enabled: boolean = true
): UsePracticesForFeedbackReturn {
    const [data, setData] = useState<PracticeGenerationResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (feedbackId === null) {
            setData(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.getPracticesForFeedback(feedbackId);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch practices for feedback:", err);
            setError("Failed to load practices. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [feedbackId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useStartPractice - Start practice mutation
// ============================================================================

interface UseStartPracticeReturn {
    startPractice: () => Promise<Practice>;
    isLoading: boolean;
    error: string | null;
}

export function useStartPractice(practiceId: number): UseStartPracticeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startPractice = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.startPractice(practiceId);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to start practice";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [practiceId]);

    return { startPractice, isLoading, error };
}

// ============================================================================
// useSubmitPractice - Submit practice response mutation
// ============================================================================

interface UseSubmitPracticeReturn {
    submitPractice: (userResponse: string) => Promise<Practice>;
    isLoading: boolean;
    error: string | null;
}

export function useSubmitPractice(practiceId: number): UseSubmitPracticeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitPractice = useCallback(
        async (userResponse: string) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await practiceApi.submitPracticeResponse(practiceId, userResponse);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to submit practice response";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [practiceId]
    );

    return { submitPractice, isLoading, error };
}

// ============================================================================
// useCompletePractice - Complete practice mutation
// ============================================================================

interface UseCompletePracticeReturn {
    completePractice: (score?: number) => Promise<Practice>;
    isLoading: boolean;
    error: string | null;
}

export function useCompletePractice(practiceId: number): UseCompletePracticeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completePractice = useCallback(
        async (score?: number) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await practiceApi.completePractice(practiceId, score);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to complete practice";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [practiceId]
    );

    return { completePractice, isLoading, error };
}

// ============================================================================
// useSkipPractice - Skip practice mutation
// ============================================================================

interface UseSkipPracticeReturn {
    skipPractice: () => Promise<Practice>;
    isLoading: boolean;
    error: string | null;
}

export function useSkipPractice(practiceId: number): UseSkipPracticeReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const skipPractice = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await practiceApi.skipPractice(practiceId);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to skip practice";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [practiceId]);

    return { skipPractice, isLoading, error };
}
