from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, drills, feedback, oauth, sessions

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(oauth.router, prefix="/auth", tags=["oauth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(drills.router, prefix="/drills", tags=["drills"])
