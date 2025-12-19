"""Dashboard API endpoints with mock data."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.schemas.dashboard import (
    AiInsightResponse,
    Assessment,
    Difficulty,
    GoalsResponse,
    Priority,
    QuickStatsResponse,
    RecentSessionsResponse,
    SkillMetric,
    SkillsResponse,
    StatItem,
    Trend,
    WeeklyGoal,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Mock Data
# ============================================================================

MOCK_STATS: list[StatItem] = [
    StatItem(
        title="Overall Score",
        value="78%",
        change="+5%",
        subtitle="from last week",
        trend=Trend.UP,
        icon_type="trophy",
    ),
    StatItem(
        title="Problems Solved",
        value="42",
        subtitle="Top 15% of users",
        icon_type="check",
    ),
    StatItem(
        title="Current Streak",
        value="5 Days",
        subtitle="Keep it up!",
        icon_type="flame",
    ),
    StatItem(
        title="Time Invested",
        value="12.5h",
        subtitle="This week",
        icon_type="clock",
    ),
]

MOCK_ASSESSMENTS: list[Assessment] = [
    Assessment(
        id=1,
        topic="React Hooks & State Management",
        date="Today, 10:23 AM",
        difficulty=Difficulty.MEDIUM,
        score=85,
        duration="45 min",
        trend=Trend.UP,
    ),
    Assessment(
        id=2,
        topic="Binary Search Trees",
        date="Yesterday, 3:15 PM",
        difficulty=Difficulty.HARD,
        score=72,
        duration="52 min",
        trend=Trend.DOWN,
    ),
    Assessment(
        id=3,
        topic="System Design - URL Shortener",
        date="2 days ago",
        difficulty=Difficulty.MEDIUM,
        score=88,
        duration="38 min",
        trend=Trend.UP,
    ),
]

MOCK_SKILLS_IMPROVE: list[SkillMetric] = [
    SkillMetric(name="Dynamic Programming", progress=65, trend=5),
    SkillMetric(name="System Design", progress=70, trend=8),
    SkillMetric(name="Graph Algorithms", progress=72, trend=-2),
]

MOCK_SKILLS_STRENGTHS: list[SkillMetric] = [
    SkillMetric(name="Array & Strings", progress=92, trend=3),
    SkillMetric(name="Trees & Graphs", progress=88, trend=5),
    SkillMetric(name="Problem Solving", progress=85, trend=2),
    SkillMetric(name="New Strength", progress=90, trend=4),
]

MOCK_GOALS: list[WeeklyGoal] = [
    WeeklyGoal(
        id=1, label="Complete 5 interviews", current=3, total=5, priority=Priority.HIGH
    ),
    WeeklyGoal(
        id=2,
        label="Practice Dynamic Programming",
        current=2,
        total=3,
        priority=Priority.MEDIUM,
    ),
    WeeklyGoal(
        id=3, label="Maintain 7-day streak", current=5, total=7, priority=Priority.LOW
    ),
]


# ============================================================================
# Endpoints
# ============================================================================


@router.get(
    "/stats",
    response_model=QuickStatsResponse,
    summary="Get dashboard quick stats",
    description="Returns user's quick statistics including overall score, problems solved, streak, and time invested.",
)
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> QuickStatsResponse:
    """Get quick stats for the dashboard."""
    logger.info(f"Fetching dashboard stats for user {current_user.id}")

    try:
        # TODO: Replace with actual database queries
        return QuickStatsResponse(stats=MOCK_STATS)
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics",
        )


@router.get(
    "/recent-sessions",
    response_model=RecentSessionsResponse,
    summary="Get recent interview sessions",
    description="Returns the user's recent interview sessions with scores and trends.",
)
async def get_recent_sessions(
    current_user: Annotated[User, Depends(deps.get_current_user)],
    limit: int = 5,
) -> RecentSessionsResponse:
    """Get recent interview sessions."""
    logger.info(f"Fetching recent sessions for user {current_user.id}, limit={limit}")

    try:
        # TODO: Replace with actual database queries
        sessions = MOCK_ASSESSMENTS[:limit]
        return RecentSessionsResponse(
            sessions=sessions,
            total_count=len(MOCK_ASSESSMENTS),
        )
    except Exception as e:
        logger.error(f"Error fetching recent sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent sessions",
        )


@router.get(
    "/skills",
    response_model=SkillsResponse,
    summary="Get skills progress",
    description="Returns user's skill progress including areas to improve and strengths.",
)
async def get_skills_progress(
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> SkillsResponse:
    """Get skills progress data."""
    logger.info(f"Fetching skills progress for user {current_user.id}")

    try:
        # TODO: Replace with actual database queries
        return SkillsResponse(
            areas_to_improve=MOCK_SKILLS_IMPROVE,
            strengths=MOCK_SKILLS_STRENGTHS,
        )
    except Exception as e:
        logger.error(f"Error fetching skills progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch skills progress",
        )


@router.get(
    "/goals",
    response_model=GoalsResponse,
    summary="Get weekly goals",
    description="Returns the user's weekly goals with progress.",
)
async def get_weekly_goals(
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> GoalsResponse:
    """Get weekly goals."""
    logger.info(f"Fetching weekly goals for user {current_user.id}")

    try:
        # TODO: Replace with actual database queries
        completed = sum(1 for g in MOCK_GOALS if g.current >= g.total)
        return GoalsResponse(
            goals=MOCK_GOALS,
            completed_count=completed,
            total_count=len(MOCK_GOALS),
        )
    except Exception as e:
        logger.error(f"Error fetching weekly goals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weekly goals",
        )


@router.get(
    "/ai-insight",
    response_model=AiInsightResponse,
    summary="Get AI-generated insight",
    description="Returns an AI-generated insight and recommendation for the user.",
)
async def get_ai_insight(
    current_user: Annotated[User, Depends(deps.get_current_user)],
) -> AiInsightResponse:
    """Get AI-generated insight."""
    logger.info(f"Generating AI insight for user {current_user.id}")

    try:
        # TODO: Replace with actual AI-generated insights
        return AiInsightResponse(
            message="You've improved significantly in System Design this week! Consider tackling Dynamic Programming next for balanced growth.",
            highlight_topic="System Design",
            suggested_topic="Dynamic Programming",
            action_label="Practice Now",
        )
    except Exception as e:
        logger.error(f"Error generating AI insight: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI insight",
        )
