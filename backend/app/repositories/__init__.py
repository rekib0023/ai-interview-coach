"""Repository layer for data access (Repository Pattern)."""

from app.repositories.assessment import AssessmentRepository, assessment_repository
from app.repositories.base import BaseRepository
from app.repositories.feedback import FeedbackRepository, feedback_repository
from app.repositories.practice import PracticeRepository, practice_repository
from app.repositories.rubric import RubricRepository, rubric_repository
from app.repositories.user import UserRepository, user_repository

__all__ = [
    "BaseRepository",
    "AssessmentRepository",
    "assessment_repository",
    "PracticeRepository",
    "practice_repository",
    "FeedbackRepository",
    "feedback_repository",
    "RubricRepository",
    "rubric_repository",
    "UserRepository",
    "user_repository",
]
