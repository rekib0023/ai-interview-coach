AI-Powered Interview Platform – Product Requirements

Overview

The product is a web-based AI Interviewing Platform that simulates realistic technical interviews. The AI acts as the interviewer and the user plays the interviewee role. It covers system design, coding, and behavioral interview domains. After each timed session, the AI provides structured feedback and a score. The platform’s goal is to give candidates a convenient, self-paced practice environment.

Key high-level capabilities include: user-driven session configuration (domain selection, timer), real-time AI-driven Q&A (text chat), a coding sandbox for programming questions, a drawing canvas for system-design questions, and an AI-generated feedback report at the end. It must be responsive and maintain a modern, minimal UI (Next.js/Tailwind) with an AI avatar. The system must scale to many concurrent users, ensure secure code execution, and be maintainable over time.

General Flow 1. Session Setup: The user logs in (authentication assumed) and selects an interview type: System Design, Coding, or Behavioral. They configure or accept a time limit for the session. 2. Session Start: The system creates an InterviewSession (status in_progress) and starts a countdown timer. The UI presents the chat interface (with AI avatar) and relevant tools (code editor or drawing canvas, if needed). 3. Conversation Loop: The AI initiates with a welcome message and a first question in the chosen domain. The user replies via text. The AI processes the answer, then asks follow-ups, hints, or rephrases questions as needed. This continues in real time over a WebSocket connection. 4. Interactive Tools:
• Coding: For coding interviews, the user switches to the Code Editor tab. They write code (in Python, JavaScript, or TypeScript) and can run it. The system executes code in a Docker container sandbox and returns output/errors to the UI. The AI can view and comment on the code, asking for fixes or improvements.
• System Design: For system-design interviews, an Excalidraw drawing canvas is available. The user sketches architecture diagrams. The AI may ask the user to explain diagram parts or modify the design. The canvas is client-side, with drawings saved as JSON to the backend.
• Behavioral: For behavioral questions, it is purely chat-based. The user answers situational or personal questions, and the AI may ask deeper probes. 5. Session End: When the timer expires (or the user opts to finish early), the session status updates to completed (or expired if time ran out). The UI stops accepting answers. 6. Feedback: The backend aggregates the session data (chat transcript, code submissions, drawings). The AI generates a feedback report with scores (mocked initially, LLM-based in future) and structured comments on strengths/weaknesses. The UI presents this feedback to the user.

Functional Requirements
• Interview Types: Support three domains (System Design, Coding, Behavioral) with domain-specific questions.
• Configurable Timer: Sessions have a timer; when time is up, session ends.
• Real-Time Chat: The AI and user converse via text chat. The AI can ask clarifications, hints, or rephrase questions. All chat messages are streamed in real time using WebSockets.
• Coding Sandbox: In coding mode, a code editor allows writing code in Python, JavaScript, or TypeScript. Code is sent to a secure Docker runner with CPU/memory/time limits; results are returned instantly. The AI can access the code to provide hints or corrections.
• Drawing Canvas: In system-design mode, the user can draw with an embedded Excalidraw component. The AI can prompt the user to explain or modify parts of the diagram. Diagrams are saved as session artifacts.
• UI Layout: The app uses a sidebar for navigation (session home, feedback). The main area has tabs for Chat, Code, and Diagram (System Design). Lottie animations (AI avatar and empty-state illustrations) add engagement.
• Session Management: Sessions track status (created → in_progress → completed/expired). All user inputs (messages, code, drawings) are stored.
• Scoring Engine: After a session, the system produces a feedback scorecard. Initially this can be a mock algorithm; future versions use an LLM to grade answers and code.

Non-Functional Requirements
• Performance: Real-time chat (<100ms latency) via WebSockets. Code execution must finish quickly (timeout-enforced, e.g. 5–10s max). Feedback generation should be near-instant after session end.
• Scalability: The system must handle many concurrent sessions. For example, system design guides for coding platforms emphasize supporting millions of users with low latency ￼. We will architect stateless components (e.g. WebSocket and HTTP servers) behind load balancers and scale them horizontally.
• Reliability: No data loss. Session artifacts (messages, code, drawings) must be durably stored in a database. The system should gracefully handle failures (e.g. retrying code execution, continuing on websocket reconnect).
• Security: Untrusted code runs in sandboxed containers (Docker) with strict resource and privilege limits ￼ ￼. WebSocket endpoints require authentication tokens (e.g. JWTs) at connection time ￼. Rate limiting is enforced on APIs (e.g. max interview starts per minute). All user input is sanitized to prevent injection.
• Maintainability: Use clean architecture with separation of concerns. Backend written in FastAPI with Pydantic models; frontend in Next.js with reusable components (shadcn/ui library). Code is documented and version-controlled. Monitoring (e.g. Grafana, Datadog) is integrated for logs and alerts ￼.
• Mobile Responsiveness: The UI should adapt to mobile viewports (collapsible sidebar, touch support for code and drawing). Tailwind CSS (used by shadcn/ui) ensures responsive layouts. Monaco editor has mobile input modes and the Excalidraw canvas supports touch drawing.

Technical Architecture

The system consists of a Next.js React frontend, a FastAPI backend, a Docker-based execution service, and a PostgreSQL database. Components communicate as follows:
• Frontend (Next.js + shadcn/ui): Implements the user interface. It maintains a WebSocket connection to the backend for the chat. For actions like starting a session, running code, or saving a drawing, it calls REST API endpoints. The UI has:
• A Chat Tab (with AI avatar) communicating via WebSocket,
• A Code Tab embedding Monaco Editor,
• A Design Tab embedding Excalidraw.
• After session end, a Feedback Tab shows scores and comments.
• Backend (FastAPI):
• WebSocket Server: Manages chat. On session start, clients connect to /ws/{session_id}. A ConnectionManager broadcasts messages between AI and user. (Note: the built-in ConnectionManager holds connections in-memory ￼; for production we’ll use a Redis-backed broadcaster for multi-instance scaling ￼.)
• REST API: Handles session lifecycle and non-chat actions. Endpoints include: POST /sessions (create), GET /sessions/{id} (status), POST /sessions/{id}/code (run code), POST /sessions/{id}/drawing (save drawing), GET /sessions/{id}/feedback (get results). Authentication (JWT) is required for API and WebSocket (token passed in query or header) ￼. The session status transitions (created→in_progress→completed/expired) are tracked here.
• Code Execution Service: A worker that receives code snippets (via API call) and runs them inside Docker containers. Each container is built from a Python or Node image, run as an unprivileged user, with mem_limit, cpu_quota, and no-new-privileges settings to sandbox execution ￼ ￼. The container runs the user’s code and returns stdout/stderr or errors. After each run (or on timeout), the container is cleaned up.
• AI/Scoring Module: Implements the interview logic. This could be an LLM-based service (e.g. OpenAI GPT) that generates questions, evaluates answers, and compiles feedback. Initially, a simple rule-based scorer can be used. At session end, this component aggregates the chat transcript, user code, and diagram, and produces a feedback report.
• Database (PostgreSQL): Stores all data. Key tables (models) include:
• InterviewSession (id, user_id, type, status, start_time, end_time)
• Message (id, session_id, sender (AI/user), text, timestamp)
• CodeSubmission (id, session_id, language, code_text, result_output, timestamp)
• Drawing (id, session_id, drawing_json, timestamp)
• Feedback (id, session_id, score_details, comments, timestamp)

Client (Next.js Web App)
|-- WebSocket --> FastAPI (Chat Server)
|-- HTTP/REST --> FastAPI (Session API, Code Exec API, Drawing API)
|-- Code Editor (Monaco) on client; Code sent via REST to Docker runner
|-- Excalidraw on client; JSON sent via REST to backend

FastAPI Backend
|-- Chat Manager (WebSocket) <--> Client
|-- Session Manager (REST)
|-- Code Runner (launch Docker containers for execution)
|-- Feedback Engine (generates scores/comments)
|-- PostgreSQL DB (store sessions, messages, code, drawings, feedback)

At a high level, the user interacts with the Client. The client opens a WebSocket for chat and makes REST calls for other actions. The FastAPI Server orchestrates everything: it routes chat messages to the AI agent, handles HTTP requests, invokes Docker for code, and reads/writes the DB. The Docker host runs isolated containers on demand. For scalability, each component can be run in multiple instances behind a load balancer; stateful parts (WebSocket sessions, DB) use shared storage (Redis or DB) so clients can reconnect.

Components and Responsibilities

Chat Interface
• Real-Time Messaging: Driven by WebSockets (FastAPI’s WebSocket endpoint). Every message (from AI or user) is sent as a JSON payload. FastAPI’s example shows broadcasting messages to all connections, using an in-memory ConnectionManager ￼. We will adapt this so the AI and single client exchange messages.
• Message Flow: When the WebSocket connects, the AI sends a welcome message. The user’s responses (receive_text) go to the AI logic (backend) which computes the next question. Replies from the AI are sent back via send_text. This loop continues asynchronously. FastAPI docs caution that an in-memory broadcast only works for one process ￼. To scale, we’ll use a Redis pub/sub layer (e.g. FastAPI Encode Broadcaster) so multiple server instances can share chat state ￼.
• UI: The chat window shows a clear sender/receiver layout (e.g. left-aligned AI messages, right-aligned user messages), and uses a simple, modern aesthetic (e.g. minimal colors, clear fonts). Messages scroll automatically. A Lottie animation (AI avatar) appears next to AI messages for a friendly feel.
• Features: The AI can insert structured elements (bullets, code snippets) into its messages. The user can only respond with text (no file uploads). Special commands (like “hint” or “repeat question”) may be implemented in the conversation logic.

Coding Sandbox

To support coding interviews, the UI provides an embedded code editor (Monaco Editor) and a “Run Code” button. Monaco Editor is a web-based code editor (the same engine as VS Code) suitable for rich editing in the browser ￼. It offers syntax highlighting, line numbers, and a language selector.
• Editor: The client loads Monaco in the Coding tab. The user selects language (Python, JS, TS) and types code. Example code templates or problem descriptions can be preloaded.
• Execution: When the user runs code, the client sends the code text to the backend API (e.g. POST /sessions/{id}/code). The backend spins up (or reuses) a Docker container to run the code. For example, a Python snippet runs with python -c "user_code" inside a container built from python:3.x. The container is launched with strict resource limits (mem_limit, cpu_quota) and no unnecessary privileges ￼. It also has a timeout to kill infinite loops. The Hugging Face SmolAgents tutorial demonstrates such a setup: it sets mem_limit="512m", cpu_quota=50000, security_opt=["no-new-privileges"], cap_drop=["ALL"] for each container ￼. This ensures that even malicious or buggy code cannot harm the host. After execution, stdout/stderr is captured and returned to the user (or shown in an output pane).
• Feedback: The AI (interviewer) can access the running code session. For instance, after the user runs code, the AI might request the output or ask to optimize a function. The system can provide the latest code on demand.
• Architecture Note: This design is similar to coding challenge platforms (e.g. LeetCode): user-submitted code is executed in an isolated environment with resource limits ￼. Results (pass/fail, output) are sent back in real time.

System Design Drawing

For system-design interviews, the user draws architecture diagrams: components, databases, data flows, etc. We integrate Excalidraw, an open-source hand-drawn style whiteboard, as a React component.
• Integration: Excalidraw is imported dynamically in Next.js (client-side only) because it does not support server-side rendering ￼. We use Next’s dynamic(() => import("@excalidraw/excalidraw"), { ssr: false }). The user can draw shapes, arrows, and text.
• Usage: The UI’s Drawing tab contains the Excalidraw canvas. The user creates the diagram to answer the AI’s question (e.g. “Design a URL shortening service”). The AI may prompt “Can you show the database schema?” or “Explain the arrow you drew between Service A and Service B.”
• Data Storage: As the user draws, the canvas state (JSON of elements) is saved to the backend (e.g. POST /sessions/{id}/drawing). On save or session end, the drawing JSON is stored in the Drawing model. The server can later send it back for display (e.g. on the feedback page).
• Note: No real-time collaboration is needed; only the current user edits. Therefore, Excalidraw’s collaboration features can be disabled. This simplifies integration and security.

UI Design (Next.js + shadcn/ui)
• Technology: The frontend is a Next.js React app styled with Tailwind CSS and the shadcn/ui￼ component library. This provides a clean, modern look with readily available accessible components (buttons, modals, form inputs, navigation menus, etc.). In fact, shadcn/ui is used by major companies (OpenAI, Sonos, Adobe) for consistent design ￼.
• Layout:
• Sidebar: On the left, a fixed sidebar shows the application title and navigation links (e.g. Home, Feedback). It uses a collapsible drawer on mobile.
• Top Bar: When a session is active, a header displays the current interview type and a timer countdown.
• Main Content: Tabs switch between Chat, Code, and Design.
• Chat Tab: Full-width chat window with messages.
• Code Tab: Split view: Monaco editor (with dark or light theme matching the app) on one side and a console output pane on the other.
• Design Tab: The Excalidraw canvas taking most of the space, with toolbar hidden for simplicity.
• Empty States: If a tab is opened with no content (e.g. before the first code question), a friendly Lottie animation or illustration is shown (with text like “Awaiting your code”).
• Theme: Default light theme with high-contrast text. The design is minimalistic: neutral color palette, clear typography, and subtle animation.
• Responsiveness: CSS breakpoints ensure the app looks good on tablets and phones. For example, on narrow screens the sidebar collapses, and the Code/Design tabs stack vertically (e.g. code above output). The Monaco editor still works on mobile (it supports touch input, though complex coding on a phone is limited).

Backend (FastAPI)
• Framework: The backend is built with FastAPI (Python) for performance and developer productivity. FastAPI’s async support and dependency injection suit both the real-time WebSocket and REST endpoints.
• WebSocket Server: We define an endpoint @app.websocket("/ws/{session_id}") for chat. A connection manager accepts the client (with await websocket.accept()) and routes messages. FastAPI’s docs show a similar chat example ￼. The manager saves each connection and can send personal or broadcast messages. In our case, only the AI and one user are in a session, so it’s effectively 1:1. The code pattern (accept, receive_text in a loop, send_text) will be adapted for the AI Q&A logic.
• Session API: Endpoints for creating and updating interview sessions. For example, POST /sessions creates a new session (status=created) with type and settings. PATCH /sessions/{id}/start sets status=in_progress and records start time. PATCH /sessions/{id}/end marks completion. The server enforces status transitions and checks (e.g. you cannot start an already completed session). If the timer expires, the server automatically marks the session expired. All session state changes are persisted to PostgreSQL.
• Code Execution API: An endpoint like POST /sessions/{id}/code takes {code: "...", language: "python"}. It enqueues or directly runs the code: the FastAPI handler can call a Python function that uses the Docker SDK (or a subprocess) to run the code container. After execution or on error, it returns a JSON with stdout, stderr, and possibly a success flag. Each call also creates a CodeSubmission record in the DB.
• Drawing API: POST /sessions/{id}/drawing accepts Excalidraw JSON. It validates and stores it in Drawing. The AI can load this JSON to inspect the diagram.
• Feedback API: GET /sessions/{id}/feedback triggers (or returns) the feedback. For a completed session, the server gathers all messages, submissions, and drawings, and runs them through the scoring engine. The result (score breakdown, comments) is saved in Feedback and returned.
• Authentication: All API routes (including WebSocket handshake) require an authorization token (e.g. a JWT in the header or query). For HTTP routes, use FastAPI’s OAuth2 or custom JWT dependency to verify users (prevent one user from hijacking another’s session). For the WebSocket, the client includes ?token=<JWT> in the URL; the server validates it once at connection time. This aligns with FastAPI best practices for WebSocket auth ￼ ￼.
• Session Management: The backend tracks session timers. A background scheduler (or asyncio task) checks for timeouts and updates session status to expired.
• Scoring Engine: Initially a stub: for each session it may assign random or fixed scores. Eventually, this will call an LLM to analyze the conversation and code. The design allows plugging in a real evaluation service in the future.

Database (PostgreSQL)
• Schema: We use a relational database. The core models are described above in the architecture. For example, Message has fields (id, session_id→InterviewSession, sender (‘AI’ or ‘user’), text, timestamp). All tables use foreign keys for referential integrity (e.g. messages link to sessions).
• Indexes: Create indexes on session_id in each table for fast retrieval of a session’s artifacts.
• Storage of Artifacts: Code and drawings are stored as text (code as VARCHAR or TEXT, output as TEXT, drawing JSON as TEXT or JSONB). Feedback can be a JSONB field containing scores and comments.
• Scalability: PostgreSQL can be scaled (read replicas for analytics, etc.). For massive scale, one could shard by session or use partitioning by date. This is beyond MVP scope, but the design is straightforward for a relational DB.

Security
• Secure Code Execution: As mentioned, all user code runs in containerized sandboxes. Containers run with no new privileges, drop all capabilities, and run as a non-root user ￼ ￼. This isolates any malicious code from the host and other containers.
• Rate Limiting: To prevent abuse, enforce per-user limits. For example, “max 5 interview sessions per hour” or “max 10 code executions per minute”. FastAPI middleware or API gateway solutions (Redis-based leaky bucket) can do this. An API Gateway pattern (as in LeetCode design) would handle auth and rate limits before hitting the application ￼.
• Authentication: As noted, use token-based auth (e.g. JWT) for both HTTP and WebSocket. WebSockets require auth at handshake, since after connected there are no HTTP headers. The client can send a token in the query string. The server uses that token to identify the user before accepting the socket ￼.
• Input Sanitization: Although chat and code are plain text, any user-provided content displayed in the UI should be HTML-escaped to prevent XSS. Code submissions should not be executed outside the sandbox. SQL queries (if any) use parameterized statements (FastAPI’s ORM or SQLAlchemy will handle this by default).
• TLS/HTTPS: All communication (REST and WebSocket) must be over HTTPS/WSS in production. Use TLS certificates on the load balancer.

Future Extensions
• Audio/Video: Later versions may add voice/video so the interview feels more life-like. The architecture now is text-only, but we could extend the WebSocket channel to handle audio streams or integrate WebRTC.
• Company-Specific Presets: Allow users to choose “Interview at Google” or “Interview at Amazon” profiles, which load question banks or styles tailored to those companies. This could affect the AI’s question generator.
• AI Avatar Animations: Currently the AI avatar uses idle Lottie animations. We could sync speaking animations to text output, making it feel like the avatar is “talking” as it types responses.
• Enhanced Scoring: Integrate an LLM-based grader for answers. For example, use GPT to critique the user’s system design or code quality. This requires more computing resources and careful prompt engineering.
• Analytics Dashboard: For admins or users, provide a dashboard showing performance trends over many sessions (e.g. “Your system design score improved by 10% since last month”).
• Collaboration: While not needed now, a future multi-user mode could let a mentor and student pair up in an AI-managed interview. This requires syncing two user connections in one session.

User Flows
• Starting a Session: User clicks “New Interview”, selects type and timer, and hits “Start”. The app POSTs to /sessions, then connects the WebSocket for chat. The screen shows the chat and relevant tools.
• Answering Questions: The AI posts a question in chat. The user types a text answer and sends. The UI sends the message over WebSocket. The AI evaluates and sends the next question. In coding mode, the AI may ask “Please implement function X.” The user switches to Code tab, writes code, and clicks “Run”. The app POSTs the code; results appear alongside. The user may iterate. Meanwhile, the chat continues as needed.
• Ending a Session: When the timer hits zero, the frontend disables input and notifies the backend. The status is set to completed. The frontend then calls GET /sessions/{id}/feedback. Once the feedback JSON is returned, the app displays a structured report (e.g. “Coding Score: 80/100”, bullet comments). The user can then exit or start a new session.

Edge Case Handling
• Inactivity/Timeout: If the user stops replying (no text sent) for a while, the AI may gently nudge them (“Are you still there?”). Regardless, when time expires, the session ends automatically (status=expired).
• Connection Loss: If the WebSocket disconnects (e.g. due to network), the client should attempt to reconnect automatically (within the remaining time). If reconnection fails, the session is marked expired to avoid leaving it hanging.
• Code Errors: If the user’s code raises an error or exceeds time, the backend returns the error message. The system catches execution exceptions and returns them cleanly (no 500 crashes). For example, a Python SyntaxError is sent as output so the user can fix it.
• Resource Limits: If a code submission exceeds memory or CPU limits, Docker will kill it. The user sees a “Killed: out-of-memory” or “timeout” message. This is handled gracefully.
• Duplicate Actions: Prevent actions on an ended session. For instance, if a user tries to run code after the timer expired, the server returns an error. The UI should disable the Run button once the session is finished.
• Invalid Inputs: All API inputs are validated. For example, the code API checks that language is one of the supported languages. Invalid JSON or missing fields result in a 400 error.
• Concurrent Sessions: A user should not have two sessions of the same type running simultaneously (or we must clarify if allowed). The backend can enforce one active session per type or handle multiple sessions by using unique IDs.

Mobile Considerations

The platform is a web app but should be mobile-friendly. Using Tailwind CSS ensures responsive design. On small screens, the sidebar collapses into a menu icon. The chat view is scrollable and fits vertically. The code editor, while usable on mobile, may require pinch-to-zoom or a simplified UI (Monaco supports mobile keyboards). The drawing canvas allows touch input for sketching diagrams. We ensure buttons and text are large enough for touch.

Overall, this design balances a rich interview experience with performance and security. Each component is decoupled so that the system can scale (e.g. running multiple FastAPI instances behind a load balancer, using Kubernetes or serverless Docker runners). The use of established tools (FastAPI, Docker, PostgreSQL, Next.js) and best practices (container limits, JWT auth, monitoring) ensures the platform will be maintainable and robust as it grows.
