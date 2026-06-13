from datetime import date, datetime
from typing import Any

from app.infrastructure.db.models import CheckinModel, FlagModel, StageModel, UserModel


def flag_to_dict(flag: FlagModel) -> dict[str, Any]:
    return {
        "id": str(flag.id),
        "user_id": str(flag.user_id),
        "title": flag.title,
        "description": flag.description,
        "category": flag.category,
        "start_date": flag.start_date.isoformat() if isinstance(flag.start_date, date) else flag.start_date,
        "target_date": flag.target_date.isoformat() if isinstance(flag.target_date, date) else flag.target_date,
        "status": flag.status,
        "cover": flag.cover,
    }


def flag_to_dict_with_dates(flag: FlagModel) -> dict[str, Any]:
    return {
        **flag_to_dict(flag),
        "start_date": flag.start_date if isinstance(flag.start_date, date) else date.fromisoformat(str(flag.start_date)),
        "target_date": flag.target_date if isinstance(flag.target_date, date) else date.fromisoformat(str(flag.target_date)),
    }


def stage_to_dict(stage: StageModel) -> dict[str, Any]:
    return {
        "id": str(stage.id),
        "flag_id": str(stage.flag_id),
        "title": stage.title,
        "goal": stage.goal,
        "start_date": stage.start_date.isoformat() if isinstance(stage.start_date, date) else stage.start_date,
        "end_date": stage.end_date.isoformat() if isinstance(stage.end_date, date) else stage.end_date,
        "checkin_frequency": stage.checkin_frequency,
        "reward": stage.reward,
        "punishment": stage.punishment,
        "status": stage.status,
    }


def stage_to_dict_with_dates(stage: StageModel) -> dict[str, Any]:
    return {
        **stage_to_dict(stage),
        "start_date": stage.start_date if isinstance(stage.start_date, date) else date.fromisoformat(str(stage.start_date)),
        "end_date": stage.end_date if isinstance(stage.end_date, date) else date.fromisoformat(str(stage.end_date)),
    }


def checkin_to_dict(checkin: CheckinModel) -> dict[str, Any]:
    created = checkin.created_at
    if isinstance(created, datetime):
        created_str = created.date().isoformat()
    else:
        created_str = str(created)
    checkin_date = checkin.checkin_date
    if isinstance(checkin_date, date):
        checkin_date_str = checkin_date.isoformat()
    else:
        checkin_date_str = str(checkin_date)
    return {
        "id": str(checkin.id),
        "user_id": str(checkin.user_id),
        "flag_id": str(checkin.flag_id),
        "stage_id": str(checkin.stage_id),
        "content": checkin.content,
        "images": checkin.images or [],
        "mood": checkin.mood,
        "checkin_date": checkin_date_str,
        "created_at": created_str,
    }


def user_to_dict(user: UserModel, logged_in: bool = True) -> dict[str, Any]:
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "open_id": user.open_id,
        "logged_in": logged_in,
    }
