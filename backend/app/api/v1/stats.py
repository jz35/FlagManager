from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.stats_service import StatsService
from app.core.response import ApiResponse, ItemsWrapper
from app.core.security import get_current_user_id
from app.infrastructure.db.session import get_db
from app.schemas.common import (
    FlagProgressItem,
    HeatmapItem,
    StatsOverviewData,
    TodayPendingItem,
)

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview", summary="统计概览")
async def stats_overview(
    flag_id: UUID | None = Query(default=None, alias="flagId"),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[StatsOverviewData]:
    service = StatsService(db)
    data = await service.overview(user_id, flag_id)
    return ApiResponse(data=data)


@router.get("/heatmap", summary="打卡热力图")
async def stats_heatmap(
    flag_id: UUID | None = Query(default=None, alias="flagId"),
    days: int = Query(default=84, ge=1, le=365),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[HeatmapItem]]:
    service = StatsService(db)
    items = await service.heatmap(user_id, flag_id, days)
    return ApiResponse(data=ItemsWrapper(items=items))


@router.get("/flag-progress", summary="Flag 进度")
async def stats_flag_progress(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[FlagProgressItem]]:
    service = StatsService(db)
    items = await service.flag_progress(user_id)
    return ApiResponse(data=ItemsWrapper(items=items))


@router.get("/today-pending-stages", summary="今日待打卡阶段")
async def stats_today_pending(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ItemsWrapper[TodayPendingItem]]:
    service = StatsService(db)
    items = await service.today_pending_stages(user_id)
    return ApiResponse(data=ItemsWrapper(items=items))
