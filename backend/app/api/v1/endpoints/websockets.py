"""Enhanced WebSocket endpoint with AI interviewer logic."""

import json
import logging
from typing import Optional

from fastapi import APIRouter, Cookie, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.core.websocket import manager
from app.db.session import SessionLocal
from app.models.assessment import Assessment, AssessmentStatus
from app.models.message import ChatSender, Message
from app.models.user import User
from app.services.interviewer_service import interviewer_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/{assessment_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    assessment_id: int,
    access_token: Optional[str] = Cookie(None, alias="access_token"),
):
    """
    Enhanced WebSocket endpoint for real-time interview chat with AI interviewer.

    Message format:
    - User messages: {"type": "user_message", "content": "..."}
    - System commands: {"type": "command", "action": "hint" | "repeat" | ...}
    - AI responses: {"type": "ai_message", "content": "..."}
    """
    # Accept WebSocket connection FIRST (required before any operations)
    await websocket.accept()

    # Authentication
    if not access_token:
        access_token = websocket.query_params.get("token")

    if not access_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    assessment_obj = None
    try:
        user_id = verify_token(access_token)
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Get user and assessment
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            assessment_obj = (
                db.query(Assessment)
                .filter(
                    Assessment.id == assessment_id,
                    Assessment.user_id == user.id,
                )
                .first()
            )

            if not assessment_obj:
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": "Assessment not found or access denied.",
                    }
                )
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            # Check if assessment is active
            if assessment_obj.status not in [
                AssessmentStatus.CREATED,
                AssessmentStatus.IN_PROGRESS,
            ]:
                await websocket.send_json(
                    {
                        "type": "error",
                        "content": f"Assessment is {assessment_obj.status.value}. Cannot continue chat.",
                    }
                )
                await websocket.close()
                return

            # Update assessment to in_progress if needed
            if assessment_obj.status == AssessmentStatus.CREATED:
                assessment_obj.status = AssessmentStatus.IN_PROGRESS
                db.commit()

        finally:
            db.close()

    except Exception as e:
        logger.error(f"WebSocket auth failed: {e}")
        await websocket.send_json(
            {
                "type": "error",
                "content": "Authentication failed.",
            }
        )
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if not assessment_obj:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Connect WebSocket to manager (after accepting and validating)
    await manager.connect(websocket, assessment_id)

    try:
        # Send welcome message and initial question if this is the first connection
        db = SessionLocal()
        try:
            existing_messages = (
                db.query(Message)
                .filter(Message.assessment_id == assessment_id)
                .order_by(Message.created_at)
                .all()
            )

            if not existing_messages:
                # First connection - send welcome and initial question
                # Reload assessment to ensure we have latest data
                assessment = (
                    db.query(Assessment).filter(Assessment.id == assessment_id).first()
                )
                if assessment:
                    welcome_msg = interviewer_service.get_welcome_message(assessment)

                    initial_question = interviewer_service.get_initial_question(
                        assessment
                    )

                    # Save welcome message
                    welcome_db_msg = interviewer_service.save_message(
                        db, assessment_id, ChatSender.AI, welcome_msg
                    )
                    await manager.send_personal_message(
                        websocket,
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
                    question_db_msg = interviewer_service.save_message(
                        db, assessment_id, ChatSender.AI, initial_question
                    )
                    await manager.send_personal_message(
                        websocket,
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
                recent_messages = existing_messages[-20:]  # Last 20 messages
                for msg in recent_messages:
                    await manager.send_personal_message(
                        websocket,
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

        # Main message loop
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()

                # Parse message
                try:
                    message_data = json.loads(data)
                    message_type = message_data.get("type", "user_message")
                    content = message_data.get("content", "")

                    if not content:
                        continue

                except json.JSONDecodeError:
                    # Fallback: treat as plain text
                    message_type = "user_message"
                    content = data

                # Handle different message types
                if message_type == "user_message":
                    # Save user message
                    db = SessionLocal()
                    try:
                        user_msg = interviewer_service.save_message(
                            db, assessment_id, ChatSender.USER, content
                        )

                        # Send user message back (echo)
                        await manager.send_personal_message(
                            websocket,
                            json.dumps(
                                {
                                    "type": "user_message",
                                    "content": content,
                                    "message_id": user_msg.id,
                                    "timestamp": user_msg.created_at.isoformat(),
                                }
                            ),
                        )

                        # Get conversation history
                        conversation_history = (
                            db.query(Message)
                            .filter(Message.assessment_id == assessment_id)
                            .order_by(Message.created_at)
                            .all()
                        )

                        # Generate AI response
                        assessment = (
                            db.query(Assessment)
                            .filter(Assessment.id == assessment_id)
                            .first()
                        )

                        if (
                            assessment
                            and assessment.status == AssessmentStatus.IN_PROGRESS
                        ):
                            ai_response = (
                                await interviewer_service.generate_ai_response(
                                    db, assessment, content, conversation_history
                                )
                            )

                            # Save AI response
                            ai_msg = interviewer_service.save_message(
                                db, assessment_id, ChatSender.AI, ai_response
                            )

                            # Send AI response
                            await manager.send_personal_message(
                                websocket,
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

                elif message_type == "command":
                    # Handle special commands (hint, repeat, etc.)
                    action = message_data.get("action")
                    if action == "hint":
                        # Send a hint
                        await manager.send_personal_message(
                            websocket,
                            json.dumps(
                                {
                                    "type": "ai_message",
                                    "content": "Here's a hint: Think about the problem step by step. What are the key components you need to consider?",
                                }
                            ),
                        )
                    elif action == "repeat":
                        # Repeat last question
                        db = SessionLocal()
                        try:
                            last_ai_msg = (
                                db.query(Message)
                                .filter(
                                    Message.assessment_id == assessment_id,
                                    Message.sender == ChatSender.AI,
                                )
                                .order_by(Message.created_at.desc())
                                .first()
                            )
                            if last_ai_msg:
                                await manager.send_personal_message(
                                    websocket,
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

            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await manager.send_personal_message(
                    websocket,
                    json.dumps(
                        {
                            "type": "error",
                            "content": "An error occurred processing your message.",
                        }
                    ),
                )

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for assessment {assessment_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket, assessment_id)
