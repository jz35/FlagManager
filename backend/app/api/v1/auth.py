from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.auth_service import AuthService
from app.core.response import ApiResponse
from app.core.security import get_current_user_id
from app.infrastructure.db.session import get_db
from app.schemas.common import LoginData, LoginRequest, LogoutData

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/wechat/login", summary="微信登录")
async def wechat_login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> ApiResponse[LoginData]:
    service = AuthService(db)
    data = await service.login(payload.code, payload.nickname, payload.avatar_url)
    return ApiResponse(data=data)


@router.post("/logout", summary="退出登录")
async def logout(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[LogoutData]:
    service = AuthService(db)
    await service.logout(user_id)
    return ApiResponse(data=LogoutData(logged_out=True))
