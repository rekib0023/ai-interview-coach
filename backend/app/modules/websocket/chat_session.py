import json
import logging
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import verify_token
from app.core.websocket import manager
from app.modules.assessments.models import Assessment, AssessmentStatus
from app.modules.users.models import User
from app.modules.websocket.models import ChatSender, Message
from app.modules.websocket.service import interviewer_service

logger = logging.getLogger(__name__)


class ChatSession:
    def __init__(
        self,
        websocket: WebSocket,
        assessment_id: int,
        access_token: Optional[str] = None,
    ):
        self.websocket = websocket
        self.assessment_id = assessment_id
        self.access_token = access_token
        self.user = None
        self.assessment = None

    async def run(self):
        """Main entry point for the chat session lifecycle."""
        # 1. Accept connection
        await self.websocket.accept()

        # 2. Authenticate
        if not await self._authenticate():
            return

        # 3. Connect to manager
        await manager.connect(self.websocket, self.assessment_id)

        try:
            # 4. Send initial messages (history or welcome)
            await self._initialize_chat()

            # 5. Message processing loop
            await self._message_loop()

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for assessment {self.assessment_id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            manager.disconnect(self.websocket, self.assessment_id)

    async def _authenticate(self) -> bool:
        """Validates token, user, and assessment access."""
        if not self.access_token:
            self.access_token = self.websocket.query_params.get("token")

        if not self.access_token:
            await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return False

        try:
            user_id = verify_token(self.access_token)
            if not user_id:
                await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return False

            db: Session = SessionLocal()
            try:
                self.user = db.query(User).filter(User.id == int(user_id)).first()
                if not self.user:
                    await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return False

                self.assessment = (
                    db.query(Assessment)
                    .filter(
                        Assessment.id == self.assessment_id,
                        Assessment.user_id == self.user.id,
                    )
                    .first()
                )

                if not self.assessment:
                    await self.websocket.send_json(
                        {
                            "type": "error",
                            "content": "Assessment not found or access denied.",
                        }
                    )
                    await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return False

                # Check if assessment is active
                if self.assessment.status not in [
                    AssessmentStatus.CREATED,
                    AssessmentStatus.IN_PROGRESS,
                ]:
                    await self.websocket.send_json(
                        {
                            "type": "error",
                            "content": f"Assessment is {self.assessment.status.value}. Cannot continue chat.",
                        }
                    )
                    await self.websocket.close()
                    return False

                # Update assessment to in_progress if needed
                if self.assessment.status == AssessmentStatus.CREATED:
                    self.assessment.status = AssessmentStatus.IN_PROGRESS
                    db.commit()

            finally:
                db.close()

            return True

        except Exception as e:
            logger.error(f"WebSocket auth failed: {e}")
            await self.websocket.send_json(
                {
                    "type": "error",
                    "content": "Authentication failed.",
                }
            )
            await self.websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return False

    async def _initialize_chat(self):
        """Sends welcome message or conversation history."""
        db = SessionLocal()
        try:
            existing_messages = (
                db.query(Message)
                .filter(Message.assessment_id == self.assessment_id)
                .order_by(Message.created_at)
                .all()
            )

            if not existing_messages:
                # First connection - send welcome and initial question
                # Reload assessment to ensure we have latest data
                assessment = (
                    db.query(Assessment)
                    .filter(Assessment.id == self.assessment_id)
                    .first()
                )
                if assessment:
                    welcome_msg = interviewer_service.get_welcome_message(assessment)
                    initial_question = interviewer_service.get_initial_question(
                        assessment
                    )

                    # Save welcome message
                    welcome_db_msg = await interviewer_service.save_message(
                        db, self.assessment_id, ChatSender.AI, welcome_msg
                    )
                    await manager.send_personal_message(
                        self.websocket,
                        json.dumps(
                            {
                                "type": "ai_message",
                                "content": welcome_msg,
                                "message_id": welcome_db_msg.id,
                                "timestamp": welcome_db_msg.created_at.isoformat(),
                            }
                        ),
                    )

                    # Save initial question
                    question_db_msg = await interviewer_service.save_message(
                        db, self.assessment_id, ChatSender.AI, initial_question
                    )
                    await manager.send_personal_message(
                        self.websocket,
                        json.dumps(
                            {
                                "type": "ai_message",
                                "content": initial_question,
                                "message_id": question_db_msg.id,
                                "timestamp": question_db_msg.created_at.isoformat(),
                            }
                        ),
                    )
            else:
                # Reconnection - send recent messages
                recent_messages = existing_messages[-20:]
                for msg in recent_messages:
                    await manager.send_personal_message(
                        self.websocket,
                        json.dumps(
                            {
                                "type": "ai_message"
                                if msg.sender == ChatSender.AI
                                else "user_message",
                                "content": msg.content,
                                "message_id": msg.id,
                                "timestamp": msg.created_at.isoformat(),
                            }
                        ),
                    )
        finally:
            db.close()

    async def _message_loop(self):
        """Main loop for processing incoming messages."""
        while True:
            try:
                data = await self.websocket.receive_text()
                await self._process_single_message(data)
            except WebSocketDisconnect:
                raise
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await manager.send_personal_message(
                    self.websocket,
                    json.dumps(
                        {
                            "type": "error",
                            "content": "An error occurred processing your message.",
                        }
                    ),
                )

    async def _process_single_message(self, data: str):
        """Parses and handles a single message or command."""
        try:
            message_data = json.loads(data)
            message_type = message_data.get("type", "user_message")
            content = message_data.get("content", "")

            if not content and message_type != "command":
                return

        except json.JSONDecodeError:
            message_type = "user_message"
            content = data

        if message_type == "user_message":
            await self._handle_user_message(content)
        elif message_type == "command":
            await self._handle_command(message_data)

    async def _handle_user_message(self, content: str):
        """Handles a regular chat message from the user."""
        db = SessionLocal()
        try:
            # Save user message
            user_msg = await interviewer_service.save_message(
                db, self.assessment_id, ChatSender.USER, content
            )

            # Echo back
            # await manager.send_personal_message(
            #     self.websocket,
            #     json.dumps(
            #         {
            #             "type": "user_message",
            #             "content": content,
            #             "message_id": user_msg.id,
            #             "timestamp": user_msg.created_at.isoformat(),
            #         }
            #     ),
            # )

            # Generate AI response
            conversation_history = (
                db.query(Message)
                .filter(Message.assessment_id == self.assessment_id)
                .order_by(Message.created_at)
                .all()
            )

            # Re-fetch assessment to ensure session attachment (?)
            # Actually, `self.assessment` might be detached if we closed the session in `_authenticate`.
            # We should query it fresh or attach it. Safest is query fresh or just use ID.
            assessment = (
                db.query(Assessment).filter(Assessment.id == self.assessment_id).first()
            )

            if assessment and assessment.status == AssessmentStatus.IN_PROGRESS:
                ai_response = await interviewer_service.generate_ai_response(
                    db, assessment, content, conversation_history
                )

                ai_msg = await interviewer_service.save_message(
                    db, self.assessment_id, ChatSender.AI, ai_response
                )

                await manager.send_personal_message(
                    self.websocket,
                    json.dumps(
                        {
                            "type": "ai_message",
                            "content": ai_response,
                            "message_id": ai_msg.id,
                            "timestamp": ai_msg.created_at.isoformat(),
                        }
                    ),
                )
        finally:
            db.close()

    async def _handle_command(self, message_data: dict):
        """Handles special commands like hint or repeat."""
        action = message_data.get("action")
        if action == "hint":
            await manager.send_personal_message(
                self.websocket,
                json.dumps(
                    {
                        "type": "ai_message",
                        "content": "Here's a hint: Think about the problem step by step. What are the key components you need to consider?",
                    }
                ),
            )
        elif action == "repeat":
            db = SessionLocal()
            try:
                last_ai_msg = (
                    db.query(Message)
                    .filter(
                        Message.assessment_id == self.assessment_id,
                        Message.sender == ChatSender.AI,
                    )
                    .order_by(Message.created_at.desc())
                    .first()
                )
                if last_ai_msg:
                    await manager.send_personal_message(
                        self.websocket,
                        json.dumps(
                            {
                                "type": "ai_message",
                                "content": last_ai_msg.content,
                                "message_id": last_ai_msg.id,
                                "timestamp": last_ai_msg.created_at.isoformat(),
                            }
                        ),
                    )
            finally:
                db.close()
