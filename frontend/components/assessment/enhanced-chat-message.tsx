"use client";

import { cn } from "@/lib/utils";
import { Copy, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export interface EnhancedMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date | string;
  message_id?: number;
}

interface EnhancedChatMessageProps {
  message: EnhancedMessage;
  onCopy?: (content: string) => void;
}

export function EnhancedChatMessage({
  message,
  onCopy,
}: EnhancedChatMessageProps) {
  const isAi = message.role === "ai";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const timestamp =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp);

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-4 group hover:bg-muted/30 transition-colors",
        isAi ? "bg-muted/20" : "bg-background"
      )}
    >
      <Avatar className="h-9 w-9 border-2 shrink-0">
        <AvatarFallback
          className={cn(
            isAi
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isAi ? "AI Interviewer" : "You"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed m-0">
            {message.content}
          </p>
        </div>

        {isAi && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              title="Copy message"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {copied && (
              <span className="text-xs text-muted-foreground">Copied!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
