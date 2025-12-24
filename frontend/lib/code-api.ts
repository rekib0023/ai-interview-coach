const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CodeLanguage = "python" | "javascript" | "typescript";

export interface CodeExecutionRequest {
  code: string;
  language: CodeLanguage;
}

export interface CodeExecutionResponse {
  submission_id: number;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_used_mb: number;
  timed_out: boolean;
}

export interface CodeSubmission {
  id: number;
  language: string;
  code_text: string;
  result_output: string | null;
  error_output: string | null;
  execution_time_ms: number | null;
  exit_code: number | null;
  timed_out: boolean;
  created_at: string;
}

export const codeApi = {
  async executeCode(
    sessionId: number,
    request: CodeExecutionRequest
  ): Promise<CodeExecutionResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/code/sessions/${sessionId}/code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Code execution failed");
    }

    return response.json();
  },

  async getSubmissions(sessionId: number): Promise<CodeSubmission[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/code/sessions/${sessionId}/code`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch code submissions");
    }

    return response.json();
  },
};
