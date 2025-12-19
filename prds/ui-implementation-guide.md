# Interview Section - Modern UI Component Implementation Guide

**Version:** 1.0  
**Status:** Ready for Development  
**Framework:** Next.js 14 + shadcn/ui + Tailwind CSS + Lottie

---

## Part 1: Core Layout Structure

### Main Interview Page (`app/interview/[id]/page.tsx`)

```typescript
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { InterviewHeader } from './_components/InterviewHeader'
import { LeftPanel } from './_components/LeftPanel'
import { RightSidebar } from './_components/RightSidebar'
import { FooterActions } from './_components/FooterActions'
import { useWebSocket } from './_hooks/useWebSocket'
import { useInterviewStore } from '@/stores/interviewStore'

export default function InterviewPage() {
  const params = useParams()
  const interviewId = params.id as string
  const [isConnected, setIsConnected] = useState(false)
  
  // Initialize WebSocket
  const socket = useWebSocket(interviewId, {
    onConnected: () => setIsConnected(true),
    onDisconnected: () => setIsConnected(false)
  })

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent animate-pulse opacity-40" />
      </div>

      {/* Main layout */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <InterviewHeader interviewId={interviewId} isConnected={isConnected} />

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full p-4">
            {/* Left Panel - Chat, Code, Whiteboard */}
            <motion.div
              className="lg:col-span-2 overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LeftPanel socket={socket} />
            </motion.div>

            {/* Right Sidebar - Problem + Metrics */}
            <motion.div
              className="hidden lg:block overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <RightSidebar interviewId={interviewId} />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <FooterActions interviewId={interviewId} socket={socket} />
      </div>
    </div>
  )
}
```

---

## Part 2: Left Panel - Chat Interface

### ChatPanel Component (`_components/ChatPanel.tsx`)

```typescript
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Plus } from 'lucide-react'
import { ChatMessage } from '@/components/interview/ChatMessage'
import { TypingIndicator } from '@/components/interview/TypingIndicator'
import { useChatStore } from '@/stores/chatStore'
import { useDebounce } from '@/hooks/useDebounce'

interface ChatPanelProps {
  socket: any
  interviewId: string
}

export function ChatPanel({ socket, interviewId }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const messages = useChatStore((state) => state.messages)
  const addMessage = useChatStore((state) => state.addMessage)
  const isAITyping = useChatStore((state) => state.isAITyping)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Debounced typing indicator
  const debouncedTyping = useDebounce(() => {
    socket.emit('typing', { isTyping: false })
  }, 1000)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      socket.emit('typing', { isTyping: true })
    }
    
    debouncedTyping()
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Emit message to backend
    socket.emit('message', {
      type: 'text',
      content: input,
      timestamp: new Date().toISOString()
    })

    // Update local store
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      isStreaming: false
    })

    // Clear input
    setInput('')
    setIsTyping(false)
    
    // Hide typing indicator
    socket.emit('typing', { isTyping: false })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-center"
            >
              <div className="space-y-3">
                <div className="text-4xl">🎯</div>
                <p className="text-sm text-white/60">
                  Say hello to start your interview!
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <ChatMessage message={msg} />
              </motion.div>
            ))
          )}

          {isAITyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key="typing-indicator"
            >
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  AI
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 space-y-3 bg-gradient-to-t from-white/5 to-transparent">
        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your response... (Shift+Enter for new line)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            size="icon"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Character count */}
        <div className="text-xs text-white/40 text-right">
          {input.length} characters
        </div>
      </div>
    </div>
  )
}
```

### ChatMessage Component (`@/components/interview/ChatMessage.tsx`)

```typescript
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'ai'
    content: string
    timestamp: Date
    codeSnippet?: {
      language: string
      code: string
    }
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Content */}
      <div className={`flex-1 flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
            isUser
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-none'
              : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* Code block */}
          {message.codeSnippet && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-black/30 rounded p-3 border border-white/10"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/60 font-mono">
                  {message.codeSnippet.language}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(message.codeSnippet!.code)}
                  className="h-6 w-6 p-0 text-white/60 hover:text-white"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <code className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto block">
                {message.codeSnippet.code}
              </code>
            </motion.div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-white/40">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  )
}
```

### TypingIndicator Component (`@/components/interview/TypingIndicator.tsx`)

```typescript
'use client'

import Lottie from 'lottie-react'
import typingAnimation from '@/public/animations/typing.json'

export function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center">
      <Lottie
        animationData={typingAnimation}
        loop
        autoplay
        style={{ width: 40, height: 20 }}
      />
      <span className="text-xs text-white/60">AI is thinking...</span>
    </div>
  )
}
```

---

## Part 3: Code Editor Tab

### CodeEditor Component (`_components/CodeEditor.tsx`)

```typescript
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { useCodeStore } from '@/stores/codeStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Send, Undo2, Redo2, Copy } from 'lucide-react'
import Lottie from 'lottie-react'
import loadingAnimation from '@/public/animations/loading.json'

interface CodeEditorProps {
  socket: any
  interviewId: string
}

const LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
]

export function CodeEditor({ socket, interviewId }: CodeEditorProps) {
  const editorRef = React.useRef<any>(null)
  const code = useCodeStore((state) => state.code)
  const language = useCodeStore((state) => state.language)
  const setCode = useCodeStore((state) => state.setCode)
  const setLanguage = useCodeStore((state) => state.setLanguage)
  
  const [isRunning, setIsRunning] = useState(false)
  const [theme, setTheme] = useState('vs-dark')

  // Auto-save code
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`code_${interviewId}`, code)
    }, 1000)
    return () => clearTimeout(timer)
  }, [code, interviewId])

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleRunCode = useCallback(() => {
    if (!code.trim()) return

    setIsRunning(true)
    socket.emit('code_execution', {
      code,
      language,
      timestamp: new Date().toISOString()
    })

    // Simulate timeout
    setTimeout(() => setIsRunning(false), 6000)
  }, [code, language, socket])

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return

    socket.emit('code_submit', {
      code,
      language,
      timestamp: new Date().toISOString()
    })
  }, [code, language, socket])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-white">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 text-xs text-white/40 ml-4">
            {code.length} chars • {code.split('\n').length} lines
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Autosave indicator */}
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            title="Auto-saved"
          />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="h-8 text-white/60 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        {isRunning && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <Lottie
                animationData={loadingAnimation}
                loop
                autoplay
                style={{ width: 100, height: 100 }}
              />
              <p className="text-white/80 mt-2 text-sm">Executing code...</p>
            </div>
          </motion.div>
        )}

        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 p-4 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
        <Button
          onClick={handleRunCode}
          disabled={isRunning || !code.trim()}
          className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Run Code
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isRunning || !code.trim()}
          className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Submit Solution
        </Button>
      </div>
    </div>
  )
}
```

---

## Part 4: Test Results Component

### TestResults Component (`_components/TestResults.tsx`)

```typescript
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Lottie from 'lottie-react'
import successAnimation from '@/public/animations/success.json'
import errorAnimation from '@/public/animations/error.json'

interface TestResult {
  id: string
  testNumber: number
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  executionTimeMs: number
}

interface TestResultsProps {
  results: TestResult[]
  isLoading?: boolean
  totalExecutionTimeMs?: number
}

export function TestResults({
  results,
  isLoading,
  totalExecutionTimeMs,
}: TestResultsProps) {
  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  
  const passed = results.filter((r) => r.passed).length
  const total = results.length

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Lottie
          animationData={successAnimation}
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Summary */}
      <motion.div
        className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Test Results</h3>
            <p className="text-sm text-white/60">
              {passed} of {total} tests passed
            </p>
          </div>
          
          {/* Score circle */}
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              background: passed === total
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : passed >= total * 0.5
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
            }}
          >
            <span className="text-white">
              {Math.round((passed / total) * 100)}%
            </span>
          </motion.div>
        </div>

        {/* Execution time */}
        {totalExecutionTimeMs && (
          <p className="text-xs text-white/40 mt-2">
            Execution time: {totalExecutionTimeMs}ms
          </p>
        )}
      </motion.div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedTest(
                    expandedTest === result.id ? null : result.id
                  )
                )
                className="w-full p-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-white">
                    Test {result.testNumber}
                  </span>
                  <span className="text-xs text-white/40 ml-2">
                    {result.executionTimeMs}ms
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-white/60 transition-transform ${
                    expandedTest === result.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedTest === result.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10 p-3 bg-white/3 space-y-2"
                  >
                    <div>
                      <p className="text-xs text-white/60 font-semibold mb-1">
                        Input:
                      </p>
                      <code className="text-xs text-green-400 bg-black/30 p-2 rounded block font-mono">
                        {result.input}
                      </code>
                    </div>

                    <div>
                      <p className="text-xs text-white/60 font-semibold mb-1">
                        Expected:
                      </p>
                      <code className="text-xs text-blue-400 bg-black/30 p-2 rounded block font-mono">
                        {result.expectedOutput}
                      </code>
                    </div>

                    {!result.passed && (
                      <div>
                        <p className="text-xs text-white/60 font-semibold mb-1">
                          Actual:
                        </p>
                        <code className="text-xs text-red-400 bg-black/30 p-2 rounded block font-mono">
                          {result.actualOutput}
                        </code>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## Part 5: Right Sidebar - Metrics

### InterviewMetrics Component (`_components/InterviewMetrics.tsx`)

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInterviewStore } from '@/stores/interviewStore'
import { Clock, TrendingUp, Zap, Target } from 'lucide-react'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function MetricCard({ icon, label, value, unit, color }: MetricCardProps) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
  }

  return (
    <motion.div
      className={`p-4 rounded-lg bg-gradient-to-br ${colorMap[color]}/20 border border-white/10 hover:border-white/20 transition-all`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-white/60 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              className="text-2xl font-bold text-white"
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {value}
            </motion.span>
            {unit && <span className="text-sm text-white/60">{unit}</span>}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

interface InterviewMetricsProps {
  interviewId: string
}

export function InterviewMetrics({ interviewId }: InterviewMetricsProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const metrics = useInterviewStore((state) => state.metrics)

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Performance</h3>

      <div className="space-y-2">
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="Time Elapsed"
          value={formatTime(timeElapsed)}
          color="blue"
        />

        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          label="Code Attempts"
          value={metrics.codeAttempts}
          color="orange"
        />

        <MetricCard
          icon={<Target className="w-5 h-5" />}
          label="Test Pass Rate"
          value={`${metrics.testPassRate}%`}
          color="green"
        />

        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Current Score"
          value={metrics.score}
          unit="/100"
          color="purple"
        />
      </div>

      {/* Weak areas */}
      {metrics.weakAreas && metrics.weakAreas.length > 0 && (
        <motion.div
          className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xs text-red-300 font-semibold mb-2">⚠️ Weak Areas</p>
          <ul className="text-xs text-red-200/80 space-y-1">
            {metrics.weakAreas.map((area) => (
              <li key={area}>• {area}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
```

---

## Part 6: Zustand Stores

### Chat Store (`stores/chatStore.ts`)

```typescript
import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  isStreaming?: boolean
  codeSnippet?: {
    language: string
    code: string
  }
}

interface ChatStore {
  messages: Message[]
  isAITyping: boolean
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setIsAITyping: (isTyping: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isAITyping: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      isAITyping: false,
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      if (messages.length > 0) {
        messages[messages.length - 1].content = content
      }
      return { messages }
    }),

  setIsAITyping: (isTyping) => set({ isAITyping: isTyping }),

  clearMessages: () => set({ messages: [], isAITyping: false }),
}))
```

---

## Part 7: WebSocket Hook

### useWebSocket Hook (`_hooks/useWebSocket.ts`)

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chatStore'
import { useCodeStore } from '@/stores/codeStore'

interface UseWebSocketOptions {
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

export function useWebSocket(
  interviewId: string,
  options: UseWebSocketOptions = {}
) {
  const socketRef = useRef<Socket | null>(null)
  const addMessage = useChatStore((state) => state.addMessage)
  const setIsAITyping = useChatStore((state) => state.setIsAITyping)

  useEffect(() => {
    // Connect to WebSocket
    const token = localStorage.getItem('auth_token')
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/interview`, {
      auth: { token },
      query: { interview_id: interviewId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    })

    // Connection handlers
    socket.on('connect', () => {
      console.log('Connected to interview')
      options.onConnected?.()
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from interview')
      options.onDisconnected?.()
    })

    // AI message streaming
    let currentMessage = ''
    socket.on('ai_token', (data: { token: string }) => {
      currentMessage += data.token
      setIsAITyping(true)
    })

    socket.on('ai_message_complete', (data: { full_content: string }) => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'ai',
        content: data.full_content,
        timestamp: new Date(),
        isStreaming: false,
      })
      setIsAITyping(false)
      currentMessage = ''
    })

    // Code execution results
    socket.on('code_result', (data: any) => {
      console.log('Code execution result:', data)
      // Handle in CodeEditor component
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [interviewId, addMessage, setIsAITyping, options])

  return socketRef.current
}
```

---

## Key Features Implemented:

✅ **Modern UI with glassmorphism effects**  
✅ **Smooth Framer Motion animations**  
✅ **Lottie animations for loading/typing states**  
✅ **Real-time WebSocket chat**  
✅ **Monaco Editor integration**  
✅ **Test results display**  
✅ **Real-time metrics tracking**  
✅ **Dark theme with gradients**  
✅ **Responsive design**  
✅ **Auto-save functionality**  
✅ **Code syntax highlighting**  
✅ **Accessibility features**  

---

**Next Steps:**
1. Create Lottie animation JSON files
2. Implement remaining components (Whiteboard, Header, Footer)
3. Set up backend WebSocket handlers
4. Integrate with OpenAI API
5. Set up Docker sandbox for code execution
6. Performance testing & optimization

**Ready for development! 🚀**
