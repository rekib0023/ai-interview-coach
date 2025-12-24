"use client";

import {
    assessmentApi,
    type Assessment,
    type AssessmentList,
    type AssessmentCreate,
    type AssessmentStatus,
    type AssessmentSubmitResponse,
} from "@/lib/assessment-api";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// useAssessments - Paginated list of assessments
// ============================================================================

interface UseAssessmentsReturn {
    data: AssessmentList | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useAssessments(
    page: number = 1,
    pageSize: number = 20,
    status?: AssessmentStatus,
    enabled: boolean = true
): UseAssessmentsReturn {
    const [data, setData] = useState<AssessmentList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await assessmentApi.getAssessments(page, pageSize, status);
            setData(result);
        } catch (err) {
            console.error("Failed to fetch assessments:", err);
            setError("Failed to load assessments. Please try again.");
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
// useAssessment - Single assessment
// ============================================================================

interface UseAssessmentReturn {
    assessment: Assessment | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    mutate: () => Promise<void>;
}

export function useAssessment(
    assessmentId: number | null,
    enabled: boolean = true
): UseAssessmentReturn {
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (assessmentId === null) {
            setAssessment(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await assessmentApi.getAssessment(assessmentId);
            setAssessment(result);
        } catch (err) {
            console.error("Failed to fetch assessment:", err);
            setError("Failed to load assessment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [assessmentId]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData]);

    return { assessment, isLoading, error, refetch: fetchData, mutate: fetchData };
}

// ============================================================================
// useCreateAssessment - Create new assessment mutation
// ============================================================================

interface UseCreateAssessmentReturn {
    createAssessment: (data: AssessmentCreate) => Promise<Assessment>;
    isLoading: boolean;
    error: string | null;
}

export function useCreateAssessment(): UseCreateAssessmentReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAssessment = useCallback(async (data: AssessmentCreate) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await assessmentApi.createAssessment(data);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create assessment";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createAssessment, isLoading, error };
}

// ============================================================================
// useSubmitResponse - Submit response mutation
// ============================================================================

interface UseSubmitResponseReturn {
    submitResponse: (data: AssessmentSubmitResponse) => Promise<Assessment>;
    isLoading: boolean;
    error: string | null;
}

export function useSubmitResponse(assessmentId: number): UseSubmitResponseReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitResponse = useCallback(
        async (data: AssessmentSubmitResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await assessmentApi.submitResponse(assessmentId, data);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to submit response";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [assessmentId]
    );

    return { submitResponse, isLoading, error };
}

// ============================================================================
// useCompleteAssessment - Complete assessment mutation
// ============================================================================

interface UseCompleteAssessmentReturn {
    completeAssessment: (score?: number) => Promise<Assessment>;
    isLoading: boolean;
    error: string | null;
}

export function useCompleteAssessment(assessmentId: number): UseCompleteAssessmentReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completeAssessment = useCallback(
        async (score?: number) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await assessmentApi.completeAssessment(assessmentId, score);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to complete assessment";
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [assessmentId]
    );

    return { completeAssessment, isLoading, error };
}

// ============================================================================
// useDeleteAssessment - Delete assessment mutation
// ============================================================================

interface UseDeleteAssessmentReturn {
    deleteAssessment: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

export function useDeleteAssessment(assessmentId: number): UseDeleteAssessmentReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteAssessment = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await assessmentApi.deleteAssessment(assessmentId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete assessment";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [assessmentId]);

    return { deleteAssessment, isLoading, error };
}
