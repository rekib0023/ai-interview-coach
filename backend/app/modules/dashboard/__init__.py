"""Dashboard module exports."""

from .router import router as dashboard_router
from .service import DashboardService, dashboard_service

__all__ = [
    "dashboard_router",
    "dashboard_service",
    "DashboardService",
]
