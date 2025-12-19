"""Dashboard schemas for API requests and responses."""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

# ============================================================================
# Enums
# ============================================================================


class Difficulty(str, Enum):
    """Interview difficulty levels."""

    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class Trend(str, Enum):
    """Trend direction for stats."""

    UP = "up"
    DOWN = "down"
    NEUTRAL = "neutral"


class Priority(str, Enum):
    """Goal priority levels."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ============================================================================
# Quick Stats Models
# ============================================================================


class StatItem(BaseModel):
    """Individual stat item."""

    title: str
    value: str
    subtitle: Optional[str] = None
    change: Optional[str] = None
    trend: Optional[Trend] = None
    icon_type: str = Field(description="Icon identifier: trophy, check, flame, clock")


class QuickStatsResponse(BaseModel):
    """Response for /dashboard/stats endpoint."""

    stats: list[StatItem]

    class Config:
        json_schema_extra = {
            "example": {
                "stats": [
                    {
                        "title": "Overall Score",
                        "value": "78%",
                        "change": "+5%",
                        "trend": "up",
                        "icon_type": "trophy",
                    },
                    {
                        "title": "Problems Solved",
                        "value": "42",
                        "subtitle": "Top 15% of users",
                        "icon_type": "check",
                    },
                ]
            }
        }


# ============================================================================
# Recent Sessions Models
# ============================================================================


class Assessment(BaseModel):
    """Recent assessment session data."""

    id: int
    topic: str
    date: str = Field(description="Human-readable date string")
    difficulty: Difficulty
    score: int = Field(ge=0, le=100)
    duration: str = Field(description="Duration in format like '45 min'")
    trend: Trend


class RecentSessionsResponse(BaseModel):
    """Response for /dashboard/recent-sessions endpoint."""

    sessions: list[Assessment]
    total_count: int


# ============================================================================
# Skills Models
# ============================================================================


class SkillMetric(BaseModel):
    """Individual skill metric."""

    name: str
    progress: int = Field(ge=0, le=100, description="Progress percentage")
    trend: Optional[int] = Field(None, description="Trend change in percentage points")


class SkillsResponse(BaseModel):
    """Response for /dashboard/skills endpoint."""

    areas_to_improve: list[SkillMetric]
    strengths: list[SkillMetric]


# ============================================================================
# Weekly Goals Models
# ============================================================================


class WeeklyGoal(BaseModel):
    """Individual weekly goal."""

    id: int
    label: str
    current: int = Field(ge=0)
    total: int = Field(ge=1)
    priority: Priority


class GoalsResponse(BaseModel):
    """Response for /dashboard/goals endpoint."""

    goals: list[WeeklyGoal]
    completed_count: int
    total_count: int


# ============================================================================
# AI Insight Models
# ============================================================================


class AiInsightResponse(BaseModel):
    """Response for /dashboard/ai-insight endpoint."""

    message: str
    highlight_topic: str = Field(description="Topic to highlight in the message")
    suggested_topic: str = Field(description="Suggested next topic to practice")
    action_label: str = Field(default="Practice Now")


# ============================================================================
# Combined Dashboard Response (optional - for single API call)
# ============================================================================


class DashboardResponse(BaseModel):
    """Combined dashboard data response."""

    stats: QuickStatsResponse
    recent_sessions: RecentSessionsResponse
    skills: SkillsResponse
    goals: GoalsResponse
    ai_insight: AiInsightResponse
