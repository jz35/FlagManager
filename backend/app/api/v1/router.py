from fastapi import APIRouter

from app.api.v1 import auth, checkins, flags, stages, stats

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(flags.router)
api_router.include_router(stages.router)
api_router.include_router(checkins.router)
api_router.include_router(stats.router)
