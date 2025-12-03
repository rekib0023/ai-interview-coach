"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Code2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset logic
    console.log("Password reset for:", email);
    setSubmitted(true);
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
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center ring-4 ring-blue-50/50">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-stone-900">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-base">
              {!submitted
                ? "No worries, we'll send you reset instructions"
                : "Check your email for reset instructions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {!submitted ? (
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-stone-50/50 border-stone-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                >
                  Reset Password
                </Button>

                {/* Back to Sign In */}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  asChild
                >
                  <Link href="/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-800 font-medium">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="block mt-1 font-bold text-green-900">
                      {email}
                    </span>
                  </p>
                </div>

                <p className="text-sm text-stone-500 text-center">
                  Didn&apos;t receive the email?{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 hover:underline font-medium hover:text-blue-700 transition-colors"
                  >
                    Click to resend
                  </button>
                </p>

                <Button
                  variant="outline"
                  className="w-full h-11 border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                  asChild
                >
                  <Link href="/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            )}
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
