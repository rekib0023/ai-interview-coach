"use client";

import {
    drillApi,
    type Drill,
    type DrillGenerationResult,
    type DrillList,
    type DrillStatus,
    type DrillWithHints,
} from "@/lib/drill-api";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Polling Configuration
// ============================================================================

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 30; // 1 minute max polling

// ============================================================================
// useDrills - Paginated list of drills
// ============================================================================

interface UseDrillsReturn {
    data: DrillList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDrills(
    skip: number = 0,
    limit: number = 20,
    status?: DrillStatus,
    enabled: boolean = true
): UseDrillsReturn {
    const [data, setData] = useState<DrillList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.listDrills(skip, limit, status);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch drills:", err);
            setError("Failed to load drills. Please try again.");
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
// usePendingDrills - Quick access to pending drills
// ============================================================================

interface UsePendingDrillsReturn {
    data: DrillList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function usePendingDrills(
    limit: number = 10,
    enabled: boolean = true
): UsePendingDrillsReturn {
    const [data, setData] = useState<DrillList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.getPendingDrills(limit);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch pending drills:", err);
            setError("Failed to load pending drills. Please try again.");
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
// useDrill - Single drill
// ============================================================================

interface UseDrillReturn {
    drill: Drill | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDrill(
    drillId: number | null,
    enabled: boolean = true
): UseDrillReturn {
    const [drill, setDrill] = useState<Drill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (drillId === null) {
            setDrill(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.getDrill(drillId);
            setDrill(result);
        } catch (err) {
            console.error("Failed to fetch drill:", err);
            setError("Failed to load drill. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [drillId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { drill, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useDrillWithHints - Drill with hints
// ============================================================================

interface UseDrillWithHintsReturn {
    drill: DrillWithHints | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDrillWithHints(
    drillId: number | null,
    enabled: boolean = true
): UseDrillWithHintsReturn {
    const [drill, setDrill] = useState<DrillWithHints | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (drillId === null) {
            setDrill(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.getDrillWithHints(drillId);
            setDrill(result);
        } catch (err) {
            console.error("Failed to fetch drill with hints:", err);
            setError("Failed to load drill. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [drillId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { drill, isLoading, error, refetch: fetchData };
}

// ============================================================================
// useGenerateDrills - Generate drills mutation with polling
// ============================================================================

interface UseGenerateDrillsReturn {
    generateDrills: (count?: number, difficultyRamp?: boolean) => Promise<void>;
    drills: DrillGenerationResult | null;
    isGenerating: boolean;
    isPolling: boolean;
    error: string | null;
    reset: () => void;
}

export function useGenerateDrills(feedbackId: number): UseGenerateDrillsReturn {
    const [drills, setDrills] = useState<DrillGenerationResult | null>(null);
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
        setDrills(null);
        setIsGenerating(false);
        setIsPolling(false);
        setError(null);
        pollAttemptsRef.current = 0;
    }, [cleanup]);

    const pollDrills = useCallback(
        async (fbId: number) => {
            pollAttemptsRef.current += 1;

            if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
                setIsPolling(false);
                setError("Drill generation timed out. Please try again.");
                return;
            }

            try {
                const result = await drillApi.getDrillsForFeedback(fbId);
                if (result.count > 0) {
                    setDrills(result);
                    setIsPolling(false);
                } else {
                    // Keep polling
                    timeoutRef.current = setTimeout(() => pollDrills(fbId), POLL_INTERVAL);
                }
            } catch (err) {
                console.error("Failed to poll drills:", err);
                // Keep polling on error
                timeoutRef.current = setTimeout(() => pollDrills(fbId), POLL_INTERVAL);
            }
        },
        []
    );

    const generateDrills = useCallback(
        async (count: number = 3, difficultyRamp: boolean = false) => {
            cleanup();
            setError(null);
            setDrills(null);

            try {
                setIsGenerating(true);
                await drillApi.generateDrills(feedbackId, count, difficultyRamp);

                // Start polling for drills
                setIsGenerating(false);
                setIsPolling(true);
                pollAttemptsRef.current = 0;
                pollDrills(feedbackId);
            } catch (err) {
                setIsGenerating(false);
                const message = err instanceof Error ? err.message : "Failed to generate drills";
                setError(message);
                throw err;
            }
        },
        [feedbackId, cleanup, pollDrills]
    );

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        generateDrills,
        drills,
        isGenerating,
        isPolling,
        error,
        reset,
    };
}

// ============================================================================
// useDrillsForFeedback - Get drills for a specific feedback run
// ============================================================================

interface UseDrillsForFeedbackReturn {
    data: DrillGenerationResult | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDrillsForFeedback(
    feedbackId: number | null,
    enabled: boolean = true
): UseDrillsForFeedbackReturn {
    const [data, setData] = useState<DrillGenerationResult | null>(null);
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
            const result = await drillApi.getDrillsForFeedback(feedbackId);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch drills for feedback:", err);
            setError("Failed to load drills. Please try again.");
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
// useStartDrill - Start drill mutation
// ============================================================================

interface UseStartDrillReturn {
    startDrill: () => Promise<Drill>;
    isLoading: boolean;
    error: string | null;
}

export function useStartDrill(drillId: number): UseStartDrillReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startDrill = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.startDrill(drillId);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to start drill";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [drillId]);

    return { startDrill, isLoading, error };
}

// ============================================================================
// useSubmitDrill - Submit drill response mutation
// ============================================================================

interface UseSubmitDrillReturn {
    submitDrill: (userResponse: string) => Promise<Drill>;
    isLoading: boolean;
    error: string | null;
}

export function useSubmitDrill(drillId: number): UseSubmitDrillReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitDrill = useCallback(
        async (userResponse: string) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await drillApi.submitDrillResponse(drillId, userResponse);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to submit drill response";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [drillId]
    );

    return { submitDrill, isLoading, error };
}

// ============================================================================
// useCompleteDrill - Complete drill mutation
// ============================================================================

interface UseCompleteDrillReturn {
    completeDrill: (score?: number) => Promise<Drill>;
    isLoading: boolean;
    error: string | null;
}

export function useCompleteDrill(drillId: number): UseCompleteDrillReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completeDrill = useCallback(
        async (score?: number) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await drillApi.completeDrill(drillId, score);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to complete drill";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [drillId]
    );

    return { completeDrill, isLoading, error };
}

// ============================================================================
// useSkipDrill - Skip drill mutation
// ============================================================================

interface UseSkipDrillReturn {
    skipDrill: () => Promise<Drill>;
    isLoading: boolean;
    error: string | null;
}

export function useSkipDrill(drillId: number): UseSkipDrillReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const skipDrill = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await drillApi.skipDrill(drillId);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to skip drill";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [drillId]);

    return { skipDrill, isLoading, error };
}
