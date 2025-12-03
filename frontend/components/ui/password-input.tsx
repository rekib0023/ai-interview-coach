"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, showStrengthIndicator = false, error, value = "", ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Use the value prop directly instead of internal state
    const password = typeof value === "string" ? value : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    };

    const getPasswordStrength = (password: string) => {
      let score = 0;
      const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      score = Object.values(checks).filter(Boolean).length;

      return {
        score,
        checks,
        strength: score < 2 ? "weak" : score < 4 ? "medium" : "strong",
      };
    };

    const strength = showStrengthIndicator
      ? getPasswordStrength(password)
      : null;

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={handleChange}
            className={cn(
              "pr-10",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-stone-400" />
            ) : (
              <Eye className="h-4 w-4 text-stone-400" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && password && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    level <= (strength?.score || 0)
                      ? strength?.strength === "weak"
                        ? "bg-red-500"
                        : strength?.strength === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-stone-200"
                  )}
                />
              ))}
            </div>

            <div className="text-xs space-y-1">
              <p
                className={cn(
                  "font-medium",
                  strength?.strength === "weak" && "text-red-600",
                  strength?.strength === "medium" && "text-yellow-600",
                  strength?.strength === "strong" && "text-green-600"
                )}
              >
                Password strength: {strength?.strength}
              </p>

              <div className="grid grid-cols-2 gap-1 text-stone-500">
                <div
                  className={cn(
                    "flex items-center gap-1",
                    strength?.checks.length && "text-green-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full",
                      strength?.checks.length ? "bg-green-500" : "bg-stone-300"
                    )}
                  />
                  8+ characters
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    strength?.checks.lowercase && "text-green-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full",
                      strength?.checks.lowercase
                        ? "bg-green-500"
                        : "bg-stone-300"
                    )}
                  />
                  Lowercase
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    strength?.checks.uppercase && "text-green-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full",
                      strength?.checks.uppercase
                        ? "bg-green-500"
                        : "bg-stone-300"
                    )}
                  />
                  Uppercase
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    strength?.checks.number && "text-green-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full",
                      strength?.checks.number ? "bg-green-500" : "bg-stone-300"
                    )}
                  />
                  Number
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    strength?.checks.special && "text-green-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full",
                      strength?.checks.special ? "bg-green-500" : "bg-stone-300"
                    )}
                  />
                  Special char
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
