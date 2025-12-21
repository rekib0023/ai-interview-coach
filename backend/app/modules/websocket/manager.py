from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Store active connections: interview_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, interview_id: int):
        """Add websocket to connection pool (assumes websocket is already accepted)."""
        if interview_id not in self.active_connections:
            self.active_connections[interview_id] = []
        self.active_connections[interview_id].append(websocket)

    def disconnect(self, websocket: WebSocket, interview_id: int):
        if interview_id in self.active_connections:
            if websocket in self.active_connections[interview_id]:
                self.active_connections[interview_id].remove(websocket)
            if not self.active_connections[interview_id]:
                del self.active_connections[interview_id]

    async def send_personal_message(self, websocket: WebSocket, message: str):
        """Send a message to a specific WebSocket connection."""
        await websocket.send_text(message)

    async def broadcast(self, message: str, interview_id: int):
        if interview_id in self.active_connections:
            for connection in self.active_connections[interview_id]:
                await connection.send_text(message)


manager = ConnectionManager()
