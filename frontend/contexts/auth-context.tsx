"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (initialUser?: User | null) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user from HTTP-only cookie on mount
  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch((error) => {
        // Most likely unauthenticated; log for debugging but don't block UI
        console.error("Failed to fetch user data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (initialUser?: User | null) => {
    try {
      setIsLoading(true);

      if (initialUser) {
        setUser(initialUser);
      } else {
        // Fetch current user based on HTTP-only cookie set by the backend
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }

      // We no longer rely on a client-side token, but keep the field for compatibility
      setToken(null);

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
