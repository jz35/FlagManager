import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import AppError, ErrorCode
from app.core.response import ApiResponse
from app.infrastructure.cache.redis_client import redis_client
from app.schemas.common import HealthData

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await redis_client.connect()
    yield
    await redis_client.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if origins != ["*"] else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": {"code": exc.code.value, "message": exc.message}},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError):
        message = "参数校验失败"
        if exc.errors():
            first = exc.errors()[0]
            message = first.get("msg", message)
        return JSONResponse(
            status_code=422,
            content={"detail": {"code": ErrorCode.VALIDATION_ERROR.value, "message": message}},
        )

    @app.get("/health", tags=["health"], summary="健康检查")
    async def health() -> ApiResponse[HealthData]:
        return ApiResponse(data=HealthData(status="ok"))

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
