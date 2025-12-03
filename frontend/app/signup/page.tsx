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
import { useState } from "react";

export default function SignUpPage() {
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { isLoading, error, handleSignup } = useAuthForm();

  const { formState, updateField, validateForm, touchField, getFieldError } =
    useFormState(
      { fullName: "", email: "", password: "", confirmPassword: "" },
      {
        fullName: (value) => {
          if (!value) return "Full name is required";
          return null;
        },
        email: (value) => {
          if (!value) return "Email is required";
          if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
          return null;
        },
        password: (value) => {
          if (!value) return "Password is required";
          if (value.length < 8) return "Password must be at least 8 characters";
          if (value.length > 72)
            return "Password cannot be longer than 72 characters";
          return null;
        },
        confirmPassword: (value, formState) => {
          if (!value) return "Please confirm your password";
          if (value !== formState.password) return "Passwords don't match";
          return null;
        },
      }
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!agreeToTerms) {
      // You could add this to form validation too
      return;
    }

    await handleSignup(formState.email, formState.password, formState.fullName);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 py-12 relative overflow-hidden">
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
              Create an account
            </CardTitle>
            <CardDescription className="text-base">
              Start your interview preparation journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-stone-600">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formState.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  onBlur={() => touchField("fullName")}
                  required
                  className={`h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all ${
                    getFieldError("fullName")
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                />
                {getFieldError("fullName") && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    {getFieldError("fullName")}
                  </p>
                )}
              </div>

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
                <Label htmlFor="password" className="text-stone-600">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={formState.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  onBlur={() => touchField("password")}
                  required
                  showStrengthIndicator={true}
                  error={getFieldError("password")}
                  className="h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-stone-600">
                  Confirm Password
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  onBlur={() => touchField("confirmPassword")}
                  required
                  error={getFieldError("confirmPassword")}
                  className="h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                  className="mt-1 border-stone-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-stone-600"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:underline hover:text-blue-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline hover:text-blue-700"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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

            {/* Sign In Link */}
            <p className="text-center text-sm text-stone-500 mt-8">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                Sign in
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
