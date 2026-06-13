from datetime import date


def is_not_empty(value: str | None) -> bool:
    return isinstance(value, str) and value.strip() != ""


def is_date_range_valid(start_date: date, end_date: date) -> bool:
    return end_date >= start_date


def validate_flag_payload(
    title: str,
    start_date: date,
    target_date: date | None,
) -> str | None:
    if not is_not_empty(title):
        return "请填写 Flag 名称"
    if target_date is None:
        return "请选择目标完成日期"
    if not is_date_range_valid(start_date, target_date):
        return "完成日期不能早于开始日期"
    return None


def can_flag_checkin(status: str) -> bool:
    return status == "active"
