"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "./code-editor";
import { ExcalidrawCanvas } from "./excalidraw-canvas";
import { Code2, PencilRuler, MessageSquare, CheckSquare } from "lucide-react";
import {
  EnhancedChatMessage,
  type EnhancedMessage,
} from "./enhanced-chat-message";
import { ChatInput } from "./chat-input";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef } from "react";

interface WorkspaceTabsProps {
  assessmentId: number;
  code: string;
  onCodeChange: (value: string | undefined) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  onRunCode?: () => void;
  isRunningCode?: boolean;
  codeOutput?: string;
  // Chat props
  messages?: EnhancedMessage[];
  onSendMessage?: (text: string) => void;
  canSendMessages?: boolean;
  isConnected?: boolean;
  // Results props
  testResults?: {
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
  };
}

export function WorkspaceTabs({
  assessmentId,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onRunCode,
  isRunningCode,
  codeOutput,
  messages = [],
  onSendMessage,
  canSendMessages = false,
  isConnected = false,
  testResults,
}: WorkspaceTabsProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: instant ? "auto" : "smooth",
      block: "end"
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isStreaming = lastMessage.isStreaming;

      scrollToBottom(isStreaming);
    }
  }, [messages]);

  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-none px-4 pt-3 border-b">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <PencilRuler className="w-4 h-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 h-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4">
            <div className="py-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <EnhancedChatMessage key={msg.id} message={msg} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p>Starting assessment...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="flex-none border-t bg-background px-4 py-3">
            <ChatInput
              onSend={onSendMessage || (() => {})}
              disabled={!canSendMessages}
              placeholder={
                !isConnected ? "Connecting..." : "Type your message..."
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 mt-0 h-full min-h-0 overflow-hidden">
          <div className="h-full p-4">
            <CodeEditor
              code={code}
              onChange={onCodeChange}
              language={language}
              onLanguageChange={onLanguageChange}
              onRun={onRunCode}
              isRunning={isRunningCode}
              output={codeOutput}
            />
          </div>
        </TabsContent>

        <TabsContent value="design" className="flex-1 mt-0 h-full">
          <div className="h-full p-4">
            <ExcalidrawCanvas sessionId={assessmentId} />
          </div>
        </TabsContent>

        <TabsContent
          value="results"
          className="flex-1 mt-0 h-full overflow-y-auto"
        >
          <div className="p-4">
            {testResults && testResults.total ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {testResults.passed || 0} of {testResults.total} tests
                    passed
                  </p>
                  {testResults.total > 0 && (
                    <Progress
                      value={
                        ((testResults.passed || 0) / testResults.total) * 100
                      }
                      className="mt-2 h-2"
                    />
                  )}
                  <div className="mt-4 space-y-2">
                    {testResults.tests?.map((test, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {test.passed ? (
                              <CheckSquare className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                            <span className="font-medium text-sm">
                              {test.name}
                            </span>
                          </div>
                          {test.executionTime && (
                            <span className="text-xs text-muted-foreground">
                              {test.executionTime}ms
                            </span>
                          )}
                        </div>
                        {test.input && (
                          <div className="mt-2 text-xs space-y-1">
                            <div>
                              <span className="font-semibold">INPUT:</span>{" "}
                              <code className="text-xs">{test.input}</code>
                            </div>
                            {test.expected && (
                              <div>
                                <span className="font-semibold">EXPECTED:</span>{" "}
                                <code className="text-xs">{test.expected}</code>
                              </div>
                            )}
                            {test.actual && (
                              <div>
                                <span className="font-semibold">ACTUAL:</span>{" "}
                                <code className="text-xs bg-green-500/20 px-1 rounded">
                                  {test.actual}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                <CheckSquare className="h-12 w-12 mb-4 opacity-20" />
                <p>No test results yet. Run your code to see results.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
