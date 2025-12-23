"use client";

import { cn } from "@/lib/utils";
import { Copy, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface EnhancedMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date | string;
  message_id?: number;
  isStreaming?: boolean;
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
          {message.isStreaming && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Streaming...
            </span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {isAi ? (
            <>
              <ReactMarkdown
                remarkPlugins={message.isStreaming ? [] : [remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground border-b pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mt-5 mb-2 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground/90">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-base leading-7 mb-3 text-foreground/90 last:mb-0">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-base mb-3 space-y-1.5 ml-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-base mb-3 space-y-1.5 ml-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground/90 pl-1 leading-7">
                      {children}
                    </li>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground font-medium"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="relative">
                        <code
                          className="block bg-zinc-950 dark:bg-zinc-900 border border-border/50 p-4 rounded-lg text-sm font-mono text-zinc-50 overflow-x-auto my-3 shadow-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      </div>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="not-prose m-0">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/20 pl-4 py-1 my-3 bg-muted/20 rounded-r italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border rounded-lg">
                      <table className="w-full text-sm text-left">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted text-xs uppercase text-muted-foreground">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="bg-background hover:bg-muted/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 font-medium">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
              )}
            </>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed m-0">
              {message.content}
            </p>
          )}
        </div>

        {isAi && !message.isStreaming && (
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
