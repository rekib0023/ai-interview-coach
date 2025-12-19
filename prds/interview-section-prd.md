# AI Interview Coach – Interview Section PRD

**Document Version:** 2.0  
**Status:** Ready for Implementation  
**Date:** December 2025  
**Audience:** Product Managers, Designers, Frontend Engineers, Backend Engineers  
**Minimum Words:** 3000+

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Experience Vision](#user-experience-vision)
4. [Frontend Architecture & UI Design](#frontend-architecture--ui-design)
5. [Backend Architecture & API Design](#backend-architecture--api-design)
6. [Real-time Communication (WebSocket)](#real-time-communication-websocket)
7. [Core Features & Requirements](#core-features--requirements)
8. [UI Components Detailed Specification](#ui-components-detailed-specification)
9. [Animation & Interaction Design](#animation--interaction-design)
10. [Data Models & API Contracts](#data-models--api-contracts)
11. [Performance & Optimization](#performance--optimization)
12. [Accessibility & UX](#accessibility--ux)
13. [Technical Implementation Details](#technical-implementation-details)
14. [Success Metrics](#success-metrics)

---

## Executive Summary

The **Interview Section** is the core interactive feature of AI Interview Coach where users conduct mock technical interviews with an AI interviewer. This PRD defines both the modern, engaging frontend experience using Next.js + shadcn + Lottie animations, and the robust backend infrastructure supporting real-time WebSocket communication, code execution in Docker sandboxes, and intelligent AI-driven interviews.

**Key Statistics:**
- **Duration:** 20-60 minutes per session
- **Concurrent Users:** 100-500 at peak
- **Code Execution Timeout:** 5 seconds
- **WebSocket Latency Target:** <100ms
- **Animation Frame Rate:** 60 FPS (Lottie)
- **Code Sandbox Isolation:** Full Docker container per execution

**No Video/Audio:** As per requirements, all communication is text-based through WebSocket chat and structured message passing.

---

## Product Overview

### 1. Core Components

The Interview Section consists of **four interconnected modules**:

1. **AI Interviewer Chat** - Real-time conversational interface where the AI guides the interview
2. **Code Editor & Executor** - Monaco Editor with real-time code execution in Docker
3. **System Design Canvas** - Excalidraw-powered whiteboarding for architecture discussions
4. **Interview Protocol & Metrics** - Real-time progress tracking and scoring

### 2. User Journey

```
1. User selects problem difficulty & category
   ↓
2. AI Interviewer introduces the problem
   ↓
3. User discusses approach with AI (Chat)
   ↓
4. User writes code in Editor
   ↓
5. User runs code (Docker execution)
   ↓
6. AI provides real-time feedback
   ↓
7. Optional: System Design discussion (Excalidraw)
   ↓
8. Interview concludes with score & feedback
```

### 3. Target Users

- **Primary:** Software engineers preparing for FAANG interviews
- **Secondary:** Bootcamp graduates, career switchers
- **Tertiary:** Students preparing for campus placements

---

## User Experience Vision

### Design Philosophy

**"Smooth, Responsive, Focused"** - The UI should feel like a natural conversation with an expert interviewer, not a clunky form-filling experience. Every interaction should have meaningful feedback.

### Key UX Principles

1. **Real-time Feedback** - Every action (typing, code execution, drawing) gets instant visual response
2. **Progressive Disclosure** - Information revealed as needed, not overwhelming upfront
3. **Minimal Friction** - Maximum 2 clicks to perform any action
4. **Clear Affordances** - Users always know what they can click/interact with
5. **Consistent State** - UI always reflects actual backend state
6. **Beautiful Empty States** - Loading, error, and empty states are visually delightful

### Design Tokens

```typescript
// Colors (using modern gradients & semantic colors)
const colors = {
  primary: "#0066FF",           // Action, AI messages, highlights
  secondary: "#7C3AED",         // AI personality, accents
  success: "#10B981",           // Test passed, execution success
  warning: "#F59E0B",           // Warnings, slow execution
  error: "#EF4444",             // Errors, failed tests
  neutral: {
    50: "#F9FAFB",              // Lightest background
    100: "#F3F4F6",             // Light surface
    200: "#E5E7EB",             // Border
    300: "#D1D5DB",             // Disabled text
    500: "#6B7280",             // Secondary text
    700: "#374151",             // Primary text
    900: "#111827"              // Darkest text
  },
  glass: "rgba(255, 255, 255, 0.7)"  // Glassmorphism effect
}

// Typography
const typography = {
  display: "font-size: 2.5rem; font-weight: 700; line-height: 1.2",
  heading1: "font-size: 2rem; font-weight: 600; line-height: 1.3",
  heading2: "font-size: 1.5rem; font-weight: 600; line-height: 1.4",
  heading3: "font-size: 1.25rem; font-weight: 500; line-height: 1.5",
  body: "font-size: 1rem; font-weight: 400; line-height: 1.6",
  caption: "font-size: 0.875rem; font-weight: 400; line-height: 1.5",
  code: "font-family: 'JetBrains Mono', monospace; font-size: 0.875rem"
}

// Spacing
const spacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  xxl: "4rem"
}

// Animations
const animations = {
  fast: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
  normal: "250ms cubic-bezier(0.16, 1, 0.3, 1)",
  slow: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
}
```

---

## Frontend Architecture & UI Design

### 1. Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                     Interview Header (50px)                        │
│  ← Back | Problem Title • Difficulty | Timer ⏱ | Status Indicator │
├───────────────────────────────┬────────────────────────────────────┤
│                               │                                    │
│    LEFT PANEL (2/3)           │      RIGHT PANEL (1/3)            │
│    - Chat Interface           │    - Problem Statement            │
│    - Typing indicators        │    - Constraints                  │
│    - Message history          │    - Examples                     │
│                               │    - Interview Protocol           │
│    TAB SWITCH: Chat/Code      │    - Real-time Score             │
│    - Code Editor              │    - Weak Areas Alert            │
│    - Test Results             │                                   │
│    - Execution Console        │                                   │
│    TAB SWITCH: Canvas         │                                   │
│    - Excalidraw Whiteboard    │                                   │
│    - Drawing Tools            │                                   │
│                               │                                   │
├───────────────────────────────┴────────────────────────────────────┤
│                    Footer: Action Buttons                          │
│        [ 📝 Notes ] [ 💾 Save ] [ ✅ Submit ] [ ⏹ End ]          │
└────────────────────────────────────────────────────────────────────┘
```

### 2. Frontend Stack

```
Framework:        Next.js 14 (App Router)
Language:         TypeScript
Styling:          Tailwind CSS + CSS Modules
Components:       shadcn/ui + custom components
State:            Zustand (lightweight)
Real-time:        Socket.IO (React hooks wrapper)
Code Editor:      Monaco Editor (VS Code)
Whiteboarding:    Excalidraw library
Animations:       Lottie + Framer Motion
Forms:            React Hook Form + Zod
HTTP:             TanStack Query (data fetching)
Notifications:    Sonner (toast library)
Date/Time:        date-fns
Charting:         Recharts (for metrics)
```

### 3. Project Structure

```
app/
├── interview/
│   ├── [id]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Main interview page
│   │   ├── _components/
│   │   │   ├── ChatPanel.tsx         # Left: Chat interface
│   │   │   ├── CodeEditor.tsx        # Tab: Monaco editor
│   │   │   ├── TestResults.tsx       # Tab: Test execution
│   │   │   ├── WhiteboardTab.tsx     # Tab: Excalidraw
│   │   │   ├── RightSidebar.tsx      # Right: Problem + metrics
│   │   │   ├── InterviewHeader.tsx   # Top header
│   │   │   ├── FooterActions.tsx     # Bottom actions
│   │   │   └── AnimatedBackground.tsx # Lottie animations
│   │   └── _hooks/
│   │       ├── useWebSocket.ts       # WebSocket connection
│   │       ├── useCodeExecution.ts   # Code runner hook
│   │       └── useInterviewState.ts  # Interview state
│   │
│   └── components/
│       ├── ChatMessage.tsx            # Individual message
│       ├── TypingIndicator.tsx        # AI typing animation
│       ├── CodeBlockPreview.tsx       # Code in chat
│       ├── ScoreCard.tsx              # Metric cards
│       ├── DifficultyBadge.tsx        # Difficulty indicator
│       └── ExecutionSpinner.tsx       # Lottie spinner

stores/
├── interviewStore.ts                  # Zustand store
├── codeStore.ts
└── chatStore.ts

types/
├── interview.ts
├── api.ts
└── ui.ts

services/
├── interviewService.ts
├── codeService.ts
└── wsService.ts
```

---

## Backend Architecture & API Design

### 1. Core Backend Stack

```
Framework:        FastAPI
Server:           Uvicorn (async)
Database:         PostgreSQL + SQLAlchemy
Cache:            Redis
Real-time:        Socket.IO (python-socketio)
Code Execution:   Docker (Piston API alternative)
AI Integration:   LangChain + OpenAI GPT-4
Task Queue:       Celery + Redis
Authentication:   JWT + OAuth2
```

### 2. API Endpoints

#### Interview Management
```
POST   /api/v1/interviews
       Request: {
         problem_id: int,
         difficulty: "easy" | "medium" | "hard",
         language: "python" | "javascript" | "java" | "cpp" | "go"
       }
       Response: {
         interview_id: str (UUID),
         problem: ProblemDTO,
         started_at: datetime,
         status: "in_progress"
       }

GET    /api/v1/interviews/{interview_id}
       Response: Full interview context with all messages

PUT    /api/v1/interviews/{interview_id}
       Request: { status: "paused" | "resumed" | "completed", notes: string }
       Response: Updated interview

DELETE /api/v1/interviews/{interview_id}
       Response: { success: true }
```

#### Code Execution
```
POST   /api/v1/interviews/{interview_id}/code/execute
       Request: {
         code: string,
         language: string,
         stdin?: string
       }
       Response: {
         execution_id: str,
         status: "queued" | "running",
         estimated_time: int (seconds)
       }

GET    /api/v1/interviews/{interview_id}/code/execute/{execution_id}
       Response: {
         status: "completed" | "running" | "error",
         output: string,
         error: string,
         execution_time_ms: int,
         memory_mb: float,
         exit_code: int
       }

POST   /api/v1/interviews/{interview_id}/code/submit
       Request: { code: string, language: string }
       Response: {
         submission_id: str,
         test_results: TestResult[],
         passed: int,
         total: int,
         score: float,
         complexity_analysis: { time: string, space: string }
       }
```

#### Problem Management
```
GET    /api/v1/problems/{problem_id}
       Response: Full problem details with test cases (hidden excluded)

GET    /api/v1/problems/{problem_id}/test-cases
       Response: Visible test cases only
```

#### Analytics (real-time during interview)
```
GET    /api/v1/interviews/{interview_id}/metrics
       Response: {
         time_spent: int,
         code_attempts: int,
         test_passes: int,
         ai_interaction_count: int,
         current_score: float,
         weak_areas: string[]
       }
```

### 3. WebSocket Events

```typescript
// Client → Server
socket.emit('message', {
  type: 'text' | 'code_block' | 'question_answer',
  content: string,
  timestamp: ISO8601
})

socket.emit('code_execution', {
  code: string,
  language: string
})

socket.emit('typing', {
  isTyping: boolean
})

socket.emit('pause_interview', {
  reason: string
})

// Server → Client (pushed to client)
socket.on('ai_token', {
  token: string,
  timestamp: ISO8601
})

socket.on('ai_message_complete', {
  message_id: str,
  full_content: string
})

socket.on('code_result', {
  execution_id: str,
  output: string,
  tests_passed: int,
  tests_total: int,
  execution_time_ms: int
})

socket.on('ai_feedback', {
  feedback_id: str,
  complexity_analysis: { time: string, space: string },
  suggestions: string[],
  strengths: string[],
  improvements: string[]
})

socket.on('interview_hint', {
  hint: string,
  difficulty_level: 'soft' | 'medium' | 'hard'
})

socket.on('user_typing', {
  isTyping: boolean
})

socket.on('connection_quality', {
  latency_ms: int,
  status: 'good' | 'fair' | 'poor'
})
```

---

## Real-time Communication (WebSocket)

### 1. Connection Flow

```python
# Backend: WebSocket Gateway
@sio.event
async def connect(sid, environ):
    """Establish WebSocket connection with JWT validation."""
    token = environ.get("QUERY_STRING").split("token=")[1]
    user_id = verify_jwt_token(token)
    
    if not user_id:
        return False
    
    interview_id = environ["PATH_INFO"].split("/")[-1]
    
    # Join exclusive room for this interview
    sio.rooms[sid] = f"interview_{interview_id}"
    
    # Emit connection success
    await sio.emit("connected", {
        "interview_id": interview_id,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }, to=sid)
    
    # Send initial AI greeting (if first message)
    asyncio.create_task(send_initial_greeting(interview_id, user_id))

@sio.event
async def disconnect(sid):
    """Clean up on disconnect."""
    interview_id = sio.rooms.get(sid)
    # Save session state to Redis
    # Mark interview as paused if not completed
    pass
```

### 2. Message Processing Pipeline

```
Frontend Message
    ↓
Socket.IO Client validates
    ↓
Backend receives event
    ↓
Authenticate & authorize
    ↓
Parse & validate schema
    ↓
Store to DB (messages table)
    ↓
If AI response needed:
  ├─ LLM processing (async)
  ├─ Stream tokens via WebSocket
  └─ Save complete response
    ↓
Emit to client via Socket.IO
    ↓
Frontend renders with Lottie animations
```

### 3. Reconnection Strategy

```typescript
// Frontend: Auto-reconnect with exponential backoff
const connectionConfig = {
  reconnection: true,
  reconnectionDelay: 1000,           // 1s initial
  reconnectionDelayMax: 5000,        // 5s maximum
  reconnectionAttempts: 10,
  reconnectionBackoffExponent: 1.5   // Exponential growth
}

// On reconnect, sync state:
1. Fetch latest messages
2. Check for missed AI responses
3. Restore code editor state
4. Resume interview if paused
```

---

## Core Features & Requirements

### 1. Chat Interface (Left Panel)

**Requirements:**
- Real-time message display with minimal latency (<100ms)
- User messages right-aligned, AI messages left-aligned
- Markdown support in AI messages
- Code blocks with syntax highlighting
- Typing indicators with Lottie animation
- Auto-scroll to latest message
- Message timestamps
- Ability to copy code blocks
- Emoji support

**Lottie Animations:**
- Typing indicator (3 bouncing dots)
- Message sent animation (subtle pop)
- Code execution in progress (spinning dots)
- Thinking/processing state (pulsing circles)
- Success/error states

**Interactions:**
```typescript
// User types and sends message
onInputChange → debounce → emit 'typing' event → show typing indicator
onSendClick → validate text → emit 'message' event → clear input → scroll to bottom

// AI responds
receive 'ai_token' event → append token to message → scroll to bottom
receive 'ai_message_complete' → save to store → trigger Lottie success animation
```

### 2. Code Editor (Tab in Left Panel)

**Requirements:**
- Monaco Editor integration
- Multi-language support (Python, JavaScript, Java, C++, Go)
- Syntax highlighting & code completion
- Language dropdown selector
- Font size adjustment (12-18px)
- Theme toggle (light/dark)
- Line numbers & code folding
- Minimap (disabled by default)
- Auto-indentation & bracket matching
- Keyboard shortcuts (Ctrl+Enter to run)

**Features:**
- Autosave every 10 seconds to backend
- Local autosave to LocalStorage for UX
- Restore last submitted code on page reload
- Display character count
- Highlight syntax errors

**Lottie:**
- Loading spinner while executing
- Success checkmark on test pass
- Error X on test fail

### 3. Test Results Panel (Tab in Left Panel)

**Requirements:**
- Display test case results in real-time
- Show pass/fail status per test
- Display expected vs actual output
- Show execution time & memory usage
- Collapse/expand individual tests
- Summary card: "X/Y tests passed"
- Score calculation display

**Interactivity:**
- Click test to highlight in code
- Copy output button
- Re-run specific test button

### 4. Whiteboard Canvas (Tab in Left Panel)

**Requirements:**
- Excalidraw embedded for system design discussions
- Drawing tools: pen, rectangle, circle, line, text, arrow
- Save diagram as JSON to backend
- Load previous diagrams
- AI can analyze drawn diagrams
- Export as PNG/SVG

**Features:**
- Grid/snap-to-grid option
- Zoom in/out
- Pan canvas
- Undo/redo
- Clear canvas
- Toggle dark mode

### 5. Right Sidebar

**Components:**

**a) Problem Statement**
- Problem title & description
- Difficulty indicator (Easy/Medium/Hard)
- Category tags (Arrays, Graphs, DP, etc.)
- Constraints list
- Example input/output (collapsible)

**b) Interview Protocol**
- Timer: elapsed time
- Status: In Progress / Paused / Completed
- Current step indicator (Discuss → Code → Test → Submit)
- Hints available counter
- AI feedback status

**c) Real-time Metrics**
- Current score (0-100%)
- Test pass rate (X/Y)
- Code attempts
- Time spent
- Weak areas (if identified)

**Design:**
- Sticky position (stays visible while scrolling)
- Card-based layout with subtle shadows
- Color-coded status indicators
- Smooth number animations

### 6. Header & Footer

**Header:**
- Back button (with unsaved warning)
- Problem title
- Difficulty badge
- Timer with warning at 5 min remaining
- Connection status indicator (with ping indicator)
- User avatar + name

**Footer:**
- Notes button (open note modal)
- Save progress button
- Submit solution button
- End interview button
- Help button (opens hints modal)

---

## UI Components Detailed Specification

### 1. ChatMessage Component

```typescript
interface ChatMessageProps {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  isStreaming?: boolean
  hasCodeBlock?: boolean
  onCopyCode?: (code: string) => void
}

// Rendering:
- User message: Right-aligned, blue bubble, rounded
- AI message: Left-aligned, gray bubble, rounded
- Streaming indicator: Lottie typing animation
- Code blocks: Syntax highlighted with copy button
- Links: Clickable & colored
- Markdown: Full support (bold, italic, lists, etc.)
- Emoji: Rendered as images for consistency
```

### 2. CodeEditor Component

```typescript
interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  onRun: (code: string) => void
  isRunning?: boolean
  hasError?: boolean
  errorMessage?: string
}

// Features:
- Integrated Monaco Editor
- Language selector dropdown
- Run button with keyboard shortcut indicator
- Submit button for final submission
- Character count
- Autosave indicator (subtle dot)
- Undo/redo buttons
```

### 3. TestResults Component

```typescript
interface TestResultsProps {
  results: TestResult[]
  totalPassed: number
  totalTests: number
  isLoading?: boolean
  executionTimeMs?: number
  memoryMb?: number
}

interface TestResult {
  id: string
  testNumber: number
  passed: boolean
  input: string
  expectedOutput: string
  actualOutput: string
  executionTimeMs: number
}

// Rendering:
- Summary card at top: "3/5 tests passed - 85%"
- List of individual tests (collapsible)
- Green for passed, red for failed
- "Expected vs Actual" comparison view
- Lottie success/error animations
```

### 4. TypingIndicator Component

```typescript
// Lottie animation
- Three dots bouncing up and down
- Color: primary color (0066FF)
- Duration: 800ms
- Repeating animation
- Size: 16px × 16px
- Positioned inline in chat bubble
```

### 5. InterviewMetrics Component

```typescript
interface InterviewMetricsProps {
  timeSpent: number
  codeAttempts: number
  testsPassed: number
  testTotal: number
  currentScore: number
  hints: string[]
}

// Rendering:
- Each metric as individual card
- Number animations (count up effect)
- Icons next to each metric
- Progress bar for test results
- Color-coded score (green >80%, yellow 60-80%, red <60%)
```

---

## Animation & Interaction Design

### 1. Lottie Animation Library

```typescript
// Installation
npm install lottie-react

// Usage in components
import Lottie from 'lottie-react'
import typingAnimation from '@/animations/typing.json'

export function TypingIndicator() {
  return (
    <Lottie 
      animationData={typingAnimation}
      loop
      autoplay
      style={{ width: 40, height: 40 }}
    />
  )
}

// Required animations:
1. typing.json - 3 bouncing dots
2. code-executing.json - Spinning code symbol
3. success.json - Checkmark with celebration
4. error.json - X with shake effect
5. loading.json - Generic spinner
6. message-sent.json - Paper plane
7. thinking.json - Lightbulb with glow
8. connected.json - Connected nodes/pulse
```

### 2. Framer Motion Integration

```typescript
// Smooth transitions for message entry
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <ChatMessage message={message} />
</motion.div>

// Score number animation
<motion.div
  key={score}
  initial={{ scale: 1.2, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
>
  {score}%
</motion.div>

// Tab switch animation
<motion.div
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 10 }}
>
  {/* Tab content */}
</motion.div>
```

### 3. Interaction Microanimations

```
Input focus: Border color change + subtle glow
Button hover: Scale 1.05 + shadow increase
Button click: Scale 0.95 + feedback animation
Message received: Slide in + fade in
Code execution start: Spinner appears
Code execution end: Result slides in
Error state: Red border + shake animation
Success state: Green checkmark + confetti (light)
```

---

## Data Models & API Contracts

### 1. Interview Model

```python
class Interview(Base):
    __tablename__ = "interviews"
    
    id: Mapped[UUID] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id"))
    
    status: Mapped[str]  # in_progress, paused, completed, abandoned
    difficulty: Mapped[str]  # easy, medium, hard
    language: Mapped[str]  # python, javascript, java, cpp, go
    
    started_at: Mapped[datetime] = mapped_column(default=func.now())
    paused_at: Mapped[datetime | None]
    ended_at: Mapped[datetime | None]
    
    final_code: Mapped[str | None]
    final_score: Mapped[float | None]  # 0-100
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="interviews")
    problem: Mapped["Problem"] = relationship(back_populates="interviews")
    messages: Mapped[list["Message"]] = relationship(back_populates="interview")
    submissions: Mapped[list["CodeSubmission"]] = relationship(back_populates="interview")
    
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
```

### 2. Message Model

```python
class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[UUID] = mapped_column(primary_key=True)
    interview_id: Mapped[UUID] = mapped_column(ForeignKey("interviews.id"))
    
    role: Mapped[str]  # user, ai, system
    content: Mapped[str]
    content_type: Mapped[str]  # text, code, hint, feedback
    
    # For code blocks in chat
    code_language: Mapped[str | None]
    code_snippet: Mapped[str | None]
    
    # Metadata
    is_streaming: Mapped[bool] = mapped_column(default=False)
    token_count: Mapped[int | None]
    
    timestamp: Mapped[datetime] = mapped_column(default=func.now())
    created_at: Mapped[datetime] = mapped_column(default=func.now())
```

### 3. CodeSubmission Model

```python
class CodeSubmission(Base):
    __tablename__ = "code_submissions"
    
    id: Mapped[UUID] = mapped_column(primary_key=True)
    interview_id: Mapped[UUID] = mapped_column(ForeignKey("interviews.id"))
    
    code: Mapped[str]
    language: Mapped[str]
    
    # Execution results
    execution_status: Mapped[str]  # success, error, timeout, memory_exceeded
    stdout: Mapped[str | None]
    stderr: Mapped[str | None]
    exit_code: Mapped[int | None]
    
    execution_time_ms: Mapped[int | None]
    memory_mb: Mapped[float | None]
    
    # Test results
    tests_passed: Mapped[int]
    tests_total: Mapped[int]
    score: Mapped[float]  # 0-100
    
    # AI Analysis
    complexity_time: Mapped[str | None]  # O(n), O(n^2), etc.
    complexity_space: Mapped[str | None]
    ai_feedback: Mapped[str | None]
    
    submitted_at: Mapped[datetime] = mapped_column(default=func.now())
```

### 4. Pydantic Schemas (Frontend contracts)

```python
# Request schemas
class InterviewCreateRequest(BaseModel):
    problem_id: int
    difficulty: Literal["easy", "medium", "hard"]
    language: Literal["python", "javascript", "java", "cpp", "go"]

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""

class MessageSendRequest(BaseModel):
    type: Literal["text", "code_block"]
    content: str
    code_language: Optional[str] = None

# Response schemas
class InterviewDTO(BaseModel):
    id: UUID
    status: str
    problem_id: int
    language: str
    started_at: datetime
    current_score: float | None
    messages_count: int

class MessageDTO(BaseModel):
    id: UUID
    role: str
    content: str
    content_type: str
    timestamp: datetime
    code_snippet: Optional[str] = None

class CodeExecutionResultDTO(BaseModel):
    execution_id: UUID
    status: str
    output: str
    error: Optional[str]
    execution_time_ms: int
    memory_mb: float
    tests_passed: int
    tests_total: int
    score: float
```

---

## Performance & Optimization

### 1. Frontend Optimizations

```typescript
// Code splitting by route
const ChatPanel = dynamic(() => import('./ChatPanel'), { loading: () => <Skeleton /> })
const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false })
const Whiteboard = dynamic(() => import('./Whiteboard'), { ssr: false })

// Message virtualization for long chats
import { FixedSizeList } from 'react-window'

// Lazy load Lottie animations
const typingAnimation = await import('@/animations/typing.json')

// Memoize components to prevent unnecessary re-renders
const ChatMessage = memo(({ message }) => { ... })
const TestResult = memo(({ result }) => { ... })

// WebSocket message debouncing
const debouncedTyping = useDebouncedCallback(() => {
  socket.emit('typing', { isTyping: false })
}, 1000)

// Code execution polling optimization
// Poll every 500ms but max 10 times (5 seconds total)
const pollCount = useRef(0)
const maxPolls = 10
```

### 2. Backend Optimizations

```python
# Connection pooling
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    pool_recycle=3600,
    pool_pre_ping=True
)

# Caching for problems
@cache_ttl(hours=24)
async def get_problem(problem_id: int):
    return await db.fetch(Problem).filter_by(id=problem_id)

# Message batching for WebSocket
# Send batch every 100ms instead of per token
class MessageBatcher:
    def __init__(self, interval=0.1):
        self.buffer = []
        self.interval = interval
    
    async def add_token(self, token: str):
        self.buffer.append(token)
        if len(self.buffer) >= 50:  # Send every 50 tokens
            await self.flush()
    
    async def flush(self):
        if self.buffer:
            await sio.emit("ai_tokens_batch", {
                "tokens": "".join(self.buffer)
            })
            self.buffer = []
```

### 3. Metrics

- **Chat message latency:** <50ms (local echo + server confirmation)
- **WebSocket message throughput:** 1000+ msgs/sec per connection
- **Code execution response:** <6s (including queue + execution + feedback)
- **Page load time:** <2s (with code splitting)
- **Animation frame rate:** 60 FPS (Lottie optimized)
- **Memory usage:** <50MB per session
- **Bundle size:** <400KB (gzipped)

---

## Accessibility & UX

### 1. Accessibility Requirements (WCAG 2.1 AA)

```typescript
// Semantic HTML
<section aria-label="Chat interface">
  <div role="log" aria-live="polite" aria-atomic="false">
    {/* Messages */}
  </div>
</section>

// Keyboard navigation
- Tab: Move between inputs/buttons
- Enter: Send message / Execute code
- Escape: Close modals
- Ctrl+K: Focus search
- Ctrl+Enter: Submit solution

// Color contrast
- All text: 4.5:1 ratio minimum
- Buttons: 3:1 ratio minimum
- Focus indicators: Visible on all interactive elements

// Screen reader support
- aria-labels on all buttons
- aria-live regions for real-time updates
- Proper heading hierarchy
- Alternative text for code blocks
```

### 2. Error Handling & User Feedback

```typescript
// Toast notifications for all feedback
toast.success("Code executed successfully")
toast.error("Execution timeout - 5 seconds exceeded")
toast.warning("Connection unstable")
toast.info("New feedback from AI")

// Loading states
// Always show:
- Skeleton screens for initial load
- Spinning animation during code execution
- "AI is thinking..." message
- Progress indicator for long operations

// Error states
- Show error message in toast
- Display retry button
- Log to Sentry for debugging
- Provide user action: "Try a different approach" or "Get hint"
```

### 3. Mobile Responsiveness

```css
/* Breakpoints */
- Mobile: < 640px
  → Single column (stack vertically)
  → Chat full width, code editor in modal
  → Bottom sheet for actions
  
- Tablet: 640px - 1024px
  → 2 columns with scrollable panels
  → Code editor 50% width
  
- Desktop: > 1024px
  → 3 sections (chat | code | sidebar)
  → Optimal spacing

/* Mobile-specific adjustments */
- Larger touch targets (48px minimum)
- Simplified whiteboard (draw only)
- Collapsible panels
- Bottom action bar instead of footer
```

---

## Technical Implementation Details

### 1. Frontend Setup

```bash
# Create project
npx create-next-app@latest --typescript --tailwind --eslint

# Install dependencies
npm install \
  @shadcn-ui/react \
  zustand \
  @tanstack/react-query \
  socket.io-client \
  react-hook-form \
  zod \
  lottie-react \
  framer-motion \
  @monaco-editor/react \
  excalidraw \
  recharts \
  sonner \
  date-fns \
  axios

# Development
npm run dev
```

### 2. Backend Setup

```bash
# Create project
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install \
  fastapi==0.104.0 \
  uvicorn==0.24.0 \
  sqlalchemy==2.0.23 \
  asyncpg==0.29.0 \
  python-socketio==5.10.0 \
  aioredis==2.0.1 \
  langchain==0.1.0 \
  openai==1.3.0 \
  pydantic==2.5.0 \
  python-jose==3.3.0 \
  passlib==1.7.4

# Run
uvicorn main:app --reload
```

### 3. Docker for Code Execution

```dockerfile
# Dockerfile for code sandbox
FROM python:3.11-slim

WORKDIR /sandbox

# Install runtime for all languages
RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    openjdk-17-jre \
    g++ \
    golang-go

COPY code.py /sandbox/code.py

# Execute with timeout
RUN timeout 5s python3 code.py
```

### 4. WebSocket Initialization

```typescript
// Frontend
const useWebSocket = (interviewId: string) => {
  const socketRef = useRef<Socket | null>(null)
  
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const socket = io(`${API_URL}/interview`, {
      auth: { token },
      query: { interview_id: interviewId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    })
    
    socket.on('connected', (data) => {
      console.log('Connected to interview', data)
    })
    
    socket.on('ai_token', (data) => {
      // Handle streaming token
    })
    
    socketRef.current = socket
    
    return () => socket.disconnect()
  }, [interviewId])
  
  return socketRef.current
}
```

---

## Success Metrics

### 1. Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Chat message latency | <50ms | TBD | 🟡 |
| Code execution time | <6s | TBD | 🟡 |
| Page load time | <2s | TBD | 🟡 |
| Animation FPS | 60fps | TBD | 🟡 |
| WebSocket latency | <100ms | TBD | 🟡 |
| Error rate | <1% | TBD | 🟡 |

### 2. User Experience Metrics

| Metric | Target | Target Value |
|--------|--------|--------------|
| User retention | 7-day | >60% |
| Session completion rate | % completing interviews | >75% |
| Average session duration | minutes | 30-45 min |
| User satisfaction | NPS score | >50 |
| Feature adoption | % using code editor | >90% |
| Feature adoption | % using whiteboard | >40% |

### 3. Technical Metrics

| Metric | Target | Target Value |
|--------|--------|--------------|
| Concurrent users | simultaneous | 500+ |
| Uptime | availability | 99.5%+ |
| Code execution success | % success | >99% |
| AI feedback generation | avg time | <10s |
| Database query time | P95 latency | <300ms |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ Chat interface with WebSocket
- ✅ Message display with Lottie animations
- ✅ Basic problem display
- ✅ Backend API structure

### Phase 2: Code Execution (Week 2)
- ✅ Monaco Editor integration
- ✅ Docker sandbox setup
- ✅ Test case execution
- ✅ Results display with animations

### Phase 3: Polish (Week 3)
- ✅ Whiteboard integration
- ✅ Metrics dashboard
- ✅ UI/UX refinements
- ✅ Performance optimization

### Phase 4: Launch (Week 4)
- ✅ Testing & QA
- ✅ Deployment to production
- ✅ Monitoring & alerts
- ✅ User feedback collection

---

## Conclusion

This PRD provides a comprehensive blueprint for building a modern, responsive, and engaging AI Interview Coach experience. The combination of real-time WebSocket communication, beautiful Lottie animations, and powerful backend infrastructure creates an interactive platform that feels natural and delightful to use.

**Key Differentiators:**
1. **Modern UI** - Glassmorphism, smooth animations, dark mode
2. **Real-time** - Sub-100ms WebSocket communication
3. **Accessible** - Full WCAG 2.1 AA compliance
4. **Performant** - Optimized code execution and rendering
5. **Scalable** - Supports 500+ concurrent users
6. **Engaging** - Lottie animations and microinteractions throughout

---

**Document Length:** 3,200+ words  
**Next Steps:** 
1. Design team creates Figma mockups
2. Backend team implements API contracts
3. Frontend team builds components
4. Integration testing across WebSocket
5. Performance profiling & optimization

**Ready to build! 🚀**
