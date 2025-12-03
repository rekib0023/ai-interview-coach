"use client";

import { SocialLogins } from "@/components/auth/social-logins";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthForm } from "@/hooks/use-auth-form";
import { useFormState } from "@/hooks/use-form-state";
import { motion } from "framer-motion";
import { ArrowLeft, Code2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const oauthProvider = searchParams.get("provider");
  const message = searchParams.get("message");

  const [rememberMe, setRememberMe] = useState(false);

  const { isLoading, error, handleLogin } = useAuthForm();

  const { formState, updateField, validateForm, touchField, getFieldError } =
    useFormState(
      { email: "", password: "" },
      {
        email: (value) => {
          if (!value) return "Email is required";
          if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
          return null;
        },
        password: (value) => {
          if (!value) return "Password is required";
          if (value.length < 6) return "Password must be at least 6 characters";
          if (value.length > 72)
            return "Password cannot be longer than 72 characters";
          return null;
        },
      }
    );

  let oauthErrorMessage: string | null = null;
  if (urlError === "account_already_exists") {
    if (oauthProvider === "google") {
      oauthErrorMessage =
        "An account already exists with Google. Please continue with Google or use email sign in with the same address.";
    } else if (oauthProvider === "github") {
      oauthErrorMessage =
        "An account already exists with GitHub. Please continue with GitHub or use email sign in with the same address.";
    } else {
      oauthErrorMessage =
        "An account already exists with a different sign-in method. Please use the provider you originally used.";
    }
  } else if (urlError === "oauth_failed") {
    oauthErrorMessage =
      "Sign-in with the provider failed. Please try again or use email sign in.";
  } else if (urlError === "missing_user_info") {
    oauthErrorMessage =
      "We couldn't get your email from the provider. Please ensure your email is available or use email sign in.";
  } else if (urlError === "invalid_issuer") {
    oauthErrorMessage =
      "The identity provider response looked invalid, so we blocked the login for your security.";
  }

  // Handle session expired message
  let sessionMessage: string | null = null;
  if (message === "session_expired") {
    sessionMessage = "Your session has expired. Please sign in again.";
  }

  const combinedError = oauthErrorMessage || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await handleLogin(formState.email, formState.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-stone-50 to-stone-50 -z-10" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Code2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            Interview Coach
          </span>
        </Link>

        <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-2xl font-bold text-stone-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {sessionMessage && (
              <div className="mb-4 p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                {sessionMessage}
              </div>
            )}
            {combinedError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {combinedError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-600">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formState.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => touchField("email")}
                  required
                  className={`h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all ${
                    getFieldError("email")
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                />
                {getFieldError("email") && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-stone-600">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={formState.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  onBlur={() => touchField("password")}
                  required
                  error={getFieldError("password")}
                  className="h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-stone-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-600"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-stone-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <SocialLogins />
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-stone-500 mt-8">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <p className="text-center text-sm text-stone-500 mt-8">
          <Link
            href="/"
            className="hover:text-stone-900 transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
