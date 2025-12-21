"""
Enhanced WebSocket chat session handler with improved error handling,
resource management, and separation of concerns.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_assessment_service,
    get_db_session,
    get_user_service,
)
from app.core.security import verify_token
from app.core.websocket import manager
from app.modules.assessments.models import AssessmentStatus
from app.modules.websocket.exceptions import (
    AssessmentAccessError,
    AuthenticationError,
)
from app.modules.websocket.models import ChatSender, CommandAction, MessageType
from app.modules.websocket.service import interviewer_service

logger = logging.getLogger(__name__)


class ChatSession:
    """
    Manages WebSocket chat session lifecycle for interview assessments.

    Responsibilities:
    - Authentication and authorization
    - Message routing and processing
    - State management
    - Error handling and recovery
    """

    def __init__(
        self,
        websocket: WebSocket,
        assessment_id: int,
        access_token: Optional[str] = None,
    ):
        self.websocket = websocket
        self.assessment_id = assessment_id
        self.access_token = access_token
        self.user_id: Optional[int] = None
        self.is_connected = False
        self.assessment_service = get_assessment_service()
        self.user_service = get_user_service()

    async def run(self):
        """Main entry point for the chat session lifecycle."""
        try:
            # 1. Accept connection
            await self.websocket.accept()
            self.is_connected = True
            logger.info(
                f"WebSocket connection established for assessment {self.assessment_id}"
            )

            # 2. Authenticate and authorize
            await self._authenticate()

            # 3. Register with connection manager
            await manager.connect(self.websocket, self.assessment_id)

            # 4. Initialize chat (send history or welcome)
            await self._initialize_chat()

            # 5. Enter message processing loop
            await self._message_loop()

        except AuthenticationError as e:
            logger.warning(f"Authentication failed: {e}")
            await self._send_error("Authentication failed", close=True)
        except AssessmentAccessError as e:
            logger.warning(f"Assessment access denied: {e}")
            await self._send_error(str(e), close=True)
        except WebSocketDisconnect:
            logger.info(f"Client disconnected from assessment {self.assessment_id}")
        except Exception as e:
            logger.error(f"Unexpected error in chat session: {e}", exc_info=True)
            await self._send_error("An unexpected error occurred")
        finally:
            await self._cleanup()

    async def _authenticate(self) -> None:
        """
        Validates token, user, and assessment access.

        Raises:
            AuthenticationError: If authentication fails
            AssessmentAccessError: If assessment access is denied
        """
        # Get token from parameter or query string
        if not self.access_token:
            self.access_token = self.websocket.query_params.get("token")

        if not self.access_token:
            raise AuthenticationError("No access token provided")

        # Verify token and extract user ID
        try:
            user_id = verify_token(self.access_token)
            if not user_id:
                raise AuthenticationError("Invalid or expired token")
            self.user_id = int(user_id)
        except Exception as e:
            raise AuthenticationError(f"Token verification failed: {e}")

        # Verify user and assessment access
        async with get_db_session() as db:
            # Check user exists
            user = self.user_service.get_user(db=db, user_id=self.user_id)
            if not user:
                raise AuthenticationError("User not found")

            # Check assessment exists and user has access
            assessment = self.assessment_service.get_assessment(
                db=db, assessment_id=self.assessment_id, user_id=self.user_id
            )
            if not assessment:
                raise AssessmentAccessError("Assessment not found or access denied")

            # Verify assessment is in valid state
            if assessment.status not in [
                AssessmentStatus.CREATED,
                AssessmentStatus.IN_PROGRESS,
            ]:
                raise AssessmentAccessError(
                    f"Assessment is {assessment.status.value}. Cannot continue chat."
                )

            # Update assessment status if needed
            if assessment.status == AssessmentStatus.CREATED:
                assessment.status = AssessmentStatus.IN_PROGRESS
                db.commit()
                logger.info(f"Assessment {self.assessment_id} started")

        logger.info(
            f"User {self.user_id} authenticated for assessment {self.assessment_id}"
        )

    async def _initialize_chat(self) -> None:
        """
        Initializes the chat by sending either:
        - Conversation history (for reconnection)
        - Welcome message and initial question (for new session)
        """
        async with get_db_session() as db:
            # Check for existing conversation history
            existing_messages = interviewer_service.get_chat_history(
                db, self.assessment_id
            )

            if existing_messages and len(existing_messages) > 0:
                # Reconnection - send recent history
                await self._send_conversation_history(existing_messages)
            else:
                # New session - send welcome and initial question
                await self._send_initial_messages(db)

    async def _send_conversation_history(
        self, messages: List, max_messages: int = 20
    ) -> None:
        """Send recent conversation history on reconnection."""
        recent_messages = (
            messages[-max_messages:] if len(messages) > max_messages else messages
        )

        logger.info(
            f"Sending {len(recent_messages)} history messages for assessment {self.assessment_id}"
        )

        for msg in recent_messages:
            msg_type = (
                MessageType.AI_MESSAGE
                if msg.sender == ChatSender.AI
                else MessageType.USER_MESSAGE
            )
            await self._send_message(
                msg_type=msg_type,
                content=msg.content,
                message_id=msg.id,
                timestamp=msg.created_at,
            )

    async def _send_initial_messages(self, db: Session) -> None:
        """Send welcome message and initial question for new session."""
        assessment = self.assessment_service.get_assessment(
            db=db, assessment_id=self.assessment_id, user_id=self.user_id
        )

        if not assessment:
            raise AssessmentAccessError("Assessment not found")

        if not assessment:
            raise AssessmentAccessError("Assessment not found")

        # Generate initial session (Intro + First Question)
        initial_response = await interviewer_service.generate_initial_session(
            assessment
        )

        # Send Intro
        if initial_response.interviewer_intro:
            intro_db_msg = await interviewer_service.save_message(
                db,
                self.assessment_id,
                ChatSender.AI,
                initial_response.interviewer_intro,
            )
            await self._send_message(
                msg_type=MessageType.AI_MESSAGE,
                content=initial_response.interviewer_intro,
                message_id=intro_db_msg.id,
                timestamp=intro_db_msg.created_at,
            )

        # Send First Question
        if initial_response.interview_question:
            # Add a small delay/typing effect if possible, but here we just send sequentially
            question_db_msg = await interviewer_service.save_message(
                db,
                self.assessment_id,
                ChatSender.AI,
                initial_response.interview_question,
            )
            await self._send_message(
                msg_type=MessageType.AI_MESSAGE,
                content=initial_response.interview_question,
                message_id=question_db_msg.id,
                timestamp=question_db_msg.created_at,
            )

        logger.info(f"Sent initial messages for assessment {self.assessment_id}")

    async def _message_loop(self) -> None:
        """Main loop for processing incoming WebSocket messages."""
        while self.is_connected:
            try:
                data = await self.websocket.receive_text()
                await self._process_message(data)
            except WebSocketDisconnect:
                logger.info(
                    f"WebSocket disconnected for assessment {self.assessment_id}"
                )
                raise
            except json.JSONDecodeError as e:
                logger.warning(f"Invalid JSON received: {e}")
                await self._send_error("Invalid message format")
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                await self._send_error("Failed to process message")

    async def _process_message(self, data: str) -> None:
        """
        Parse and route incoming message to appropriate handler.

        Args:
            data: Raw message data from WebSocket
        """
        try:
            message_data = json.loads(data)
            message_type = message_data.get("type", MessageType.USER_MESSAGE.value)
            content = message_data.get("content", "")

            # Validate message has content (except for commands)
            if not content and message_type != MessageType.COMMAND.value:
                logger.warning("Received empty message")
                return

        except json.JSONDecodeError:
            # Fallback: treat raw text as user message
            message_type = MessageType.USER_MESSAGE.value
            content = data
            message_data = {"type": message_type, "content": content}

        # Route to appropriate handler
        if message_type == MessageType.USER_MESSAGE.value:
            await self._handle_user_message(content)
        elif message_type == MessageType.COMMAND.value:
            await self._handle_command(message_data)
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def _handle_user_message(self, content: str) -> None:
        """
        Process user's chat message and generate AI response.

        Args:
            content: User's message content
        """
        async with get_db_session() as db:
            # Save user message
            user_msg = await interviewer_service.save_message(
                db, self.assessment_id, ChatSender.USER, content
            )
            logger.debug(f"Saved user message {user_msg.id}")

            # Get assessment and verify it's still active
            assessment = self.assessment_service.get_assessment(
                db=db, assessment_id=self.assessment_id, user_id=self.user_id
            )

            if not assessment:
                await self._send_error("Assessment not found")
                return

            if assessment.status != AssessmentStatus.IN_PROGRESS:
                await self._send_error(
                    f"Assessment is {assessment.status.value}. Cannot continue."
                )
                return

            # Send typing indicator
            await self._send_typing_indicator(True)

            try:
                # Get conversation history
                conversation_history = interviewer_service.get_chat_history(
                    db, self.assessment_id
                )

                # Generate AI response
                ai_response_model = await interviewer_service.generate_ai_response(
                    assessment, content, conversation_history
                )

                # Build display message from structured response
                display_content = self._build_display_message(ai_response_model)

                # Handle interview status updates
                await self._process_interview_status(db, assessment, ai_response_model)

                # Save and send AI response
                ai_msg = await interviewer_service.save_message(
                    db, self.assessment_id, ChatSender.AI, display_content
                )

                await self._send_message(
                    msg_type=MessageType.AI_MESSAGE,
                    content=display_content,
                    message_id=ai_msg.id,
                    timestamp=ai_msg.created_at,
                    metadata=self._extract_response_metadata(ai_response_model),
                )

                logger.info(
                    f"Generated AI response for assessment {self.assessment_id}"
                )

            except Exception as e:
                logger.error(f"Failed to generate AI response: {e}", exc_info=True)
                await self._send_error("Failed to generate response. Please try again.")
            finally:
                await self._send_typing_indicator(False)

    def _build_display_message(self, ai_response_model) -> str:
        """
        Build display message from structured AI response.

        Args:
            ai_response_model: Structured response from AI service

        Returns:
            Formatted message string
        """
        parts = []

        if ai_response_model.interviewer_intro:
            parts.append(ai_response_model.interviewer_intro)

        if ai_response_model.feedback:
            parts.append(ai_response_model.feedback)

        if ai_response_model.follow_up_question:
            parts.append(ai_response_model.follow_up_question)
        elif ai_response_model.interview_question:
            parts.append(ai_response_model.interview_question)

        if ai_response_model.final_remarks:
            parts.append(ai_response_model.final_remarks)

        display_content = "\n\n".join(filter(None, parts))
        return (
            display_content or "Thank you for your response. Let me think about that..."
        )

    def _extract_response_metadata(self, ai_response_model) -> Dict[str, Any]:
        """Extract metadata from AI response for client."""
        metadata = {}

        if (
            hasattr(ai_response_model, "interview_summary")
            and ai_response_model.interview_summary
        ):
            metadata["status"] = ai_response_model.interview_summary.status.value

            if hasattr(ai_response_model.interview_summary, "overall_rating"):
                metadata["rating"] = ai_response_model.interview_summary.overall_rating

        if hasattr(ai_response_model, "focus_skills_addressed"):
            metadata["skills_addressed"] = ai_response_model.focus_skills_addressed

        return metadata if metadata else None

    async def _process_interview_status(
        self, db: Session, assessment, ai_response_model
    ) -> None:
        """
        Update assessment status based on AI response.

        Args:
            db: Database session
            assessment: Assessment model
            ai_response_model: AI response with status information
        """
        if not ai_response_model.interview_summary:
            return

        from app.modules.llm.schemas import InterviewStatus

        if ai_response_model.interview_summary.status == InterviewStatus.COMPLETED:
            assessment.status = AssessmentStatus.COMPLETED

            # Store summary data
            summary_data = {
                "completed_at": datetime.utcnow().isoformat(),
                "overall_rating": getattr(
                    ai_response_model.interview_summary, "overall_rating", None
                ),
                "strengths": getattr(
                    ai_response_model.interview_summary, "strengths", []
                ),
                "areas_for_growth": getattr(
                    ai_response_model.interview_summary, "areas_for_growth", []
                ),
            }

            # Store in assessment metadata or dedicated fields
            if hasattr(assessment, "metadata"):
                assessment.metadata = assessment.metadata or {}
                assessment.metadata["interview_summary"] = summary_data

            db.commit()

            logger.info(f"Assessment {self.assessment_id} completed")

            # Notify client of completion
            await self._send_status_update(
                {
                    "status": "completed",
                    "message": "Interview completed",
                    "data": summary_data,
                }
            )

    async def _handle_command(self, message_data: Dict[str, Any]) -> None:
        """
        Process special commands from the user.

        Supported commands:
        - hint: Request a hint
        - repeat: Repeat last AI message
        - skip: Skip current question
        - end: End interview early
        - status: Get current interview status
        """
        action = message_data.get("action", "").lower()

        try:
            if action == CommandAction.HINT.value:
                await self._handle_hint_command()
            elif action == CommandAction.REPEAT.value:
                await self._handle_repeat_command()
            elif action == CommandAction.SKIP.value:
                await self._handle_skip_command()
            elif action == CommandAction.END.value:
                await self._handle_end_command()
            elif action == CommandAction.STATUS.value:
                await self._handle_status_command()
            else:
                await self._send_error(f"Unknown command: {action}")
                logger.warning(f"Unknown command received: {action}")
        except Exception as e:
            logger.error(f"Error handling command '{action}': {e}", exc_info=True)
            await self._send_error(f"Failed to execute command: {action}")

    async def _handle_hint_command(self) -> None:
        """Provide a hint for the current question."""
        # TODO: Generate contextual hints based on current question
        hint_message = (
            "💡 **Hint:** Break down the problem into smaller parts:\n"
            "1. Identify the key components or requirements\n"
            "2. Consider edge cases and constraints\n"
            "3. Think about scalability and performance\n"
            "4. Explain your reasoning step by step"
        )

        await self._send_message(
            msg_type=MessageType.SYSTEM,
            content=hint_message,
        )

    async def _handle_repeat_command(self) -> None:
        """Repeat the last AI message."""
        async with get_db_session() as db:
            last_ai_msg = interviewer_service.get_last_ai_message(
                db, self.assessment_id
            )

            if last_ai_msg:
                await self._send_message(
                    msg_type=MessageType.AI_MESSAGE,
                    content=last_ai_msg.content,
                    message_id=last_ai_msg.id,
                    timestamp=last_ai_msg.created_at,
                    metadata={"repeated": True},
                )
            else:
                await self._send_error("No previous message to repeat")

    async def _handle_skip_command(self) -> None:
        """Skip current question and move to next."""
        # TODO: Implement question skipping logic
        await self._send_message(
            msg_type=MessageType.SYSTEM,
            content="⏭️ Question skipped. Moving to next question...",
        )

    async def _handle_end_command(self) -> None:
        """End the interview early."""
        async with get_db_session() as db:
            assessment = self.assessment_service.get_assessment(
                db=db, assessment_id=self.assessment_id, user_id=self.user_id
            )

            if assessment:
                assessment.status = AssessmentStatus.COMPLETED
                db.commit()

                await self._send_message(
                    msg_type=MessageType.SYSTEM,
                    content="Interview ended. Thank you for your time!",
                )

                await self.websocket.close()

    async def _handle_status_command(self) -> None:
        """Send current interview status."""
        async with get_db_session() as db:
            assessment = self.assessment_service.get_assessment(
                db=db, assessment_id=self.assessment_id, user_id=self.user_id
            )

            if assessment:
                status_info = {
                    "status": assessment.status.value,
                    "assessment_id": assessment.id,
                    "topic": assessment.topic,
                    "difficulty": assessment.difficulty,
                }

                await self._send_status_update(status_info)

    async def _send_message(
        self,
        msg_type: MessageType,
        content: str,
        message_id: Optional[int] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Send a formatted message through WebSocket.

        Args:
            msg_type: Type of message
            content: Message content
            message_id: Database message ID
            timestamp: Message timestamp
            metadata: Additional metadata
        """
        message = {
            "type": msg_type.value,
            "content": content,
        }

        if message_id:
            message["message_id"] = message_id

        if timestamp:
            message["timestamp"] = timestamp.isoformat()
        else:
            message["timestamp"] = datetime.utcnow().isoformat()

        if metadata:
            message["metadata"] = metadata

        await manager.send_personal_message(self.websocket, json.dumps(message))

    async def _send_error(self, error_message: str, close: bool = False) -> None:
        """
        Send an error message to the client.

        Args:
            error_message: Error description
            close: Whether to close connection after sending
        """
        if self.is_connected:
            await manager.send_personal_message(
                self.websocket,
                json.dumps(
                    {
                        "type": MessageType.ERROR.value,
                        "content": error_message,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                ),
            )

        if close:
            await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            self.is_connected = False

    async def _send_status_update(self, status_data: Dict[str, Any]) -> None:
        """Send a status update to the client."""
        await manager.send_personal_message(
            self.websocket,
            json.dumps(
                {
                    "type": MessageType.STATUS.value,
                    "data": status_data,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ),
        )

    async def _send_typing_indicator(self, is_typing: bool) -> None:
        """Send typing indicator status."""
        await manager.send_personal_message(
            self.websocket,
            json.dumps(
                {
                    "type": MessageType.TYPING.value,
                    "is_typing": is_typing,
                }
            ),
        )

    async def _cleanup(self) -> None:
        """Clean up resources and disconnect."""
        if self.is_connected:
            manager.disconnect(self.websocket, self.assessment_id)
            self.is_connected = False
            logger.info(f"Cleaned up session for assessment {self.assessment_id}")
