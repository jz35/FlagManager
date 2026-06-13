import math
from datetime import date, timedelta
from typing import Any


def days_between(start: date, end: date) -> int:
    return (end - start).days


def today_str(today: date | None = None) -> str:
    d = today or date.today()
    return d.isoformat()


def format_date(d: date) -> str:
    return d.isoformat()


def parse_checkin_frequency(freq: str) -> dict[str, Any]:
    if freq == "daily":
        return {"period": "day", "times": 1}
    if freq == "weekly3":
        return {"period": "week", "times": 3}
    if freq.startswith("custom:"):
        _, period, times = freq.split(":")
        return {"period": period, "times": int(times) if times.isdigit() else 1}
    return {"period": "day", "times": 1}


def get_expected_checkin_count(stage: dict[str, Any]) -> int:
    total_days = max(1, days_between(stage["start_date"], stage["end_date"]) + 1)
    parsed = parse_checkin_frequency(stage["checkin_frequency"])
    period = parsed["period"]
    times = parsed["times"]
    if period == "day":
        return total_days * times
    if period == "week":
        return math.ceil(total_days / 7) * times
    if period == "month":
        return math.ceil(total_days / 30) * times
    return total_days


def unique_dates(checkins: list[dict[str, Any]]) -> list[str]:
    return sorted({c["checkin_date"] for c in checkins})


def get_total_checkin_days(checkins: list[dict[str, Any]]) -> int:
    return len(unique_dates(checkins))


def get_current_streak(checkins: list[dict[str, Any]], today: date | None = None) -> int:
    dates = unique_dates(checkins)
    if not dates:
        return 0
    date_set = set(dates)
    today_date = today or date.today()
    cursor = today_date
    if format_date(cursor) not in date_set:
        cursor = cursor - timedelta(days=1)
    streak = 0
    while format_date(cursor) in date_set:
        streak += 1
        cursor = cursor - timedelta(days=1)
    return streak


def get_longest_streak(checkins: list[dict[str, Any]]) -> int:
    dates = unique_dates(checkins)
    if not dates:
        return 0
    max_streak = 1
    current = 1
    for i in range(1, len(dates)):
        prev = date.fromisoformat(dates[i - 1])
        cur = date.fromisoformat(dates[i])
        if (cur - prev).days == 1:
            current += 1
            max_streak = max(max_streak, current)
        else:
            current = 1
    return max_streak


def get_month_checkin_count(checkins: list[dict[str, Any]], ref: date | None = None) -> int:
    ref_date = ref or date.today()
    return sum(
        1
        for c in checkins
        if date.fromisoformat(c["checkin_date"]).year == ref_date.year
        and date.fromisoformat(c["checkin_date"]).month == ref_date.month
    )


def get_stage_progress(stage: dict[str, Any], checkins: list[dict[str, Any]]) -> int:
    stage_checkins = [c for c in checkins if c["stage_id"] == stage["id"]]
    expected = get_expected_checkin_count(stage)
    done = len(stage_checkins)
    return min(100, round((done / expected) * 100))


def get_flag_progress(
    flag: dict[str, Any],
    stages: list[dict[str, Any]],
    checkins: list[dict[str, Any]],
    today: date | None = None,
) -> int:
    if flag["status"] == "abandoned":
        return 0
    flag_stages = [s for s in stages if s["flag_id"] == flag["id"]]
    if not flag_stages:
        today_date = today or date.today()
        total_days = max(1, days_between(flag["start_date"], flag["target_date"]) + 1)
        elapsed = days_between(flag["start_date"], today_date) + 1
        return min(100, round((elapsed / total_days) * 100))
    progresses = [get_stage_progress(s, checkins) for s in flag_stages]
    return round(sum(progresses) / len(progresses))


def build_heatmap_days(checkins: list[dict[str, Any]], days: int = 84, today: date | None = None) -> list[dict[str, Any]]:
    count_map: dict[str, int] = {}
    for c in checkins:
        d = c["checkin_date"]
        count_map[d] = count_map.get(d, 0) + 1
    today_date = today or date.today()
    result = []
    for i in range(days - 1, -1, -1):
        d = today_date - timedelta(days=i)
        date_str = format_date(d)
        result.append({"date": date_str, "count": count_map.get(date_str, 0)})
    return result


def get_today_pending_stages(
    stages: list[dict[str, Any]],
    checkins: list[dict[str, Any]],
    flags: list[dict[str, Any]],
    today: date | None = None,
) -> list[dict[str, Any]]:
    today_date = today or date.today()
    today_s = format_date(today_date)
    active_flag_ids = {f["id"] for f in flags if f["status"] == "active"}
    pending = []
    for stage in stages:
        if flags and stage["flag_id"] not in active_flag_ids:
            continue
        if stage["status"] not in ("active", "pending"):
            continue
        if today_s < stage["start_date"] or today_s > stage["end_date"]:
            continue
        has_today = any(
            c["stage_id"] == stage["id"] and c["checkin_date"] == today_s for c in checkins
        )
        if not has_today:
            pending.append(stage)
    return pending


def evaluate_stage_result(stage: dict[str, Any], checkins: list[dict[str, Any]]) -> dict[str, Any]:
    expected = get_expected_checkin_count(stage)
    actual = len([c for c in checkins if c["stage_id"] == stage["id"]])
    return {"expected": expected, "actual": actual, "passed": actual >= expected}


def is_stage_ended(stage: dict[str, Any], today: date | None = None) -> bool:
    today_date = today or date.today()
    return today_date > stage["end_date"]


def get_stage_miss_count(stage: dict[str, Any], checkins: list[dict[str, Any]]) -> int:
    stage_checkins = [c for c in checkins if c["stage_id"] == stage["id"]]
    expected = get_expected_checkin_count(stage)
    return max(0, expected - len(stage_checkins))
