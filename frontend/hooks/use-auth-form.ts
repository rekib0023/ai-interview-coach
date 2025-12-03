import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

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

            await login(response.access_token);
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
            // Create user account (backend now automatically logs them in via cookie)
            await authApi.signup({
                email,
                password,
                full_name: fullName,
            });

            // Since backend sets HTTP-only cookie, we can't access the token
            // Instead, we'll fetch the current user to update the auth state
            try {
                const user = await authApi.getCurrentUser("");
                // Manually update auth state since we're using cookies now
                await login("cookie-based-auth"); // Placeholder token
            } catch {
                // If getCurrentUser fails, still consider signup successful
                // The cookie is set, user just needs to refresh or navigate
            }

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
