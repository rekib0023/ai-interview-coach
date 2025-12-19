from fastapi import APIRouter

from app.api.v1.endpoints import (
    assessments,
    auth,
    code,
    dashboard,
    drawing,
    feedback,
    oauth,
    practices,
    websockets,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(oauth.router, prefix="/auth", tags=["oauth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(
    assessments.router, prefix="/assessments", tags=["assessments"]
)
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(practices.router, prefix="/practices", tags=["practices"])
api_router.include_router(code.router, prefix="/code", tags=["code"])
api_router.include_router(drawing.router, prefix="/drawing", tags=["drawing"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
