"""Dashboard API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.modules.users.models import User

from .schemas import (
    AiInsightResponse,
    GoalsResponse,
    QuickStatsResponse,
    RecentAssessmentsResponse,
    SkillsResponse,
)
from .service import dashboard_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/stats",
    response_model=QuickStatsResponse,
    summary="Get dashboard quick stats",
    description="Returns user's quick statistics including overall score, problems solved, streak, and time invested.",
)
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(get_current_user)],
) -> QuickStatsResponse:
    """Get quick stats for the dashboard."""
    logger.info(f"Fetching dashboard stats for user {current_user.id}")

    try:
        return dashboard_service.get_stats(user_id=current_user.id)
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics",
        )


@router.get(
    "/recent-assessments",
    response_model=RecentAssessmentsResponse,
    summary="Get recent interview assessments",
    description="Returns the user's recent interview assessments with scores and trends.",
)
async def get_recent_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = 5,
) -> RecentAssessmentsResponse:
    """Get recent interview assessments."""
    logger.info(
        f"Fetching recent assessments for user {current_user.id}, limit={limit}"
    )

    try:
        return dashboard_service.get_recent_assessments(
            user_id=current_user.id, limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching recent assessments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent assessments",
        )


@router.get(
    "/skills",
    response_model=SkillsResponse,
    summary="Get skills progress",
    description="Returns user's skill progress including areas to improve and strengths.",
)
async def get_skills_progress(
    current_user: Annotated[User, Depends(get_current_user)],
) -> SkillsResponse:
    """Get skills progress data."""
    logger.info(f"Fetching skills progress for user {current_user.id}")

    try:
        return dashboard_service.get_skills_progress(user_id=current_user.id)
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
    current_user: Annotated[User, Depends(get_current_user)],
) -> GoalsResponse:
    """Get weekly goals."""
    logger.info(f"Fetching weekly goals for user {current_user.id}")

    try:
        return dashboard_service.get_weekly_goals(user_id=current_user.id)
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
    current_user: Annotated[User, Depends(get_current_user)],
) -> AiInsightResponse:
    """Get AI-generated insight."""
    logger.info(f"Generating AI insight for user {current_user.id}")

    try:
        return dashboard_service.get_ai_insight(user_id=current_user.id)
    except Exception as e:
        logger.error(f"Error generating AI insight: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI insight",
        )
