const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginRequest {
    username: string; // FastAPI OAuth2PasswordRequestForm expects 'username' field
    password: string;
}

interface SignupRequest {
    email: string;
    password: string;
    full_name?: string;
}

// Backend AuthResponse currently returns user + message
interface AuthResponse {
    user: User;
    message: string;
}

interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    provider: string;
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;

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
        throw new ApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}`
        );
    }

    return response.json();
}

export const authApi = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        // FastAPI OAuth2PasswordRequestForm expects form data
        const formData = new FormData();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || "Login failed"
            );
        }

        return response.json();
    },

    async signup(userData: SignupRequest): Promise<AuthResponse> {
        return apiRequest<AuthResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },

    async getCurrentUser(): Promise<User> {
        // Backend reads token from HTTP-only cookie
        return apiRequest<User>("/auth/me");
    },

    async logout(): Promise<{ message: string }> {
        return apiRequest<{ message: string }>("/auth/logout", {
            method: "POST",
        });
    },
};

export { ApiError };
export type { User, AuthResponse, LoginRequest, SignupRequest };
