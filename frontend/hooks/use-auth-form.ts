import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/api";
import { useState } from "react";

interface UseAuthFormOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
    const { login, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const clearError = () => setError("");

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await authApi.login({
                username: email,
                password,
            });

            // Backend sets HTTP-only cookie and returns user info
            await login(response.user);
            options.onSuccess?.();
        } catch (err: any) {
            const errorMessage = err.message || "Login failed. Please try again.";
            setError(errorMessage);
            options.onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (email: string, password: string, fullName?: string) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await authApi.signup({
                email,
                password,
                full_name: fullName,
            });

            // Use returned user to hydrate auth state
            await login(response.user);
            options.onSuccess?.();
        } catch (err: any) {
            const errorMessage = err.message || "Signup failed. Please try again.";
            setError(errorMessage);
            options.onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Call logout API to clear server-side cookie
            await authApi.logout();
            // Call the logout function from auth context to clear client state
            logout();
            options.onSuccess?.();
        } catch (err: any) {
            const errorMessage = err.message || "Logout failed. Please try again.";
            setError(errorMessage);
            options.onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        clearError,
        handleLogin,
        handleSignup,
        handleLogout,
    };
}
