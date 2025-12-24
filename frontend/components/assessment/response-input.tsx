"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Mic, Send, Square } from "lucide-react";
import { useState } from "react";

interface ResponseInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export function ResponseInput({
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
  placeholder = "Type your response here...",
}: ResponseInputProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  const toggleRecording = () => {
    // Audio recording would be implemented here
    setIsRecording(!isRecording);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          className="w-full min-h-[200px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {value.length} characters • ⌘+Enter to submit
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={toggleRecording}
            disabled={isSubmitting}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Record Audio
              </>
            )}
          </Button>
          {isRecording && (
            <span className="flex items-center gap-2 text-sm text-destructive">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              Recording...
            </span>
          )}
        </div>

        <Button onClick={onSubmit} disabled={isSubmitting || !value.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Response
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
