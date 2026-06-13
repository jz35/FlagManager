from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.stage_service import StageService
from app.core.response import ApiResponse
from app.core.security import get_current_user_id
from app.infrastructure.db.session import get_db
from app.schemas.common import (
    StageCreateRequest,
    StageDetailData,
    StageEvaluateData,
    StageOut,
    StageUpdateRequest,
)

router = APIRouter(prefix="/stages", tags=["stages"])


@router.get("/{stage_id}", summary="阶段详情")
async def get_stage_detail(
    stage_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[StageDetailData]:
    service = StageService(db)
    data = await service.get_detail(user_id, stage_id)
    return ApiResponse(data=data)


@router.post("", summary="创建阶段")
async def create_stage(
    payload: StageCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[StageOut]:
    service = StageService(db)
    stage = await service.create_stage(user_id, payload)
    return ApiResponse(data=stage)


@router.patch("/{stage_id}", summary="编辑阶段")
async def update_stage(
    stage_id: UUID,
    payload: StageUpdateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[StageOut]:
    service = StageService(db)
    stage = await service.update_stage(user_id, stage_id, payload)
    return ApiResponse(data=stage)


@router.post("/{stage_id}/evaluate", summary="评估阶段结果")
async def evaluate_stage(
    stage_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[StageEvaluateData]:
    service = StageService(db)
    data = await service.evaluate_stage(user_id, stage_id)
    return ApiResponse(data=data)
