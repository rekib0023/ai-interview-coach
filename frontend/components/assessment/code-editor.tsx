"use client";

import { Editor } from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  onRun?: () => void;
  isRunning?: boolean;
  output?: string;
}

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
];

export function CodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  onRun,
  isRunning,
  output,
}: CodeEditorProps) {
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button
            size="sm"
            onClick={onRun}
            disabled={isRunning || !code.trim()}
            className="h-8"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-2 mt-2">
            <TabsTrigger value="editor">Code</TabsTrigger>
            {output && <TabsTrigger value="output">Output</TabsTrigger>}
          </TabsList>

          <TabsContent value="editor" className="flex-1 mt-0 min-h-0">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={onChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </TabsContent>

          {output && (
            <TabsContent value="output" className="flex-1 mt-0 min-h-0">
              <div className="h-full p-4 bg-[#1e1e1e] overflow-auto">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
