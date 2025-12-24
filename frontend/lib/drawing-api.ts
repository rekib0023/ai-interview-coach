const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DrawingSaveRequest {
  drawing_json: Record<string, any>;
  title?: string;
  version?: string;
}

export interface DrawingResponse {
  id: number;
  session_id: number;
  drawing_json: Record<string, any>;
  title: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export const drawingApi = {
  async saveDrawing(
    sessionId: number,
    request: DrawingSaveRequest
  ): Promise<DrawingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/drawing/sessions/${sessionId}/drawing`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to save drawing");
    }

    return response.json();
  },

  async getDrawing(
    sessionId: number
  ): Promise<DrawingResponse | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/drawing/sessions/${sessionId}/drawing`,
      {
        credentials: "include",
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch drawing");
    }

    return response.json();
  },
};
