from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.checkin_service import CheckinService
from app.application.flag_service import FlagService
from app.application.stage_service import StageService
from app.core.response import ApiResponse, ItemsWrapper
from app.core.security import get_current_user_id
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.checkin_repository import CheckinRepository
from app.schemas.common import (
    CheckinCreateRequest,
    CheckinOut,
    FlagCreateRequest,
    FlagDetailData,
    FlagOut,
    FlagStatusRequest,
    FlagUpdateRequest,
    StageOut,
)

router = APIRouter(prefix="/flags", tags=["flags"])


@router.get("", summary="Flag 列表")
async def list_flags(
    status: str = Query(default="all"),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[FlagOut]]:
    service = FlagService(db)
    items = await service.list_flags(user_id, status)
    return ApiResponse(data=ItemsWrapper(items=items))


@router.get("/{flag_id}", summary="Flag 详情")
async def get_flag_detail(
    flag_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FlagDetailData]:
    flag_service = FlagService(db)
    stage_service = StageService(db)
    checkin_repo = CheckinRepository(db)

    flag = await flag_service.get_flag(user_id, flag_id)
    stages = await stage_service.list_by_flag(user_id, flag_id)
    recent = await checkin_repo.list_by_flag(flag_id, limit=20)

    checkin_service = CheckinService(db)
    return ApiResponse(
        data=FlagDetailData(
            flag=flag_service._to_out(flag),
            stages=stages,
            recent_checkins=[checkin_service._to_out(c) for c in recent],
        )
    )


@router.post("", summary="创建 Flag")
async def create_flag(
    payload: FlagCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FlagOut]:
    service = FlagService(db)
    flag = await service.create_flag(user_id, payload)
    return ApiResponse(data=flag)


@router.patch("/{flag_id}", summary="编辑 Flag")
async def update_flag(
    flag_id: UUID,
    payload: FlagUpdateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FlagOut]:
    service = FlagService(db)
    flag = await service.update_flag(user_id, flag_id, payload)
    return ApiResponse(data=flag)


@router.patch("/{flag_id}/status", summary="更新 Flag 状态")
async def update_flag_status(
    flag_id: UUID,
    payload: FlagStatusRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FlagOut]:
    service = FlagService(db)
    flag = await service.update_status(user_id, flag_id, payload.status)
    return ApiResponse(data=flag)


@router.get("/{flag_id}/stages", summary="Flag 下的阶段列表")
async def list_flag_stages(
    flag_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[StageOut]]:
    service = StageService(db)
    items = await service.list_by_flag(user_id, flag_id)
    return ApiResponse(data=ItemsWrapper(items=items))
