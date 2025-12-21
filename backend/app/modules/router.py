"""Router aggregation for all API modules."""

from fastapi import APIRouter

from app.modules.assessments import assessments_router
from app.modules.auth import auth_router, oauth_router
from app.modules.code_execution import code_router
from app.modules.dashboard import dashboard_router
from app.modules.feedback import feedback_router
from app.modules.practices import practices_router
from app.modules.websocket import websocket_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(oauth_router, prefix="/auth", tags=["oauth"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(
    assessments_router, prefix="/assessments", tags=["assessments"]
)
api_router.include_router(feedback_router, prefix="/feedback", tags=["feedback"])
api_router.include_router(practices_router, prefix="/practices", tags=["practices"])
api_router.include_router(code_router, prefix="/code", tags=["code"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websockets"])
