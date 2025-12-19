# AI Interview Coach - Complete Product Requirements Document (PRD)

**Document Version:** 3.0 (Complete Integrated PRD)  
**Status:** Ready for Full-Stack Implementation  
**Date:** December 2025  
**Last Updated:** December 13, 2025  
**Audience:** Product Managers, Designers, Full-Stack Engineers, DevOps Engineers

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [Architecture Overview](#architecture-overview)
4. [User Experience & Interview Section Design](#user-experience--interview-section-design)
5. [Backend System Architecture](#backend-system-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Core Features & Requirements](#core-features--requirements)
8. [Database Models & Schema](#database-models--schema)
9. [API Specification](#api-specification)
10. [WebSocket Communication](#websocket-communication)
11. [Services & Business Logic](#services--business-logic)
12. [Project Structure](#project-structure)
13. [Technology Stack](#technology-stack)
14. [Development Setup & Environment](#development-setup--environment)
15. [Testing Strategy](#testing-strategy)
16. [Performance & Optimization](#performance--optimization)
17. [Security & Compliance](#security--compliance)
18. [Configuration & Feature Flags](#configuration--feature-flags)
19. [Success Metrics & KPIs](#success-metrics--kpis)
20. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

**AI Interview Coach** is a full-stack web application designed to help software engineers prepare for technical interviews through AI-powered mock sessions. The platform combines real-time WebSocket communication, intelligent LLM-powered feedback, adaptive drill generation, and comprehensive analytics into a seamless learning experience.

### Core Value Proposition

- **AI-Powered Interviews**: Practice with adaptive questions powered by GPT-4o or Claude 3.5
- **Real-time Feedback**: Get instant, structured feedback with scores and actionable suggestions
- **Adaptive Learning**: System automatically generates follow-up exercises based on identified weaknesses
- **Comprehensive Analytics**: Track progress, identify skill gaps, and measure improvement over time
- **Multi-modal Support**: Text responses, audio transcription, code execution, and system design whiteboarding

### Key Statistics

| Metric | Target | Status |
|--------|--------|--------|
| User Retention (7-day) | >60% | Planning |
| Session Completion Rate | >75% | Planning |
| Feedback Generation Latency | <30s | Target |
| WebSocket Connection Stability | >99.5% | Target |
| Concurrent Users Supported | 500+ | Target |
| System Uptime | 99.5% | Target |

---

## Product Vision & Goals

### Mission

Democratize access to expert-level interview coaching by providing AI-powered, personalized preparation that adapts to each user's unique learning needs.

### Product Goals

1. **Increase User Success Rate**: 80% of users complete at least 10 interview sessions within 30 days
2. **Improve Offer Success**: 70% of active users report increased offer callback rate
3. **Build Habit**: 40% of users maintain weekly practice habit after first month
4. **User Engagement**: Average session completion time of 30-45 minutes
5. **System Reliability**: Maintain 99.5%+ uptime with <100ms WebSocket latency

### Target Users

- **Primary**: Software engineers preparing for FAANG interviews (23-35 years old, mid-senior level)
- **Secondary**: Bootcamp graduates, career switchers entering tech
- **Tertiary**: College students preparing for campus placements, internationals preparing for tech hubs

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Next.js 16 Frontend (TypeScript)                            │  │
│  │  - Real-time Chat with WebSocket                             │  │
│  │  - Monaco Code Editor                                        │  │
│  │  - Excalidraw Whiteboard                                     │  │
│  │  - Lottie Animations & Framer Motion                         │  │
│  │  - shadcn/ui Components                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  REST API + WebSocket                                        │  │
│  │  - Authentication & Authorization                            │  │
│  │  - Rate Limiting & CORS                                      │  │
│  │  - Request Validation                                        │  │
│  │  - Exception Handling                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Session Svc  │  │   LLM Svc    │  │  Drill Svc   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Feedback Svc │  │Transcription │  │  User Svc    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA & CACHING LAYER                              │
│  ┌──────────────────────┐         ┌──────────────────────┐         │
│  │   PostgreSQL 15+     │         │   Redis 7+           │         │
│  │  - Relational Data   │         │  - Session Cache     │         │
│  │  - User Progress     │         │  - WebSocket Rooms   │         │
│  │  - Interview Records │         │  - Rate Limits       │         │
│  │  - Feedback History  │         │  - Temporary Tasks   │         │
│  └──────────────────────┘         └──────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  OpenAI API  │  │ Anthropic    │  │ OAuth2       │              │
│  │ (GPT-4o)     │  │ (Claude 3.5) │  │ (Google/GH)  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │ Docker Exec  │  │ Monitoring   │                               │
│  │ (Piston)     │  │ (DataDog)    │                               │
│  └──────────────┘  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Interview Session Flow:
═════════════════════════════════════════════════════════════════════

1. USER INITIATES SESSION
   ├─ Selects topic, difficulty, role
   ├─ API validates user permissions & rate limits
   └─ InterviewSession created (status: CREATED)

2. AI GENERATES QUESTION
   ├─ LLM Service calls GPT-4o/Claude
   ├─ Question stored in database
   └─ WebSocket sends question to client

3. USER RESPONDS
   ├─ Text response OR Audio uploaded
   ├─ Audio transcribed (if needed)
   ├─ Response stored with timestamp
   └─ Session status: AWAITING_FEEDBACK

4. USER REQUESTS FEEDBACK (202 Accepted)
   ├─ FeedbackRun created (status: PENDING)
   ├─ Background task queued
   └─ API returns polling endpoint

5. FEEDBACK GENERATION (Async)
   ├─ Background task starts
   ├─ LLM analyzes response against rubric
   ├─ Scores calculated (0-100)
   ├─ Strengths & weaknesses identified
   ├─ Suggestions generated
   └─ FeedbackRun status: COMPLETED

6. CLIENT POLLS STATUS
   ├─ GET /api/v1/feedback/{id}/status
   ├─ Returns: PENDING → PROCESSING → COMPLETED
   └─ When ready: GET /api/v1/feedback/{id}/result

7. DRILL GENERATION (Optional)
   ├─ User clicks "Generate Drills"
   ├─ DrillSet created with multiple drills
   ├─ Each drill targets specific weakness
   ├─ Drills stored with hints & expected answers
   └─ Delivered to user as Drill list

8. USER COMPLETES DRILL
   ├─ Drill marked COMPLETED
   ├─ Score recorded
   └─ Analytics updated

9. SESSION COMPLETE
   ├─ Session status: COMPLETED
   ├─ Overall score calculated
   ├─ User skills updated
   ├─ Weekly goals progressed
   └─ Dashboard updated
```

---

## User Experience & Interview Section Design

### Interview Section Overview

The Interview Section is the **core interactive feature** where users conduct mock technical interviews with AI. This is where the modern UI design, real-time WebSocket, and engaging animations come together.

### UI Layout Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              HEADER (50px)                                    │
│  ← Back | Problem: TwoSum • Medium | ⏱ Timer | 🟢 Connected  │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                   │
│    LEFT PANEL (2/3)      │    RIGHT SIDEBAR (1/3)           │
│  ┌────────────────────┐  │  ┌─────────────────────────────┐ │
│  │   CHAT INTERFACE   │  │  │  PROBLEM STATEMENT          │ │
│  │  ────────────────  │  │  │  - Title & Difficulty       │ │
│  │  AI: "Hello..."    │  │  │  - Constraints              │ │
│  │  🤖 typing...      │  │  │  - Examples                 │ │
│  │                    │  │  │  - Input/Output             │ │
│  │  You: "Let me..."  │  │  │                             │ │
│  │  👤                │  │  │  INTERVIEW METRICS          │ │
│  │                    │  │  │  ┌─────────────────────────┐│ │
│  │  [Chat Input]      │  │  │  │ ⏱  Time: 12:34          ││ │
│  │                    │  │  │  │ ✅ Score: 75%           ││ │
│  │ TAB: Chat|Code     │  │  │  │ 🎯 Attempts: 3          ││ │
│  │                    │  │  │  │ 📊 Tests: 4/5           ││ │
│  │ ┌────────────────┐ │  │  │  └─────────────────────────┘│ │
│  │ │  CODE EDITOR   │ │  │  │                             │ │
│  │ │  Python    ↓   │ │  │  │  HINTS & FEEDBACK           │ │
│  │ │ ────────────── │ │  │  │  📝 View feedback           │ │
│  │ │ def two_sum(): │ │  │  │  💡 Get hint               │ │
│  │ │   pass         │ │  │  │  🚀 Submit solution        │ │
│  │ │                │ │  │  │                             │ │
│  │ │ [Run] [Submit] │ │  │  └─────────────────────────────┘ │
│  │ └────────────────┘ │  │                                   │
│  │                    │  │                                   │
│  │ ┌────────────────┐ │  │                                   │
│  │ │ TEST RESULTS   │ │  │                                   │
│  │ │ 4/5 passed 80% │ │  │                                   │
│  │ │ ✓ Test 1       │ │  │                                   │
│  │ │ ✓ Test 2       │ │  │                                   │
│  │ │ ✗ Test 3       │ │  │                                   │
│  │ │ ✓ Test 4       │ │  │                                   │
│  │ │ ✓ Test 5       │ │  │                                   │
│  │ └────────────────┘ │  │                                   │
│  │                    │  │                                   │
│  │ TAB: Chat|Code     │  │                                   │
│  │                    │  │                                   │
│  │ ┌────────────────┐ │  │                                   │
│  │ │ WHITEBOARD     │ │  │                                   │
│  │ │ (Excalidraw)   │ │  │                                   │
│  │ │                │ │  │                                   │
│  │ │ ┌─────┐        │ │  │                                   │
│  │ │ │  A  │────→ B │ │  │                                   │
│  │ │ └─────┘        │ │  │                                   │
│  │ └────────────────┘ │  │                                   │
│  └────────────────────┘  │                                   │
├──────────────────────────┴──────────────────────────────────┤
│              FOOTER (50px)                                    │
│  [📝 Notes] [💾 Save] [✅ Submit] [⏹ End]                   │
└──────────────────────────────────────────────────────────────┘
```

### Key UI/UX Features

**1. Real-time Chat Interface**
- Left-aligned AI messages (blue gradient bubble)
- Right-aligned user messages (green bubble)
- Typing indicator with Lottie animation (3 bouncing dots)
- Auto-scroll to latest message
- Markdown support for formatted responses
- Code blocks with syntax highlighting
- Copy button for code snippets
- Message timestamps
- Emoji support
- Character count display

**2. Code Editor Tab**
- Monaco Editor integration
- Multi-language support (Python, JS, Java, C++, Go)
- Language dropdown selector
- Line numbers & code folding
- Syntax highlighting & auto-completion
- Theme toggle (light/dark)
- Auto-save every 10 seconds (with indicator)
- Font size adjustment (12-18px)
- Character & line count
- Keyboard shortcuts (Ctrl+Enter to run)

**3. Test Results Tab**
- Summary score card (animated circular progress)
- Color-coded: Green (>80%), Yellow (60-80%), Red (<60%)
- Individual test case collapsible panels
- Expected vs Actual output comparison
- Execution time & memory usage per test
- Pass/Fail icons with animations
- Re-run specific test button

**4. Whiteboard Tab (Excalidraw)**
- Full drawing canvas integration
- Multiple drawing tools (pen, shapes, text, arrows)
- Undo/redo functionality
- Grid snap-to-grid option
- Zoom in/out & pan
- Clear canvas button
- Save diagram to backend
- Load previous diagrams
- Export as PNG/SVG

**5. Right Sidebar - Problem Statement**
- Problem title & description
- Difficulty badge (Easy/Medium/Hard with color)
- Category tags (Arrays, Graphs, DP, etc.)
- Constraints list
- Examples (collapsible)
- Input/Output format

**6. Real-time Metrics Panel**
- Sticky position (stays visible)
- Time elapsed (MM:SS format)
- Current score (0-100%)
- Test pass rate (X/Y)
- Code attempts counter
- Weak areas alert (if identified)
- Metric cards with color gradients
- Animated number changes

**7. Animations & Interactions**
- Message entry: fade in + slide up
- Score update: scale + pop animation
- Code execution: spinner + fade in results
- Tab switching: smooth slide transition
- Button hover: scale 1.05 + shadow increase
- Button click: scale 0.95 + tactile feedback
- Error state: red border + shake animation
- Success state: checkmark + confetti (light)
- Lottie animations:
  - Typing indicator (3 bouncing dots)
  - Code executing (spinning symbol)
  - Success (checkmark)
  - Error (X with shake)
  - Loading (generic spinner)

**8. Design System**
- Dark theme (slate-900 to slate-950 gradient)
- Glassmorphism: white/10 with backdrop-blur-sm
- Color palette:
  - Primary: Blue-500 (actions, highlights)
  - Secondary: Purple-600 (AI personality)
  - Success: Green-500 (pass, executed)
  - Warning: Orange-500 (slow execution)
  - Error: Red-500 (fail, timeout)
- Typography: Jetbrains Mono for code
- Border radius: 8-12px
- Shadows: Subtle (white/10 borders)

### User Journey in Interview

```
1. SELECT PROBLEM
   ├─ Choose difficulty (Easy/Medium/Hard)
   ├─ Choose category (Arrays, Graphs, etc.)
   ├─ Click "Start Interview"
   └─ Session created

2. READ PROBLEM
   ├─ AI greets user in chat
   ├─ Problem displayed in right sidebar
   ├─ User reads constraints & examples
   └─ User can ask clarifying questions in chat

3. DISCUSS APPROACH
   ├─ User types approach in chat
   ├─ AI provides feedback/hints
   ├─ User can refine approach
   └─ Repeat until ready to code

4. WRITE CODE
   ├─ User switches to Code tab
   ├─ Selects programming language
   ├─ Writes solution in Monaco Editor
   ├─ Code auto-saves every 10 seconds
   └─ User can ask questions in chat while coding

5. RUN CODE
   ├─ User clicks "Run Code"
   ├─ Code executed in Docker sandbox
   ├─ Results displayed in Test Results tab
   ├─ User sees test results (pass/fail)
   ├─ Execution time & memory shown
   └─ User can run again with modifications

6. ITERATE
   ├─ If tests fail: modify code and re-run
   ├─ If slow: optimize code
   ├─ If stuck: chat with AI for hints
   └─ Repeat until all tests pass

7. SUBMIT SOLUTION
   ├─ User clicks "Submit Solution"
   ├─ Code stored in database
   ├─ Session marked as AWAITING_FEEDBACK
   ├─ AI message indicates feedback in progress
   └─ Time shown (typically 10-30 seconds)

8. VIEW FEEDBACK
   ├─ Feedback automatically displayed in chat
   ├─ Score shown (0-100%)
   ├─ Strengths listed
   ├─ Areas for improvement identified
   ├─ Suggestions provided
   └─ Complexity analysis (Time/Space)

9. OPTIONAL: GENERATE DRILLS
   ├─ User clicks "Generate Drills"
   ├─ System creates 3-5 follow-up exercises
   ├─ Drills target identified weaknesses
   ├─ User can start drills immediately
   └─ Drills added to dashboard

10. END SESSION
    ├─ User clicks "End Interview"
    ├─ Session marked COMPLETED
    ├─ Overall score calculated
    ├─ Time spent recorded
    ├─ Skills updated
    └─ Dashboard refreshed
```

---

## Backend System Architecture

### Clean Architecture Layers

```python
┌─────────────────────────────────────┐
│      API LAYER                      │
│  - HTTP endpoints (REST)            │
│  - WebSocket handlers               │
│  - Request/Response validation      │
│  - Status codes (200, 202, 400, etc)│
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      SERVICE LAYER                  │
│  - Business logic                   │
│  - Validation rules                 │
│  - Orchestration                    │
│  - External service calls           │
│  - Error handling                   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    REPOSITORY LAYER                 │
│  - Data access abstraction          │
│  - Query building                   │
│  - Caching logic                    │
│  - Transactions                     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    DATABASE LAYER                   │
│  - PostgreSQL                       │
│  - SQLAlchemy ORM                   │
│  - Migrations (Alembic)             │
└─────────────────────────────────────┘
```

### Service Layer Components

**1. LLM Service**
- Interfaces with OpenAI, Anthropic, or Mock providers
- Generates interview questions
- Generates feedback on responses
- Generates practice drills
- Tracks cost and token usage
- Implements retry logic
- Handles streaming responses

**2. Session Service**
- Creates and manages interview sessions
- Stores questions and responses
- Handles session status transitions
- Validates user permissions
- Implements rate limiting
- Manages WebSocket rooms

**3. Feedback Service**
- Generates structured feedback from LLM
- Stores feedback in database
- Tracks generation status (PENDING → PROCESSING → COMPLETED)
- Implements polling mechanism
- Calculates scores and metrics
- Handles LLM failures with retry

**4. Drill Service**
- Generates practice drills from feedback
- Creates drill sets with multiple drills
- Tracks drill completion
- Manages drill delivery to users
- Hints delivery on demand
- Expected answer comparison

**5. Transcription Service**
- Converts audio to text (OpenAI Whisper API)
- Handles various audio formats
- Tracks transcription status
- Error handling for failed transcriptions
- Stores transcripts in database

**6. User Service**
- User registration and profile management
- Password hashing and verification
- OAuth provider integration
- User preferences and settings
- Skill tracking updates

### WebSocket Architecture

```python
┌─────────────────────────────────────────────────┐
│         WebSocket Connection Manager            │
│  (Handles all active connections)               │
└────────┬────────────────────────────────────────┘
         │
         ├─ authenticate_connection(token)
         │  └─ Verify JWT, extract user_id
         │
         ├─ create_room(interview_id)
         │  └─ Room: "interview_session_{id}"
         │
         ├─ broadcast_to_room(event_name, data)
         │  └─ Send to all clients in room
         │
         └─ handle_disconnect(connection_id)
            └─ Cleanup resources
```

**WebSocket Events**

*Client → Server:*
- `message`: User sends text message
- `code_execution`: User runs code
- `code_submit`: User submits final solution
- `typing`: User typing indicator
- `disconnect`: Client disconnect

*Server → Client:*
- `ai_token`: Stream token from AI response
- `ai_message_complete`: Full AI message ready
- `code_result`: Execution result
- `feedback`: Feedback generated
- `connection_quality`: Connection status
- `user_typing`: Other user typing (if multi-user)

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
├── (authenticated)/
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard landing
│   │   ├── layout.tsx
│   │   └── _components/
│   │       ├── QuickStats.tsx
│   │       ├── RecentSessions.tsx
│   │       ├── SkillsProgress.tsx
│   │       ├── WeeklyGoals.tsx
│   │       └── AIInsights.tsx
│   │
│   ├── interview/
│   │   ├── page.tsx              # Interview selection
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Active interview
│   │   │   ├── layout.tsx
│   │   │   └── _components/
│   │   │       ├── InterviewHeader.tsx
│   │   │       ├── ChatPanel.tsx
│   │   │       ├── CodeEditor.tsx
│   │   │       ├── TestResults.tsx
│   │   │       ├── Whiteboard.tsx
│   │   │       ├── RightSidebar.tsx
│   │   │       ├── InterviewMetrics.tsx
│   │   │       ├── FooterActions.tsx
│   │   │       └── AnimatedBackground.tsx
│   │   │
│   │   └── feedback/
│   │       ├── [feedbackId]/
│   │       └── page.tsx
│   │
│   └── drills/
│       ├── page.tsx              # Drill list
│       └── [drillId]/            # Individual drill
│
├── auth/
│   ├── signin/
│   ├── signup/
│   ├── forgot-password/
│   └── callback/                 # OAuth callback
│
├── layout.tsx                    # Root layout
└── page.tsx                      # Landing page
```

### State Management with Zustand

```typescript
// Chat State
chatStore = {
  messages: Message[],
  isAITyping: boolean,
  addMessage(),
  setIsAITyping(),
  clearMessages()
}

// Code State
codeStore = {
  code: string,
  language: string,
  isRunning: boolean,
  setCode(),
  setLanguage(),
  setIsRunning()
}

// Interview State
interviewStore = {
  interviewId: string,
  sessionStatus: string,
  metrics: InterviewMetrics,
  updateMetrics()
}

// Dashboard State
dashboardStore = {
  stats: QuickStats,
  recentSessions: Session[],
  skills: SkillProgress[],
  goals: WeeklyGoal[],
  insights: AIInsight
}
```

### Custom Hooks

```typescript
// Interview-related
useWebSocket(interviewId) → Socket connection & handlers
useCodeExecution() → Code running & result handling
useInterviewState() → Session state management
useFeedbackPolling() → Feedback status polling

// API-related
useSession() → Session CRUD operations
useFeedback() → Feedback fetching
useDrills() → Drill management
useDashboard() → Dashboard data

// Form-related
useAuthForm() → Login/signup form handling
useSessionForm() → Interview selection form
```

---

## Core Features & Requirements

### 1. Interview Sessions Feature

**Overview**: Create and conduct mock technical interviews

**Detailed Requirements**:

| Requirement | Details |
|-------------|---------|
| **Session Creation** | Select topic, difficulty (Easy/Medium/Hard), language, duration |
| **Question Generation** | LLM generates context-aware interview questions |
| **Response Capture** | Support text, audio (transcribed), code, and whiteboard responses |
| **Status Tracking** | CREATED → IN_PROGRESS → AWAITING_FEEDBACK → COMPLETED |
| **Context Preservation** | Store question context, constraints, examples |
| **Real-time Updates** | WebSocket for live question delivery |
| **Session Metadata** | Duration, start/end times, participant info |
| **Error Recovery** | Handle network disconnects, auto-save state |

**API Endpoints**:
```
POST   /api/v1/sessions                    # Create session
GET    /api/v1/sessions                    # List sessions (paginated)
GET    /api/v1/sessions/{id}               # Get session details
PATCH  /api/v1/sessions/{id}               # Update session
POST   /api/v1/sessions/{id}/submit        # Submit response
POST   /api/v1/sessions/{id}/complete      # Complete session
DELETE /api/v1/sessions/{id}               # Delete session
WS     /api/v1/websockets/{session_id}     # WebSocket connection
```

### 2. AI Feedback System

**Overview**: Generate structured feedback on interview responses

**Detailed Requirements**:

| Requirement | Details |
|-------------|---------|
| **Async Processing** | 202 Accepted response, client polls for status |
| **Structured Output** | Score, criteria scores, strengths, weaknesses, suggestions |
| **Multi-Provider** | OpenAI (GPT-4o/gpt-4o-mini), Anthropic (Claude 3.5), Mock (testing) |
| **Rubric Integration** | Evaluate against defined evaluation criteria |
| **Cost Tracking** | Monitor input/output tokens, calculate cost |
| **Timeout Handling** | Max 60 seconds for feedback generation |
| **Retry Mechanism** | Automatic retry for failed feedback (up to 3 times) |
| **Status Polling** | `PENDING` → `PROCESSING` → `COMPLETED` |
| **Error Handling** | Graceful failure, user-facing error messages |

**Feedback Structure**:
```json
{
  "overall_score": 85,
  "criterion_scores": {
    "approach": 90,
    "code_quality": 80,
    "communication": 85,
    "time_complexity": 75,
    "space_complexity": 80
  },
  "strengths": [
    "Clear problem understanding",
    "Well-structured code",
    "Good variable naming"
  ],
  "weaknesses": [
    "Missed edge case handling",
    "Could optimize space further"
  ],
  "suggestions": [
    "Consider handling null inputs",
    "Implement memoization for optimization"
  ],
  "detailed_feedback": "## Summary\n\nGreat work on this solution..."
}
```

**API Endpoints**:
```
POST   /api/v1/feedback/sessions/{id}/feedback    # Request feedback (202)
GET    /api/v1/feedback/{id}                      # Get feedback details
GET    /api/v1/feedback/{id}/status               # Poll feedback status
GET    /api/v1/feedback/{id}/result               # Get feedback result
GET    /api/v1/feedback                           # List feedback runs
POST   /api/v1/feedback/{id}/retry                # Retry failed feedback
```

### 3. Adaptive Drill Generation

**Overview**: Auto-generate practice exercises based on feedback

**Detailed Requirements**:

| Requirement | Details |
|-------------|---------|
| **Trigger** | User clicks "Generate Drills" after feedback |
| **Drill Types** | Practice questions, code exercises, concept reviews, scenarios |
| **Targeting** | Each drill targets specific weakness identified in feedback |
| **Difficulty Ramping** | Progressive difficulty from feedback weaknesses |
| **Delivery** | Drills added to user's drill list, sortable by due date |
| **Hints** | Available on-demand, don't give away answer |
| **Expected Answers** | Stored for verification & scoring |
| **Sequencing** | Ordered for optimal learning progression |
| **Status** | PENDING → IN_PROGRESS → COMPLETED |
| **Skip Option** | Users can skip drills they don't need |

**Drill Structure**:
```json
{
  "id": 123,
  "title": "Handle edge cases in two-sum",
  "prompt": "Solve two-sum with duplicate values...",
  "drill_type": "code_exercise",
  "difficulty": "medium",
  "target_weakness": "edge_case_handling",
  "expected_answer": "def twoSum(nums, target):\n...",
  "hints": ["Consider duplicates", "Think about boundary conditions"],
  "status": "pending"
}
```

**API Endpoints**:
```
POST   /api/v1/drills/feedback/{id}/drills    # Generate drills (202)
GET    /api/v1/drills/feedback/{id}           # Get drills for feedback
GET    /api/v1/drills                         # List user drills
GET    /api/v1/drills/pending                 # Get pending drills
GET    /api/v1/drills/{id}                    # Get drill details
GET    /api/v1/drills/{id}/hints              # Get drill with hints
POST   /api/v1/drills/{id}/start              # Start drill
POST   /api/v1/drills/{id}/submit             # Submit drill response
POST   /api/v1/drills/{id}/complete           # Complete drill
POST   /api/v1/drills/{id}/skip               # Skip drill
```

### 4. Dashboard & Analytics

**Overview**: Comprehensive user progress tracking

**Components**:

| Component | Purpose | Data |
|-----------|---------|------|
| **Quick Stats** | Overview metrics | Overall score, problems solved, streak, time invested |
| **Recent Sessions** | Last 5-10 sessions | Session date, topic, score, duration |
| **Skills Progress** | Track improvement | Skills rated: areas to improve, strengths, progress |
| **Weekly Goals** | Track goals | 5-6 weekly goals with progress bars |
| **AI Insights** | Recommendations | LLM-generated personalized insights |

**API Endpoints**:
```
GET    /api/v1/dashboard/stats               # Quick statistics
GET    /api/v1/dashboard/recent-sessions     # Recent sessions
GET    /api/v1/dashboard/skills              # Skills progress
GET    /api/v1/dashboard/goals               # Weekly goals
GET    /api/v1/dashboard/ai-insight          # AI-generated insight
```

### 5. Authentication & Authorization

**Overview**: Secure user authentication

**Methods**:
- Email/password
- OAuth (Google, GitHub)
- JWT with refresh tokens
- Password reset via email

**API Endpoints**:
```
POST   /api/v1/auth/signup                   # Register
POST   /api/v1/auth/signin                   # Login
POST   /api/v1/auth/refresh                  # Refresh token
POST   /api/v1/auth/logout                   # Logout
GET    /api/v1/auth/me                       # Current user
POST   /api/v1/auth/forgot-password          # Request reset
POST   /api/v1/auth/reset-password           # Reset password
GET    /api/v1/oauth/google                  # Google OAuth
GET    /api/v1/oauth/github                  # GitHub OAuth
GET    /api/v1/oauth/callback                # OAuth callback
```

---

## Database Models & Schema

### Core Models

#### User Model
```python
id: UUID (PK)
full_name: String
email: String (unique)
hashed_password: String (nullable for OAuth)
is_active: Boolean (default: true)
is_superuser: Boolean (default: false)
provider: String (email/google/github)
provider_id: String (nullable)
created_at: DateTime
updated_at: DateTime
last_login_at: DateTime (nullable)

# Relations
interviews: InterviewSession[]
feedback_runs: FeedbackRun[]
drills: Drill[]
skills: UserSkill[]
goals: WeeklyGoal[]
```

#### InterviewSession Model
```python
id: UUID (PK)
user_id: UUID (FK)
topic: String (e.g., "Two Sum")
difficulty: Enum (EASY, MEDIUM, HARD)
language: String (python, javascript, java, cpp, go)
score: Integer (0-100, nullable)
duration_minutes: Integer (nullable)
status: Enum (CREATED, IN_PROGRESS, AWAITING_FEEDBACK, COMPLETED, CANCELLED)
role: String (nullable - e.g., "backend engineer")
skill_targets: JSON (nullable)
question: Text (nullable)
question_context: Text (nullable)
response_text: Text (nullable)
response_audio_url: String (nullable)
transcript: Text (nullable)
transcript_status: Enum (PENDING, COMPLETED, FAILED)
session_metadata: JSON (nullable)
started_at: DateTime
completed_at: DateTime (nullable)
created_at: DateTime
updated_at: DateTime

# Relations
feedback_runs: FeedbackRun[]
messages: Message[]
```

#### FeedbackRun Model
```python
id: UUID (PK)
session_id: UUID (FK)
rubric_id: Integer (FK, nullable)
status: Enum (PENDING, PROCESSING, COMPLETED, FAILED)
model_name: String (e.g., "gpt-4o")
model_version: String (nullable)
prompt_id: String (nullable)
prompt_version: String (nullable)
overall_score: Integer (0-100, nullable)
criterion_scores: JSON (nullable - {criterion: score})
strengths: JSON (nullable - ["strength1", "strength2"])
weaknesses: JSON (nullable)
suggestions: JSON (nullable)
detailed_feedback: Text (nullable)
safety_flags: JSON (nullable)
content_filtered: Boolean
refusal_reason: String (nullable)
latency_ms: Integer (nullable)
input_tokens: Integer (nullable)
output_tokens: Integer (nullable)
total_cost_usd: Float (nullable)
error_message: Text (nullable)
retry_count: Integer (default: 0)
created_at: DateTime
started_at: DateTime (nullable)
completed_at: DateTime (nullable)

# Relations
session: InterviewSession
drills: Drill[]
```

#### Drill Model
```python
id: UUID (PK)
feedback_run_id: UUID (FK)
user_id: UUID (FK)
title: String
prompt: Text
drill_type: Enum (PRACTICE_QUESTION, CODE_EXERCISE, CONCEPT_REVIEW, MOCK_SCENARIO)
difficulty: Enum (EASY, MEDIUM, HARD)
target_weakness: String (nullable)
target_skill: String (nullable)
expected_answer: Text (nullable)
hints: JSON (nullable - ["hint1", "hint2"])
status: Enum (PENDING, IN_PROGRESS, COMPLETED, SKIPPED)
is_delivered: Boolean
user_response: Text (nullable)
score: Integer (0-100, nullable)
sequence_order: Integer
created_at: DateTime
started_at: DateTime (nullable)
completed_at: DateTime (nullable)

# Relations
feedback_run: FeedbackRun
user: User
```

#### EvaluationRubric Model
```python
id: Integer (PK)
name: String
version: String
category: Enum (SYSTEM_DESIGN, BEHAVIORAL, CODING, TECHNICAL, COMMUNICATION)
description: Text (nullable)
criteria: JSON (structured evaluation criteria)
max_score: Integer
passing_score: Integer
is_active: Boolean (default: true)
created_at: DateTime
updated_at: DateTime
```

#### Skill Model
```python
id: Integer (PK)
name: String (unique)
description: String (nullable)
category: String (nullable - e.g., "algorithms", "system-design")
created_at: DateTime
```

#### UserSkill Model
```python
id: UUID (PK)
user_id: UUID (FK)
skill_id: Integer (FK)
progress: Integer (0-100)
previous_progress: Integer (nullable)
is_strength: Boolean
created_at: DateTime
updated_at: DateTime

# Relations
user: User
skill: Skill
```

#### WeeklyGoal Model
```python
id: UUID (PK)
user_id: UUID (FK)
label: String (e.g., "Complete 5 interviews")
current: Integer
total: Integer
priority: Enum (HIGH, MEDIUM, LOW)
is_completed: Boolean (default: false)
week_number: Integer
year: Integer
created_at: DateTime
updated_at: DateTime

# Relations
user: User
```

#### Message Model
```python
id: UUID (PK)
session_id: UUID (FK)
role: Enum (USER, AI, SYSTEM)
content: Text
content_type: Enum (TEXT, CODE_BLOCK, FEEDBACK)
code_language: String (nullable - python, javascript, etc.)
code_snippet: Text (nullable)
is_streaming: Boolean
token_count: Integer (nullable)
timestamp: DateTime

# Relations
session: InterviewSession
```

### Database Diagram

```
User
├── id (PK)
├── full_name
├── email (unique)
├── hashed_password
└── (OAuth fields)

    ├─→ InterviewSession (1:M)
    │   ├── id (PK)
    │   ├── user_id (FK)
    │   ├── topic, difficulty
    │   ├── score, status
    │   ├── question, response
    │   └── timestamps
    │
    │   ├─→ FeedbackRun (1:M)
    │   │   ├── id (PK)
    │   │   ├── session_id (FK)
    │   │   ├── status (PENDING/PROCESSING/COMPLETED)
    │   │   ├── overall_score
    │   │   ├── criterion_scores
    │   │   ├── feedback (detailed)
    │   │   └── cost tracking
    │   │
    │   │   └─→ Drill (1:M)
    │   │       ├── id (PK)
    │   │       ├── feedback_run_id (FK)
    │   │       ├── title, prompt
    │   │       ├── drill_type
    │   │       ├── target_weakness
    │   │       ├── expected_answer, hints
    │   │       └── status (PENDING/COMPLETED)
    │   │
    │   └─→ Message (1:M)
    │       ├── id (PK)
    │       ├── session_id (FK)
    │       ├── role (USER/AI)
    │       ├── content
    │       └── timestamp
    │
    ├─→ UserSkill (1:M)
    │   ├── id (PK)
    │   ├── user_id (FK)
    │   ├── skill_id (FK)
    │   ├── progress (0-100)
    │   └── is_strength
    │
    └─→ WeeklyGoal (1:M)
        ├── id (PK)
        ├── user_id (FK)
        ├── label
        ├── current/total
        └── priority

EvaluationRubric
├── id (PK)
├── name, version
├── category
├── criteria (JSON)
└── scoring rules

Skill
├── id (PK)
├── name (unique)
├── category
└── (linked via UserSkill)
```

---

## API Specification

### Authentication Endpoints

#### POST /api/v1/auth/signup
```json
Request:
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "agree_to_terms": true
}

Response (201):
{
  "id": "user-uuid",
  "email": "john@example.com",
  "full_name": "John Doe",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}

Error (400):
{
  "detail": "Email already registered"
}
```

#### POST /api/v1/auth/signin
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}

Error (401):
{
  "detail": "Invalid credentials"
}
```

#### POST /api/v1/auth/refresh
```json
Request Header:
{
  "Authorization": "Bearer <refresh_token>"
}

Response (200):
{
  "access_token": "new-token-eyJhbGc...",
  "token_type": "bearer"
}

Error (401):
{
  "detail": "Invalid refresh token"
}
```

### Sessions Endpoints

#### POST /api/v1/sessions
```json
Request:
{
  "topic": "Two Sum",
  "difficulty": "MEDIUM",
  "language": "python",
  "role": "backend engineer"
}

Response (201):
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "topic": "Two Sum",
  "difficulty": "MEDIUM",
  "status": "CREATED",
  "started_at": "2025-12-13T19:38:00Z",
  "question": null
}

Error (429):
{
  "detail": "Rate limit exceeded: 10 sessions per day"
}
```

#### GET /api/v1/sessions
```json
Request Query:
?page=1&limit=10&status=COMPLETED&sort=-started_at

Response (200):
{
  "items": [
    {
      "id": "session-uuid",
      "topic": "Two Sum",
      "difficulty": "MEDIUM",
      "score": 85,
      "status": "COMPLETED",
      "duration_minutes": 25,
      "started_at": "2025-12-13T19:38:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

#### POST /api/v1/sessions/{id}/submit
```json
Request:
{
  "response": "Here's my solution...",
  "response_type": "text" // or "audio"
}

Response (200):
{
  "id": "session-uuid",
  "status": "AWAITING_FEEDBACK",
  "message": "Response submitted. Generating feedback..."
}
```

### Feedback Endpoints

#### POST /api/v1/feedback/sessions/{id}/feedback
```json
Request: {} (empty body)

Response (202 Accepted):
{
  "feedback_id": "feedback-uuid",
  "status": "PENDING",
  "status_url": "/api/v1/feedback/feedback-uuid/status",
  "result_url": "/api/v1/feedback/feedback-uuid/result",
  "estimated_wait_seconds": 20
}
```

#### GET /api/v1/feedback/{id}/status
```json
Response (200):
{
  "feedback_id": "feedback-uuid",
  "status": "PROCESSING",
  "progress_percent": 50,
  "eta_seconds": 10
}
```

#### GET /api/v1/feedback/{id}/result
```json
Response (200):
{
  "feedback_id": "feedback-uuid",
  "status": "COMPLETED",
  "overall_score": 85,
  "criterion_scores": {
    "approach": 90,
    "code_quality": 80,
    "communication": 85,
    "time_complexity": 75,
    "space_complexity": 80
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "detailed_feedback": "# Feedback\n\n..."
}

Error (202 - not ready):
{
  "detail": "Feedback not ready yet",
  "status": "PROCESSING"
}
```

### Drills Endpoints

#### POST /api/v1/drills/feedback/{id}/drills
```json
Request: {} (empty body, feedback_id in path)

Response (202 Accepted):
{
  "drill_set_id": "drillset-uuid",
  "status": "PENDING",
  "drill_count": 4,
  "status_url": "/api/v1/drills/drillset-uuid/status"
}
```

#### GET /api/v1/drills/pending
```json
Response (200):
{
  "drills": [
    {
      "id": "drill-uuid",
      "title": "Handle edge cases",
      "drill_type": "CODE_EXERCISE",
      "difficulty": "MEDIUM",
      "target_weakness": "edge_case_handling",
      "status": "PENDING",
      "sequence_order": 1
    }
  ],
  "total": 3
}
```

#### POST /api/v1/drills/{id}/submit
```json
Request:
{
  "response": "def solution():\n  pass",
  "response_type": "code"
}

Response (200):
{
  "id": "drill-uuid",
  "status": "COMPLETED",
  "score": 85,
  "feedback": "Good approach, but..."
}
```

### Dashboard Endpoints

#### GET /api/v1/dashboard/stats
```json
Response (200):
{
  "overall_score": 78,
  "interviews_completed": 12,
  "current_streak_days": 5,
  "total_time_hours": 8.5,
  "skills_improving": 3,
  "weakest_area": "System Design",
  "strongest_area": "Algorithms"
}
```

#### GET /api/v1/dashboard/recent-sessions
```json
Response (200):
{
  "sessions": [
    {
      "id": "session-uuid",
      "topic": "Two Sum",
      "difficulty": "MEDIUM",
      "score": 85,
      "duration_minutes": 25,
      "completed_at": "2025-12-13T19:38:00Z",
      "status": "COMPLETED"
    }
  ],
  "total": 12
}
```

#### GET /api/v1/dashboard/skills
```json
Response (200):
{
  "improving": [
    {
      "name": "Arrays",
      "progress": 65,
      "previous": 60,
      "trend": "up"
    }
  ],
  "strengths": [
    {
      "name": "Strings",
      "progress": 90,
      "trend": "stable"
    }
  ],
  "areas_to_improve": [
    {
      "name": "System Design",
      "progress": 45,
      "trend": "down"
    }
  ]
}
```

---

## WebSocket Communication

### Connection Establishment

```typescript
// Client
const socket = io(`${API_URL}/interview`, {
  auth: { token: authToken },
  query: { session_id: sessionId },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
})

// Server validates connection
socket.on('connect', () => {
  // Authenticate with JWT
  // Join room: interview_session_{id}
  // Emit: 'connected' event to client
})
```

### Event Specifications

**User Message Event**
```typescript
// Client → Server
socket.emit('message', {
  type: 'text' | 'code_block' | 'question',
  content: string,
  code_language?: string,
  timestamp: ISO8601
})

// Server → All clients in room
socket.emit('user_message', {
  user_id: string,
  role: 'user' | 'ai',
  content: string,
  timestamp: ISO8601
})
```

**Code Execution Event**
```typescript
// Client → Server
socket.emit('code_execution', {
  code: string,
  language: string,
  test_input?: string,
  timeout_seconds: 5
})

// Server → Client (streaming)
socket.emit('code_result', {
  execution_id: string,
  status: 'success' | 'error' | 'timeout',
  stdout?: string,
  stderr?: string,
  tests_passed?: number,
  tests_total?: number,
  execution_time_ms: number,
  memory_mb: number
})
```

**AI Token Streaming**
```typescript
// Server → Client (multiple times)
socket.emit('ai_token', {
  token: string,
  timestamp: ISO8601
})

// Server → Client (when complete)
socket.emit('ai_message_complete', {
  message_id: string,
  full_content: string,
  timestamp: ISO8601
})
```

**Connection Quality**
```typescript
// Server → Client (periodic)
socket.emit('connection_quality', {
  latency_ms: number,
  status: 'good' | 'fair' | 'poor',
  packets_lost: number
})
```

---

## Services & Business Logic

### LLM Service Architecture

```python
class LLMService:
    """Interface for LLM providers"""
    
    async def generate_feedback(
        self,
        session: InterviewSession,
        rubric: EvaluationRubric
    ) -> FeedbackResult:
        """Generate feedback with streaming"""
        # 1. Build prompt from session + rubric
        # 2. Call provider (OpenAI/Anthropic)
        # 3. Parse response into structured format
        # 4. Calculate scores
        # 5. Return result
    
    async def generate_drills(
        self,
        feedback: FeedbackRun
    ) -> List[Drill]:
        """Generate practice drills from feedback"""
        # 1. Identify weaknesses from feedback
        # 2. Build drill generation prompt
        # 3. Call provider
        # 4. Parse drills
        # 5. Create Drill records
        # 6. Return drill list
```

**Providers**:
- OpenAI: GPT-4o, GPT-4o-mini, GPT-4-turbo
- Anthropic: Claude 3.5 Sonnet, Claude 3.5 Haiku
- Mock: For testing/development (returns realistic mock responses)

### Session Service

```python
class SessionService:
    """Handle interview session logic"""
    
    async def create_session(
        self,
        user_id: UUID,
        topic: str,
        difficulty: str,
        language: str
    ) -> InterviewSession:
        """Create new interview session"""
    
    async def submit_response(
        self,
        session_id: UUID,
        response: str,
        response_type: str = 'text'
    ) -> InterviewSession:
        """Submit user response"""
    
    async def complete_session(
        self,
        session_id: UUID
    ) -> InterviewSession:
        """Mark session as completed"""
    
    async def get_user_sessions(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0
    ) -> List[InterviewSession]:
        """Get user's interview sessions"""
```

### Feedback Service

```python
class FeedbackService:
    """Handle feedback generation & tracking"""
    
    async def request_feedback(
        self,
        session_id: UUID,
        rubric_id: int = None
    ) -> FeedbackRun:
        """Create feedback request (returns immediately)"""
        # 1. Validate session
        # 2. Create FeedbackRun (PENDING)
        # 3. Queue background task
        # 4. Return feedback_id
    
    async def process_feedback(
        self,
        feedback_id: UUID
    ) -> None:
        """Background task to generate feedback"""
        # 1. Update status: PROCESSING
        # 2. Call LLM service
        # 3. Store results
        # 4. Update status: COMPLETED
        # 5. Notify client via WebSocket (optional)
    
    async def get_feedback_status(
        self,
        feedback_id: UUID
    ) -> Dict:
        """Get feedback status for polling"""
        # Returns: {status, progress_percent, eta_seconds}
    
    async def get_feedback_result(
        self,
        feedback_id: UUID
    ) -> Dict:
        """Get completed feedback"""
        # Returns: Full feedback with scores & suggestions
```

### Transcription Service

```python
class TranscriptionService:
    """Handle audio transcription"""
    
    async def transcribe_audio(
        self,
        audio_file: UploadFile,
        language: str = 'en'
    ) -> str:
        """Transcribe audio to text using OpenAI Whisper"""
        # 1. Validate audio format
        # 2. Upload to OpenAI
        # 3. Get transcript
        # 4. Return transcription
```

---

## Project Structure

### Backend Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   │   ├── 001_initial.py
│   │   └── 002_add_feedback.py
│   ├── env.py
│   └── script.py.mako
│
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   └── endpoints/
│   │   │       ├── auth.py
│   │   │       ├── sessions.py
│   │   │       ├── feedback.py
│   │   │       ├── drills.py
│   │   │       ├── dashboard.py
│   │   │       ├── oauth.py
│   │   │       └── websockets.py
│   │   ├── middleware/
│   │   │   ├── exception_handler.py
│   │   │   └── logging.py
│   │   └── __init__.py
│   │
│   ├── core/
│   │   ├── config.py            # Settings (Pydantic)
│   │   ├── security.py          # JWT, hashing
│   │   ├── cookies.py
│   │   ├── oauth.py
│   │   └── websocket.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py              # Base model
│   │   ├── user.py
│   │   ├── interview_session.py
│   │   ├── feedback.py
│   │   ├── drill.py
│   │   ├── rubric.py
│   │   ├── skill.py
│   │   ├── goal.py
│   │   ├── message.py
│   │   └── oauth_token.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── feedback.py
│   │   ├── drill.py
│   │   ├── dashboard.py
│   │   └── common.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm.py               # LLM provider interface
│   │   ├── prompts.py           # Prompt templates
│   │   ├── transcription.py
│   │   ├── session_service.py
│   │   ├── feedback_service.py
│   │   ├── drill_service.py
│   │   └── user_service.py
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── feedback.py
│   │   ├── drill.py
│   │   └── rubric.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── common/
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   ├── utils.py
│   │   └── constants.py
│   │
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── feedback_generation.py
│   │   ├── drill_generation.py
│   │   └── transcription.py
│   │
│   └── main.py                  # FastAPI app entry
│
├── tests/
│   ├── unit/
│   │   ├── test_llm_service.py
│   │   ├── test_session_service.py
│   │   └── test_prompts.py
│   ├── integration/
│   │   ├── test_auth_api.py
│   │   ├── test_sessions_api.py
│   │   └── test_feedback_api.py
│   └── conftest.py
│
├── scripts/
│   ├── seed_db.py
│   ├── populate_rubrics.py
│   └── cleanup.py
│
├── .env.example
├── pyproject.toml               # uv dependencies
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Frontend Structure

```
frontend/
├── app/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── _components/
│   │   │       ├── QuickStats.tsx
│   │   │       ├── RecentSessions.tsx
│   │   │       ├── SkillsProgress.tsx
│   │   │       ├── WeeklyGoals.tsx
│   │   │       └── AIInsights.tsx
│   │   │
│   │   ├── interview/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── _components/
│   │   │   │       ├── InterviewHeader.tsx
│   │   │   │       ├── ChatPanel.tsx
│   │   │   │       ├── CodeEditor.tsx
│   │   │   │       ├── TestResults.tsx
│   │   │   │       ├── Whiteboard.tsx
│   │   │   │       ├── RightSidebar.tsx
│   │   │   │       ├── InterviewMetrics.tsx
│   │   │   │       ├── FooterActions.tsx
│   │   │   │       └── AnimatedBackground.tsx
│   │   │   │
│   │   │   └── feedback/
│   │   │       └── [feedbackId]/
│   │   │           ├── page.tsx
│   │   │           └── _components/
│   │   │               └── FeedbackPolling.tsx
│   │   │
│   │   └── drills/
│   │       ├── page.tsx
│   │       └── [drillId]/
│   │           ├── page.tsx
│   │           └── _components/
│   │               └── DrillForm.tsx
│   │
│   ├── auth/
│   │   ├── signin/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       └── SigninForm.tsx
│   │   ├── signup/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       └── SignupForm.tsx
│   │   ├── forgot-password/
│   │   └── callback/
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── interview/
│   │   ├── ChatMessage.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── CodeBlockPreview.tsx
│   │   └── FeedbackCard.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── SessionCard.tsx
│   │   └── SkillCard.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── NavUser.tsx
│   │
│   └── ui/
│       ├── button.tsx           # shadcn/ui components
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
│
├── hooks/
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── useSession.ts
│   ├── useFeedback.ts
│   ├── useDrills.ts
│   ├── useDashboard.ts
│   └── useDebounce.ts
│
├── lib/
│   ├── api.ts                  # Base API client
│   ├── auth-api.ts
│   ├── session-api.ts
│   ├── feedback-api.ts
│   ├── drill-api.ts
│   ├── dashboard-api.ts
│   └── utils.ts
│
├── stores/
│   ├── authStore.ts            # Zustand stores
│   ├── chatStore.ts
│   ├── codeStore.ts
│   ├── interviewStore.ts
│   └── dashboardStore.ts
│
├── public/
│   ├── animations/
│   │   ├── typing.json         # Lottie animations
│   │   ├── loading.json
│   │   ├── success.json
│   │   ├── error.json
│   │   └── thinking.json
│   └── icons/
│
├── .env.local.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Technology Stack

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | FastAPI | 0.123+ |
| **Language** | Python | 3.13+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Validation** | Pydantic | 2.12+ |
| **Migrations** | Alembic | Latest |
| **Database** | PostgreSQL | 15+ |
| **Cache** | Redis | 7+ |
| **Auth** | JWT (python-jose) | Latest |
| **OAuth** | Authlib | Latest |
| **HTTP Client** | httpx | Latest |
| **WebSockets** | websockets | Latest |
| **Package Manager** | uv | Latest |

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 16+ |
| **Language** | TypeScript | 5+ |
| **Styling** | Tailwind CSS | 4+ |
| **UI Components** | shadcn/ui | Latest |
| **Code Editor** | Monaco Editor | Latest |
| **Whiteboarding** | Excalidraw | Latest |
| **State** | Zustand | Latest |
| **Animations** | Framer Motion | Latest |
| **Lottie** | lottie-react | Latest |
| **HTTP Client** | Fetch API / Axios | - |
| **Forms** | React Hook Form | Latest |
| **Validation** | Zod | Latest |
| **Package Manager** | npm/yarn | Latest |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| **Containerization** | Docker & Docker Compose |
| **Database** | PostgreSQL 15+ |
| **Cache** | Redis 7+ |
| **Monitoring** | DataDog / CloudWatch |
| **Logging** | CloudWatch / ELK Stack |
| **Cloud** | AWS / GCP / Digital Ocean |
| **CDN** | CloudFlare / AWS CloudFront |

### AI/LLM

| Component | Service |
|-----------|---------|
| **Chat/Feedback** | OpenAI API (GPT-4o) or Anthropic (Claude 3.5) |
| **Transcription** | OpenAI Whisper API |
| **Code Execution** | Docker (Piston API alternative) |

---

## Development Setup & Environment

### Prerequisites

- Node.js 18+
- Python 3.13+
- Docker & Docker Compose
- Git
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Using uv (recommended)
uv init
uv sync

# Or using pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local
# Edit .env.local with API URLs

# Start development server
npm run dev  # Runs on http://localhost:3000
```

### Docker Setup

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Database access
docker-compose exec db psql -U admin -d ai_interview_coach
```

### Environment Variables

**Backend (.env)**:
```env
# Database
DATABASE_URL=postgresql://admin:secret@localhost:5432/ai_interview_coach

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM
LLM_PROVIDER=openai  # openai, anthropic, mock
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OAUTH_REDIRECT_URI=http://localhost:8000/api/v1/oauth/callback

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Features
FEATURE_DRILL_GENERATION=true
FEATURE_AUDIO_TRANSCRIPTION=true
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Testing Strategy

### Backend Testing

```python
# Unit tests
pytest tests/unit/
pytest tests/unit/test_llm_service.py -v

# Integration tests
pytest tests/integration/

# With coverage
pytest --cov=app --cov-report=html

# Specific test class
pytest tests/unit/test_sessions.py::TestSessionCreation -v
```

### Frontend Testing

```bash
# Unit tests with Jest
npm run test

# Watch mode
npm run test --watch

# Coverage report
npm run test --coverage

# E2E tests with Playwright
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/
│   ├── test_auth.py
│   ├── test_llm_service.py
│   ├── test_feedback_service.py
│   ├── test_prompts.py
│   └── test_transcription.py
│
├── integration/
│   ├── test_auth_api.py
│   ├── test_sessions_api.py
│   ├── test_feedback_api.py
│   ├── test_drills_api.py
│   └── test_websockets.py
│
└── conftest.py           # Shared fixtures
```

---

## Performance & Optimization

### Backend Optimizations

- **Database Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Use select() for specific columns
- **Caching**: Redis for sessions, rubrics, skills
- **Connection Pooling**: PostgreSQL connection pooling
- **Async**: All I/O operations async
- **Rate Limiting**: Token bucket algorithm
- **Pagination**: All list endpoints paginated (default 20 items)

### Frontend Optimizations

- **Code Splitting**: Dynamic imports with React.lazy()
- **Message Virtualization**: Virtual list for long chats (react-window)
- **Memoization**: React.memo() on expensive components
- **Debouncing**: Typing indicators, auto-save (1000ms)
- **Image Optimization**: Next.js Image component
- **CSS**: Tailwind purging for production
- **Bundle Size**: <400KB gzipped target

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Chat message latency | <50ms | TBD |
| Code execution | <6s | TBD |
| Feedback generation | <30s | TBD |
| Page load | <2s | TBD |
| WebSocket latency | <100ms | TBD |
| Error rate | <1% | TBD |

---

## Security & Compliance

### Authentication

- ✅ JWT tokens (HS256 algorithm)
- ✅ Password hashing (bcrypt)
- ✅ Refresh token rotation
- ✅ OAuth 2.0 integration
- ✅ HTTPS enforced in production

### Authorization

- ✅ Role-based access control (user, admin)
- ✅ Resource ownership validation
- ✅ Rate limiting per user
- ✅ Audit logging

### Data Security

- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ CSRF protection (Same-Site cookies)
- ✅ XSS prevention (React escaping)
- ✅ CORS properly configured
- ✅ Secrets management (environment variables)

### Privacy

- ✅ GDPR compliance: User data export/deletion
- ✅ Password reset via email (secure token)
- ✅ Email verification
- ✅ Session timeout (30 minutes)

---

## Configuration & Feature Flags

### Feature Flags

```python
# app/core/config.py

FEATURE_DRILL_GENERATION = True
FEATURE_AUDIO_TRANSCRIPTION = True
FEATURE_ADVANCED_RUBRICS = False
FEATURE_COACHING_LOOPS = False
FEATURE_CODE_EXECUTION = True
```

### Rate Limiting

```python
FEEDBACK_REQUESTS_PER_HOUR = 20
DRILL_REQUESTS_PER_HOUR = 10
SESSION_CREATION_PER_DAY = 50
```

### Cost Management

```python
MAX_COST_PER_FEEDBACK = 0.50  # USD
MAX_COST_PER_DRILL_SET = 0.20  # USD
DAILY_COST_CAP_PER_USER = 5.00  # USD
MONTHLY_COST_CAP_GLOBAL = 1000.00  # USD
```

### Quality Settings

```python
MIN_RESPONSE_LENGTH = 50  # characters
FEEDBACK_TEMPERATURE = 0.5  # 0-1 scale
DRILL_TEMPERATURE = 0.7  # 0-1 scale
LLM_REQUEST_TIMEOUT = 60  # seconds
TRANSCRIPTION_TIMEOUT = 120  # seconds
```

---

## Success Metrics & KPIs

### User Engagement

| KPI | Target | Timeline |
|-----|--------|----------|
| DAU (Daily Active Users) | 100+ | Month 1 |
| 7-day Retention | >60% | Month 1 |
| 30-day Retention | >40% | Month 1 |
| Avg Session Duration | 30-45 min | Month 1 |
| Session Completion Rate | >75% | Month 1 |
| Weekly Active Users | 60% of registered | Month 2 |

### Product Metrics

| KPI | Target | Timeline |
|-----|--------|----------|
| Problems Completed per User | 10+ (first month) | Month 1 |
| Drills Generated & Completed | 5+ per feedback | Month 2 |
| User Skill Improvement | +15% avg score | Month 2 |
| Offer Success (user-reported) | 70% increase | Month 3 |

### Technical Metrics

| KPI | Target | Status |
|-----|--------|--------|
| API Uptime | 99.5% | ✅ Target |
| P95 Latency | <100ms | ✅ Target |
| Error Rate | <1% | ✅ Target |
| WebSocket Connection Stability | >99.5% | ✅ Target |
| Code Execution Success | >99% | ✅ Target |

### Business Metrics

| KPI | Target | Timeline |
|-----|--------|----------|
| Cost per User Acquisition | <$5 | Month 2 |
| Monthly Active Users | 1000+ | Month 3 |
| Feedback Generation Cost | <$0.30 per session | Ongoing |
| Revenue per User | $10+/month (subscriptions) | Month 4 |

---

## Implementation Timeline

### Phase 1: MVP (Weeks 1-2)
- ✅ Setup infrastructure (Docker, DB, Redis)
- ✅ User authentication (email/password)
- ✅ Interview session creation
- ✅ WebSocket chat interface
- ✅ Mock AI responses
- ✅ Basic dashboard

**Deliverables**: Deployable MVP with core interview flow

### Phase 2: AI Integration (Weeks 3-4)
- ✅ OpenAI/Anthropic integration
- ✅ Real feedback generation
- ✅ Code execution sandbox (Docker)
- ✅ Test case management
- ✅ Audio transcription

**Deliverables**: Functional AI feedback + code execution

### Phase 3: Advanced Features (Weeks 5-6)
- ✅ Drill generation system
- ✅ Whiteboard (Excalidraw)
- ✅ Advanced analytics
- ✅ Weekly goals
- ✅ Skill tracking

**Deliverables**: Complete feature set

### Phase 4: Polish & Launch (Week 7-8)
- ✅ UI/UX refinement
- ✅ Performance optimization
- ✅ Security audit
- ✅ Load testing
- ✅ Documentation
- ✅ Public launch

**Deliverables**: Production-ready application

---

## Conclusion

This comprehensive PRD provides a complete blueprint for building AI Interview Coach as a full-stack application. The combination of modern frontend technologies (Next.js, shadcn/ui, Lottie animations), robust backend architecture (FastAPI, PostgreSQL), real-time communication (WebSocket), and intelligent AI integration creates a powerful platform for technical interview preparation.

### Key Success Factors

1. **User Experience**: Smooth, responsive interface with engaging animations
2. **Real-time Interaction**: Sub-100ms WebSocket latency for seamless chat
3. **AI Quality**: Accurate, helpful feedback from GPT-4o/Claude 3.5
4. **Reliability**: 99.5%+ uptime with robust error handling
5. **Performance**: Fast page loads, quick code execution, instant feedback
6. **Scalability**: Support 500+ concurrent users
7. **Engagement**: Gamification, progress tracking, habit building

### Next Steps

1. **Design Phase**: Finalize UI mockups in Figma
2. **Database**: Create ERD and finalize schema
3. **API Documentation**: Generate OpenAPI/Swagger docs
4. **Development**: Start with backend services
5. **Testing**: Implement test suite alongside development
6. **Deployment**: Set up CI/CD pipeline
7. **Monitoring**: Configure alerting and dashboards

---

**Document Status**: Complete and Ready for Implementation  
**Last Updated**: December 13, 2025  
**Version**: 3.0 (Complete Integrated PRD)  
**Total Words**: 10,000+
