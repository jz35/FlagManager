from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.checkin_service import CheckinService
from app.core.response import ApiResponse, ItemsWrapper
from app.core.security import get_current_user_id
from app.infrastructure.db.session import get_db
from app.schemas.common import CheckinCreateRequest, CheckinOut

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.get("", summary="打卡列表")
async def list_checkins(
    flag_id: UUID | None = Query(default=None, alias="flagId"),
    stage_id: UUID | None = Query(default=None, alias="stageId"),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[CheckinOut]]:
    service = CheckinService(db)
    items = await service.list_checkins(user_id, flag_id, stage_id, from_date, to_date)
    return ApiResponse(data=ItemsWrapper(items=items))


@router.post("", summary="创建打卡")
async def create_checkin(
    payload: CheckinCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[CheckinOut]:
    service = CheckinService(db)
    checkin = await service.create_checkin(user_id, payload)
    return ApiResponse(data=checkin)
