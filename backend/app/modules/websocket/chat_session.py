"""
WebSocket Chat Session Handler.
Manages the lifecycle of an interview assessment chat, including authentication,
message routing, and real-time AI streaming.
"""

import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_assessment_service,
    get_db_session,
    get_user_service,
)
from app.core.security import verify_token
from app.core.websocket import manager
from app.modules.assessments.models import Assessment, AssessmentStatus
from app.modules.websocket.models import ChatSender, MessageType
from app.modules.websocket.service import message_service
from app.shared.exceptions import (
    AssessmentAccessError,
    AuthenticationError,
)

logger = logging.getLogger(__name__)


class ChatSession:
    def __init__(
        self,
        websocket: WebSocket,
        assessment_id: int,
        access_token: Optional[str] = None,
    ):
        self.ws = websocket
        self.assessment_id = assessment_id
        self.user_id: Optional[int] = None
        self.is_active = False
        self.access_token: Optional[str] = access_token

    async def start_session(self):
        """
        Main entry point. Orchestrates the connection, authentication,
        and message processing loop.
        """
        try:
            await self._accept_connection()
            await self._authenticate_and_validate()
            await manager.connect(self.ws, self.assessment_id)
            await self._restore_or_initialize_chat()
            await self._receive_loop()

        except AuthenticationError as e:
            logger.warning(f"Auth failed for assessment {self.assessment_id}: {e}")
            await self._send_error(str(e), close_code=status.WS_1008_POLICY_VIOLATION)
        except AssessmentAccessError as e:
            logger.warning(f"Access denied for assessment {self.assessment_id}: {e}")
            await self._send_error(str(e), close_code=status.WS_1008_POLICY_VIOLATION)
        except WebSocketDisconnect:
            logger.info(f"Client disconnected: Assessment {self.assessment_id}")
        except Exception as e:
            logger.error(f"Unexpected session error: {e}", exc_info=True)
            await self._send_error("An internal error occurred.")
        finally:
            await self._cleanup()

    # =========================================================================
    # Connection & Authentication
    # =========================================================================

    async def _accept_connection(self):
        """Accepts the WebSocket handshake."""
        await self.ws.accept()
        self.is_active = True

    async def _authenticate_and_validate(self):
        """
        Verifies the JWT token and ensures the user has access to a valid assessment.
        Updates assessment status to IN_PROGRESS if it was CREATED.
        """
        # 1. Verify Token
        if not self.access_token:
            raise AuthenticationError("Missing access token")

        try:
            self.user_id = int(verify_token(self.access_token))
        except Exception:
            raise AuthenticationError("Invalid or expired token")

        # 2. Verify DB Access (Scoped Session)
        async with get_db_session() as db:
            # Get services within session scope
            user_service = get_user_service()
            assessment_service = get_assessment_service()

            user = user_service.get_user(db, user_id=self.user_id)
            if not user:
                raise AuthenticationError("User account not found")

            assessment = assessment_service.get_assessment(
                db, assessment_id=self.assessment_id, user_id=self.user_id
            )
            if not assessment:
                raise AssessmentAccessError("Assessment not found or access denied")

            # 3. Check Status (delegated to service)
            allowed_statuses = [AssessmentStatus.CREATED, AssessmentStatus.IN_PROGRESS]
            if not assessment_service.validate_assessment_status(
                assessment, allowed_statuses
            ):
                raise AssessmentAccessError(f"Assessment is {assessment.status.value}")

            # 4. Update Status if needed (delegated to service)
            if assessment.status == AssessmentStatus.CREATED:
                assessment_service.update_assessment_status(
                    db=db,
                    assessment_id=self.assessment_id,
                    user_id=self.user_id,
                    new_status=AssessmentStatus.IN_PROGRESS,
                )

    async def _restore_or_initialize_chat(self):
        """Sends chat history if it exists, otherwise sends the welcome message."""
        async with get_db_session() as db:
            history = message_service.get_chat_history(db, self.assessment_id)

            if history:
                await self._send_history(history)
            else:
                await self._send_welcome_message()

    # =========================================================================
    # Message Processing Loop
    # =========================================================================

    async def _receive_loop(self):
        """Continuously listens for messages from the client."""
        while self.is_active:
            try:
                data = await self.ws.receive_text()
                await self._dispatch_message(data)
            except WebSocketDisconnect:
                raise  # Handled in start_session
            except json.JSONDecodeError:
                await self._send_error("Invalid JSON format")
            except Exception as e:
                logger.error(f"Message processing error: {e}", exc_info=True)
                await self._send_error("Failed to process message")

    async def _dispatch_message(self, raw_data: str):
        """Parses raw JSON and routes to the correct handler."""
        try:
            payload = json.loads(raw_data)
            msg_type = payload.get("type", MessageType.USER_MESSAGE.value)
            content = payload.get("content", "")
        except json.JSONDecodeError:
            # Fallback for plain text messages
            msg_type = MessageType.USER_MESSAGE.value
            content = raw_data

        if not content and msg_type != MessageType.COMMAND.value:
            return

        if msg_type == MessageType.USER_MESSAGE.value:
            await self._process_text_message(content)
        else:
            logger.warning(f"Ignored unknown message type: {msg_type}")

    # =========================================================================
    # Core Business Logic (The "Unit of Work")
    # =========================================================================

    async def _process_text_message(self, content: str):
        """
        Handles a user message:
        1. Saves user message.
        2. Refreshes assessment context.
        3. Generates and streams AI response (delegated to service).
        All within a SINGLE database transaction.
        """
        async with get_db_session() as db:
            # 1. Re-fetch context (prevents DetachedInstanceError)
            assessment_service = get_assessment_service()
            assessment = assessment_service.get_assessment(
                db, self.assessment_id, self.user_id
            )
            if not assessment:
                await self._send_error("Assessment context lost.")
                return

            # 2. Save User Message
            await message_service.save_message(
                db, self.assessment_id, ChatSender.USER, content
            )

            # 3. Generate and Stream AI Response (delegated to service)
            await self._handle_ai_response(db, assessment, content)

    async def _handle_ai_response(
        self, db: Session, assessment: Assessment, user_input: str
    ):
        """
        Handles AI response generation and streaming.
        Business logic delegated to service layer.
        """
        await self._send_protocol_message(MessageType.STREAM_START)

        try:
            # Generate and save AI response (business logic in service)
            (
                ai_msg,
                is_completed,
            ) = await message_service.generate_and_save_ai_response(
                db, assessment, user_input
            )

            # Stream the response content to client
            await self._send_protocol_message(
                MessageType.STREAM_CHUNK, content=ai_msg.content
            )

            # Notify client if interview is completed
            if is_completed:
                await self._send_protocol_message(
                    MessageType.STATUS,
                    data={"status": "completed", "message": "Interview Finished"},
                )

            # Finalize stream
            await self._send_stream_end(
                message_id=ai_msg.id, timestamp=ai_msg.created_at
            )

        except Exception as e:
            logger.error(f"AI response failed: {e}", exc_info=True)
            await self._send_stream_end(error=True)
            await self._send_error("AI response generation failed.")

    # =========================================================================
    # Output & Protocol Helpers
    # =========================================================================

    async def _send_history(self, messages: list):
        """Sends the last N messages to the client."""
        for msg in messages[-20:]:
            msg_type = (
                MessageType.AI_MESSAGE
                if msg.sender == ChatSender.AI
                else MessageType.USER_MESSAGE
            )
            await self._send_protocol_message(
                msg_type,
                content=msg.content,
                message_id=msg.id,
                timestamp=msg.created_at,
            )

    async def _send_welcome_message(self):
        """Sends the initial welcome message (content from service)."""
        welcome_text = message_service.generate_welcome_message()
        await self._send_protocol_message(MessageType.STREAM_START)
        await self._send_protocol_message(
            MessageType.STREAM_CHUNK, content=welcome_text
        )
        await self._send_stream_end()

    async def _send_stream_end(
        self, error: bool = False, message_id: int = None, timestamp=None
    ):
        """Helper to send the stream end signal."""
        payload = {"error": error}
        if message_id:
            payload["message_id"] = message_id

        await self._send_protocol_message(
            MessageType.STREAM_END, timestamp=timestamp, **payload
        )

    async def _send_error(self, message: str, close_code: int = None):
        """Sends an error message and optionally closes the socket."""
        if self.is_active:
            await self._send_protocol_message(MessageType.ERROR, content=message)
            if close_code:
                await self.ws.close(code=close_code)
                self.is_active = False

    async def _send_protocol_message(
        self,
        msg_type: MessageType,
        content: str = None,
        timestamp: datetime = None,
        **kwargs,
    ):
        """
        Low-level helper to format and send JSON messages.
        """
        payload = {
            "type": msg_type.value if hasattr(msg_type, "value") else msg_type,
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
        }

        if content is not None:
            payload["content"] = content

        # Merge extra data (like 'data' for status updates, or 'message_id')
        if kwargs:
            payload.update(kwargs)

        await manager.send_personal_message(self.ws, json.dumps(payload))

    async def _cleanup(self):
        """Disconnects from the manager."""
        if self.is_active:
            manager.disconnect(self.ws, self.assessment_id)
            self.is_active = False
