import { useCallback, useState } from "react";

type FormState<T> = {
    [K in keyof T]: T[K];
};

type FormValidation<T> = {
    [K in keyof T]?: (value: T[K], formState: T) => string | null;
};

export function useFormState<T extends Record<string, any>>(
    initialState: T,
    validations?: FormValidation<T>
) {
    const [formState, setFormState] = useState<FormState<T>>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
        setFormState(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const touchField = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const validateField = useCallback((field: keyof T) => {
        if (!validations?.[field]) return true;

        const validation = validations[field];
        const error = validation!(formState[field], formState);

        setErrors(prev => ({ ...prev, [field]: error || undefined }));
        return !error;
    }, [formState, validations]);

    const validateForm = useCallback(() => {
        if (!validations) return true;

        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        Object.keys(validations).forEach(key => {
            const field = key as keyof T;
            const validation = validations[field];
            if (validation) {
                const error = validation(formState[field], formState);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formState, validations]);

    const resetForm = useCallback(() => {
        setFormState(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);

    const getFieldError = useCallback((field: keyof T) => {
        return touched[field] ? errors[field] : undefined;
    }, [errors, touched]);

    return {
        formState,
        errors,
        touched,
        updateField,
        touchField,
        validateField,
        validateForm,
        resetForm,
        getFieldError,
    };
}
