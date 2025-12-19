"use client";

import { EnhancedMessage } from "@/components/assessment/enhanced-chat-message";
import { ProblemDetailsPanel } from "@/components/assessment/problem-details-panel";
import { WorkspaceTabs } from "@/components/assessment/workspace-tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAuth } from "@/contexts/auth-context";
import { useAssessment } from "@/hooks/use-assessment";
import { useWebSocket } from "@/hooks/use-websocket";
import { codeApi, type CodeLanguage } from "@/lib/code-api";
import { type DifficultyLevel } from "@/lib/assessment-api";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  FileText,
  Lightbulb,
  LogOut,
  Save,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getDifficultyColor(difficulty: DifficultyLevel) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Hard":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawAssessmentId = params.assessmentId;
  const assessmentId = rawAssessmentId ? Number(rawAssessmentId) : NaN;

  const { user, isLoading: authLoading } = useAuth();
  const { assessment, isLoading, error, mutate } = useAssessment(
    !isNaN(assessmentId) ? assessmentId : 0,
    !authLoading && !!user && !isNaN(assessmentId)
  );

  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("// Write your solution here\n");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [isRunning, setIsRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [hintCount, setHintCount] = useState(0);
  const [testResults, setTestResults] = useState<{
    passed?: number;
    total?: number;
    tests?: Array<{
      name: string;
      passed: boolean;
      input?: string;
      expected?: string;
      actual?: string;
      executionTime?: number;
    }>;
  }>();

  // WebSocket setup - memoize to prevent unnecessary re-renders
  const wsUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
    const wsBaseUrl = baseUrl.replace(/^https?:\/\//, "");
    return !isNaN(assessmentId)
      ? `${wsProtocol}://${wsBaseUrl}/api/v1/ws/${assessmentId}`
      : null;
  }, [assessmentId]);

  // Memoize assessment status to prevent unnecessary callback recreations
  const assessmentStatus = useMemo(() => assessment?.status, [assessment?.status]);

  const handleWebSocketMessage = useCallback((message: string) => {
    try {
      // Parse JSON message from backend
      const data = JSON.parse(message);

      if (data.type === "ai_message" || data.type === "user_message") {
        const msg: EnhancedMessage = {
          id: data.message_id?.toString() || `msg-${Date.now()}`,
          role: data.type === "ai_message" ? "ai" : "user",
          content: data.content,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          message_id: data.message_id,
        };
        setMessages((prev) => [...prev, msg]);
      } else if (data.type === "error") {
        console.error("WebSocket error:", data.content);
      }
    } catch (e) {
      // Fallback: treat as plain text (legacy support)
      const aiMsg: EnhancedMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  }, []);

  const shouldReconnectCallback = useCallback(
    (event: CloseEvent) => {
      return assessmentStatus === "created" || assessmentStatus === "in_progress";
    },
    [assessmentStatus]
  );

  // Only enable WebSocket for active assessments
  const isWebSocketEnabled = useMemo(
    () => assessmentStatus === "created" || assessmentStatus === "in_progress",
    [assessmentStatus]
  );

  const {
    isConnected,
    sendMessage,
    error: wsError,
  } = useWebSocket({
    url: wsUrl || "",
    onMessage: handleWebSocketMessage,
    shouldReconnect: shouldReconnectCallback,
    enabled: isWebSocketEnabled && !isNaN(assessmentId),
  });

  const handleRunCode = async () => {
    if (!assessment || !code.trim()) return;

    setIsRunning(true);
    setCodeOutput("");

    try {
      const result = await codeApi.executeCode(assessmentId, {
        code: code,
        language: language,
      });

      // Display results
      let output = "";
      if (result.stdout) {
        output += `Output:\n${result.stdout}\n\n`;
      }
      if (result.stderr) {
        output += `Errors:\n${result.stderr}\n\n`;
      }
      if (result.timed_out) {
        output += "⏱️ Execution timed out\n";
      }
      output += `\nExit code: ${result.exit_code} | Time: ${result.execution_time_ms}ms`;

      setCodeOutput(output);

      // Parse test results if available
      // This is a placeholder - actual test parsing would depend on your backend format
      if (result.stdout) {
        // Try to extract test results from output
        const testMatch = result.stdout.match(
          /(\d+)\/(\d+)\s+tests?\s+passed/i
        );
        if (testMatch) {
          setTestResults({
            passed: parseInt(testMatch[1]),
            total: parseInt(testMatch[2]),
          });
        }
      }

      // Also send result to chat
      const resultMsg: EnhancedMessage = {
        id: `code-${Date.now()}`,
        role: "ai",
        content: `Code executed successfully!\n\n${output}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, resultMsg]);
    } catch (error) {
      const errorMsg: EnhancedMessage = {
        id: `error-${Date.now()}`,
        role: "ai",
        content: `Code execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setCodeOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (assessment?.status === "in_progress" && messages.length > 1) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [assessment?.status, messages.length]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !isConnected) return;

      const userMsg: EnhancedMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Send as JSON to match backend format
      sendMessage(
        JSON.stringify({
          type: "user_message",
          content: text.trim(),
        })
      );
    },
    [isConnected, sendMessage]
  );

  const handleEndAssessment = async () => {
    if (!assessment) return;
    setIsEndingSession(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${baseUrl}/api/v1/assessments/${assessmentId}/complete`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        await mutate();
        router.push(`/assessment/${assessmentId}/feedback`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleTimerExpire = () => {
    if (assessment?.status === "in_progress") {
      handleEndAssessment();
    }
  };

  const handleRequestHint = useCallback(() => {
    if (hintCount >= 3) return;
    sendMessage(
      JSON.stringify({
        type: "command",
        action: "hint",
      })
    );
    setHintCount((prev) => prev + 1);
  }, [hintCount, sendMessage]);

  const handleSave = useCallback(() => {
    // Save code to localStorage or backend
    localStorage.setItem(`assessment-${assessmentId}-code`, code);
    localStorage.setItem(`assessment-${assessmentId}-language`, language);
    // Show toast notification
    console.log("Saved!");
  }, [code, language, assessmentId]);

  if (authLoading || isLoading) return <AssessmentDetailSkeleton />;
  if (error || !assessment)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive mb-4">{error || "Assessment not found"}</p>
        <Link href="/assessment">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        </Link>
      </div>
    );

  const isAssessmentActive =
    assessment.status === "in_progress" || assessment.status === "created";
  const canSendMessages = isAssessmentActive && isConnected;

  // Format timer for header
  const formatTimer = () => {
    if (!isAssessmentActive || !assessment.started_at) return "00:00";
    const startTime = new Date(assessment.started_at).getTime();
    const durationMs = (assessment.duration_minutes || 45) * 60 * 1000;
    const endTime = startTime + durationMs;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/assessment">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold">{assessment.topic}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5 px-2",
                  getDifficultyColor(assessment.difficulty)
                )}
              >
                {assessment.difficulty}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAssessmentActive && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold">
                    {formatTimer()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isConnected ? "text-green-500" : "text-destructive"
                    )}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {wsError && (
        <Alert variant="destructive" className="m-4 mb-0 flex-none">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{wsError}</AlertDescription>
        </Alert>
      )}

      {/* Main Workspace Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* Left Panel: Workspace (Chat/Code/Results) */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <WorkspaceTabs
            assessmentId={assessmentId}
            code={code}
            onCodeChange={(val) => setCode(val || "")}
            language={language}
            onLanguageChange={(lang) => setLanguage(lang as CodeLanguage)}
            onRunCode={handleRunCode}
            isRunningCode={isRunning}
            codeOutput={codeOutput}
            messages={messages}
            onSendMessage={handleSendMessage}
            canSendMessages={canSendMessages}
            isConnected={isConnected}
            testResults={testResults}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Problem Details */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <ProblemDetailsPanel
            assessment={assessment}
            onTimerExpire={handleTimerExpire}
            onRequestHint={handleRequestHint}
            hintCount={hintCount}
            maxHints={3}
            testResults={testResults}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Footer */}
      <footer className="flex-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {isAssessmentActive && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleRequestHint}
                disabled={hintCount >= 3}
              >
                <Lightbulb className="h-4 w-4" />
                Request Hint ({hintCount}/3)
              </Button>
            )}
            <Button variant="default" size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Submit Solution
            </Button>
            {isAssessmentActive && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleEndAssessment}
                disabled={isEndingSession}
              >
                <LogOut className="h-4 w-4" />
                {isEndingSession ? "Ending..." : "End Assessment"}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function AssessmentDetailSkeleton() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading assessment...</p>
      </div>
    </div>
  );
}
