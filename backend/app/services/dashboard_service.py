import logging
from typing import List

from app.schemas.dashboard import (
    AiInsightResponse,
    Assessment,
    Difficulty,
    GoalsResponse,
    Priority,
    QuickStatsResponse,
    RecentAssessmentsResponse,
    SkillMetric,
    SkillsResponse,
    StatItem,
    Trend,
    WeeklyGoal,
)

logger = logging.getLogger(__name__)


class DashboardService:
    def __init__(self):
        # ============================================================================
        # Mock Data (Moved from API endpoint)
        # ============================================================================
        self.MOCK_STATS: List[StatItem] = [
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

        self.MOCK_ASSESSMENTS: List[Assessment] = [
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

        self.MOCK_SKILLS_IMPROVE: List[SkillMetric] = [
            SkillMetric(name="Dynamic Programming", progress=65, trend=5),
            SkillMetric(name="System Design", progress=70, trend=8),
            SkillMetric(name="Graph Algorithms", progress=72, trend=-2),
        ]

        self.MOCK_SKILLS_STRENGTHS: List[SkillMetric] = [
            SkillMetric(name="Array & Strings", progress=92, trend=3),
            SkillMetric(name="Trees & Graphs", progress=88, trend=5),
            SkillMetric(name="Problem Solving", progress=85, trend=2),
            SkillMetric(name="New Strength", progress=90, trend=4),
        ]

        self.MOCK_GOALS: List[WeeklyGoal] = [
            WeeklyGoal(
                id=1,
                label="Complete 5 interviews",
                current=3,
                total=5,
                priority=Priority.HIGH,
            ),
            WeeklyGoal(
                id=2,
                label="Practice Dynamic Programming",
                current=2,
                total=3,
                priority=Priority.MEDIUM,
            ),
            WeeklyGoal(
                id=3,
                label="Maintain 7-day streak",
                current=5,
                total=7,
                priority=Priority.LOW,
            ),
        ]

    def get_stats(self, user_id: int) -> QuickStatsResponse:
        """Get quick stats for the dashboard."""
        # TODO: Replace with actual database queries using user_id
        return QuickStatsResponse(stats=self.MOCK_STATS)

    def get_recent_assessments(
        self, user_id: int, limit: int = 5
    ) -> RecentAssessmentsResponse:
        """Get recent interview assessments."""
        # TODO: Replace with actual database queries using user_id
        assessments = self.MOCK_ASSESSMENTS[:limit]
        return RecentAssessmentsResponse(
            assessments=assessments,
            total_count=len(self.MOCK_ASSESSMENTS),
        )

    def get_skills_progress(self, user_id: int) -> SkillsResponse:
        """Get skills progress data."""
        # TODO: Replace with actual database queries using user_id
        return SkillsResponse(
            areas_to_improve=self.MOCK_SKILLS_IMPROVE,
            strengths=self.MOCK_SKILLS_STRENGTHS,
        )

    def get_weekly_goals(self, user_id: int) -> GoalsResponse:
        """Get weekly goals."""
        # TODO: Replace with actual database queries using user_id
        completed = sum(1 for g in self.MOCK_GOALS if g.current >= g.total)
        return GoalsResponse(
            goals=self.MOCK_GOALS,
            completed_count=completed,
            total_count=len(self.MOCK_GOALS),
        )

    def get_ai_insight(self, user_id: int) -> AiInsightResponse:
        """Get AI-generated insight."""
        # TODO: Replace with actual AI-generated insights
        return AiInsightResponse(
            message="You've improved significantly in System Design this week! Consider tackling Dynamic Programming next for balanced growth.",
            highlight_topic="System Design",
            suggested_topic="Dynamic Programming",
            action_label="Practice Now",
        )


dashboard_service = DashboardService()
