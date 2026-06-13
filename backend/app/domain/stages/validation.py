import re
from datetime import date


def is_not_empty(value: str | None) -> bool:
    return isinstance(value, str) and value.strip() != ""


def is_date_range_valid(start_date: date, end_date: date) -> bool:
    return end_date >= start_date


def parse_checkin_frequency(freq: str) -> tuple[str, int]:
    if freq == "daily":
        return "day", 1
    if freq == "weekly3":
        return "week", 3
    if freq.startswith("custom:"):
        _, period, times = freq.split(":")
        return period, int(times) if times.isdigit() else 1
    raise ValueError(f"Invalid checkin frequency: {freq}")


def validate_checkin_frequency(freq: str) -> bool:
    if freq in ("daily", "weekly3"):
        return True
    match = re.fullmatch(r"custom:(day|week|month):([1-7])", freq)
    return match is not None


def validate_stage_payload(
    title: str,
    goal: str,
    start_date: date,
    end_date: date | None,
    checkin_frequency: str,
) -> str | None:
    if not is_not_empty(title):
        return "请填写阶段名称"
    if not is_not_empty(goal):
        return "请填写阶段目标"
    if end_date is None:
        return "请选择结束日期"
    if not is_date_range_valid(start_date, end_date):
        return "结束日期不能早于开始日期"
    if not validate_checkin_frequency(checkin_frequency):
        return "打卡频率格式无效"
    return None


def can_stage_checkin(status: str) -> bool:
    return status in ("pending", "active")
