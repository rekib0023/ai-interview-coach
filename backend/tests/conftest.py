"""Pytest fixtures for AI Interview Coach tests."""

import pytest
from datetime import datetime
from typing import Generator
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.base import Base
from app.main import app
from app.api import deps
from app.models.user import User
from app.models.interview_session import InterviewSession, SessionStatus, DifficultyLevel
from app.models.feedback import FeedbackRun, FeedbackStatus
from app.models.rubric import EvaluationRubric, RubricCategory
from app.models.drill import Drill, DrillStatus, DrillType, DrillDifficulty


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest.fixture(scope="function")
def db_engine():
    """Create a test database engine using SQLite in-memory."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session) -> Generator[TestClient, None, None]:
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[deps.get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ============================================================================
# User Fixtures
# ============================================================================

@pytest.fixture
def test_user(db_session) -> User:
    """Create a test user."""
    user = User(
        id=1,
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed_password",
        is_active=True,
        is_superuser=False,
        provider="email",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def authenticated_client(client, test_user) -> Generator[TestClient, None, None]:
    """Create an authenticated test client."""
    from app.api.v1.endpoints.auth import get_current_user

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_current_user] = override_get_current_user

    yield client

    # Clean up the override
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]


# ============================================================================
# Rubric Fixtures
# ============================================================================

@pytest.fixture
def sample_rubric_criteria() -> list[dict]:
    """Sample rubric criteria for testing."""
    return [
        {
            "name": "Technical Accuracy",
            "weight": 0.3,
            "description": "Correctness of technical concepts and solutions",
            "levels": [
                {"score": 100, "label": "Excellent", "description": "All technical details are accurate"},
                {"score": 75, "label": "Good", "description": "Minor inaccuracies present"},
                {"score": 50, "label": "Fair", "description": "Some significant errors"},
                {"score": 25, "label": "Poor", "description": "Many errors present"},
            ]
        },
        {
            "name": "Communication",
            "weight": 0.25,
            "description": "Clarity and effectiveness of communication",
            "levels": [
                {"score": 100, "label": "Excellent", "description": "Crystal clear communication"},
                {"score": 75, "label": "Good", "description": "Generally clear"},
                {"score": 50, "label": "Fair", "description": "Some confusion"},
                {"score": 25, "label": "Poor", "description": "Hard to follow"},
            ]
        },
        {
            "name": "Problem Solving",
            "weight": 0.25,
            "description": "Approach to solving problems",
            "levels": [
                {"score": 100, "label": "Excellent", "description": "Systematic and efficient"},
                {"score": 75, "label": "Good", "description": "Good approach"},
                {"score": 50, "label": "Fair", "description": "Needs improvement"},
                {"score": 25, "label": "Poor", "description": "No clear approach"},
            ]
        },
        {
            "name": "Code Quality",
            "weight": 0.2,
            "description": "Quality and readability of code",
            "levels": [
                {"score": 100, "label": "Excellent", "description": "Clean, readable code"},
                {"score": 75, "label": "Good", "description": "Generally good"},
                {"score": 50, "label": "Fair", "description": "Some issues"},
                {"score": 25, "label": "Poor", "description": "Messy code"},
            ]
        },
    ]


@pytest.fixture
def test_rubric(db_session, sample_rubric_criteria) -> EvaluationRubric:
    """Create a test evaluation rubric."""
    rubric = EvaluationRubric(
        id=1,
        name="Technical Interview Rubric",
        version="1.0.0",
        category=RubricCategory.TECHNICAL,
        description="Standard rubric for technical interviews",
        criteria=sample_rubric_criteria,
        max_score=100,
        passing_score=70,
        is_active=True,
    )
    db_session.add(rubric)
    db_session.commit()
    db_session.refresh(rubric)
    return rubric


# ============================================================================
# Session Fixtures
# ============================================================================

@pytest.fixture
def test_session(db_session, test_user) -> InterviewSession:
    """Create a test interview session."""
    session = InterviewSession(
        id=1,
        user_id=test_user.id,
        topic="Binary Search Trees",
        difficulty=DifficultyLevel.MEDIUM,
        status=SessionStatus.CREATED,
        role="Software Engineer",
        skill_targets=["algorithms", "data_structures"],
        question="Explain how to implement a balanced binary search tree.",
        response_text="A balanced binary search tree maintains O(log n) operations...",
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    return session


@pytest.fixture
def test_session_with_response(db_session, test_user) -> InterviewSession:
    """Create a test session with a response."""
    session = InterviewSession(
        id=2,
        user_id=test_user.id,
        topic="System Design",
        difficulty=DifficultyLevel.HARD,
        status=SessionStatus.AWAITING_FEEDBACK,
        role="Senior Software Engineer",
        skill_targets=["system_design", "scalability"],
        question="Design a URL shortener service.",
        response_text="""
        I would design a URL shortener with the following components:
        1. API Gateway for request handling
        2. Load balancer to distribute traffic
        3. Application servers running the shortening logic
        4. NoSQL database (like DynamoDB) for storing URL mappings
        5. Cache layer (Redis) for frequently accessed URLs
        6. CDN for global distribution

        The shortening algorithm would use base62 encoding of an auto-incrementing ID
        or a hash of the URL. I'd handle collisions by checking existence before saving.

        For scalability, I'd use consistent hashing for database sharding and
        implement rate limiting at the API gateway level.
        """,
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    return session


# ============================================================================
# Feedback Fixtures
# ============================================================================

@pytest.fixture
def test_feedback_run(db_session, test_session_with_response, test_rubric) -> FeedbackRun:
    """Create a test feedback run."""
    feedback = FeedbackRun(
        id=1,
        session_id=test_session_with_response.id,
        rubric_id=test_rubric.id,
        status=FeedbackStatus.PENDING,
    )
    db_session.add(feedback)
    db_session.commit()
    db_session.refresh(feedback)
    return feedback


@pytest.fixture
def completed_feedback_run(db_session, test_session_with_response, test_rubric) -> FeedbackRun:
    """Create a completed feedback run."""
    feedback = FeedbackRun(
        id=2,
        session_id=test_session_with_response.id,
        rubric_id=test_rubric.id,
        status=FeedbackStatus.COMPLETED,
        model_name="gpt-4o-mini",
        overall_score=82,
        criterion_scores={
            "Technical Accuracy": 85,
            "Communication": 80,
            "Problem Solving": 85,
            "Code Quality": 78,
        },
        strengths=[
            "Good understanding of system components",
            "Clear explanation of database choices",
        ],
        weaknesses=[
            "Could discuss more about failure handling",
            "Didn't mention monitoring and observability",
        ],
        suggestions=[
            "Consider adding discussion of circuit breakers",
            "Mention logging and metrics collection",
        ],
        detailed_feedback="## Overall Assessment\n\nGood response with solid fundamentals...",
        latency_ms=2500,
        input_tokens=800,
        output_tokens=600,
        total_cost_usd=0.015,
    )
    db_session.add(feedback)
    db_session.commit()
    db_session.refresh(feedback)
    return feedback


# ============================================================================
# Drill Fixtures
# ============================================================================

@pytest.fixture
def test_drills(db_session, completed_feedback_run, test_user) -> list[Drill]:
    """Create test drills."""
    drills = [
        Drill(
            id=1,
            feedback_run_id=completed_feedback_run.id,
            user_id=test_user.id,
            title="Failure Handling Practice",
            prompt="Describe how you would handle failures in a distributed system.",
            drill_type=DrillType.PRACTICE_QUESTION,
            difficulty=DrillDifficulty.MEDIUM,
            target_weakness="Could discuss more about failure handling",
            target_skill="System Design",
            status=DrillStatus.PENDING,
            sequence_order=0,
        ),
        Drill(
            id=2,
            feedback_run_id=completed_feedback_run.id,
            user_id=test_user.id,
            title="Monitoring Design Exercise",
            prompt="Design a monitoring solution for a microservices architecture.",
            drill_type=DrillType.MOCK_SCENARIO,
            difficulty=DrillDifficulty.HARD,
            target_weakness="Didn't mention monitoring and observability",
            target_skill="Observability",
            status=DrillStatus.PENDING,
            sequence_order=1,
        ),
    ]

    for drill in drills:
        db_session.add(drill)

    db_session.commit()

    for drill in drills:
        db_session.refresh(drill)

    return drills


# ============================================================================
# Mock Service Fixtures
# ============================================================================

@pytest.fixture
def mock_llm_service():
    """Create a mock LLM service."""
    from app.services.llm import MockLLMProvider, LLMService

    service = LLMService(provider=MockLLMProvider())
    return service


@pytest.fixture
def mock_transcription_service():
    """Create a mock transcription service."""
    from app.services.transcription import MockTranscriptionProvider, TranscriptionService

    service = TranscriptionService(provider=MockTranscriptionProvider())
    return service
