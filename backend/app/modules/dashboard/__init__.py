"""Dashboard module exports."""

from .router import router as dashboard_router
from .service import DashboardService

__all__ = [
    "dashboard_router",
    "DashboardService",
]
