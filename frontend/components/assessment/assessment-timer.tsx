"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentTimerProps {
  durationMinutes: number;
  startedAt: string | null;
  onExpire?: () => void;
  className?: string;
}

export function AssessmentTimer({
  durationMinutes,
  startedAt,
  onExpire,
  className,
}: AssessmentTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setRemainingSeconds(durationMinutes * 60);
      return;
    }

    const startTime = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onExpire]);

  if (remainingSeconds === null) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isLowTime = remainingSeconds < 300; // Less than 5 minutes

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md border",
        isLowTime
          ? "bg-red-500/10 text-red-400 border-red-500/30"
          : "bg-muted/50 text-muted-foreground border-border",
        className
      )}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm font-semibold">
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
