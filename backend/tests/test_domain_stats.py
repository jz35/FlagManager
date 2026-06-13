import pytest
from datetime import date, timedelta

from app.domain.stats.calculator import (
    build_heatmap_days,
    get_current_streak,
    get_expected_checkin_count,
    get_flag_progress,
    parse_checkin_frequency,
)
from app.domain.stages.validation import parse_checkin_frequency as parse_freq, validate_checkin_frequency


class TestParseCheckinFrequency:
    def test_daily(self):
        assert parse_checkin_frequency("daily") == {"period": "day", "times": 1}
        assert parse_freq("daily") == ("day", 1)

    def test_weekly3(self):
        assert parse_checkin_frequency("weekly3") == {"period": "week", "times": 3}

    def test_custom_week(self):
        assert parse_checkin_frequency("custom:week:3") == {"period": "week", "times": 3}
        assert validate_checkin_frequency("custom:week:3") is True

    def test_custom_day(self):
        assert validate_checkin_frequency("custom:day:7") is True

    def test_custom_month(self):
        assert validate_checkin_frequency("custom:month:2") is True

    def test_invalid(self):
        assert validate_checkin_frequency("invalid") is False


class TestExpectedCheckinCount:
    def test_daily_range(self):
        stage = {
            "start_date": date(2026, 6, 1),
            "end_date": date(2026, 6, 7),
            "checkin_frequency": "daily",
        }
        assert get_expected_checkin_count(stage) == 7

    def test_weekly3(self):
        stage = {
            "start_date": date(2026, 6, 1),
            "end_date": date(2026, 6, 14),
            "checkin_frequency": "weekly3",
        }
        assert get_expected_checkin_count(stage) == 6


class TestStreak:
    def test_current_streak_with_today(self):
        today = date(2026, 6, 13)
        checkins = [
            {"checkin_date": "2026-06-13"},
            {"checkin_date": "2026-06-12"},
            {"checkin_date": "2026-06-11"},
        ]
        assert get_current_streak(checkins, today) == 3

    def test_current_streak_without_today(self):
        today = date(2026, 6, 13)
        checkins = [
            {"checkin_date": "2026-06-12"},
            {"checkin_date": "2026-06-11"},
        ]
        assert get_current_streak(checkins, today) == 2


class TestFlagProgress:
    def test_abandoned_returns_zero(self):
        flag = {
            "id": "f1",
            "status": "abandoned",
            "start_date": date(2026, 1, 1),
            "target_date": date(2026, 12, 31),
        }
        assert get_flag_progress(flag, [], [], date(2026, 6, 13)) == 0

    def test_no_stages_time_progress(self):
        flag = {
            "id": "f1",
            "status": "active",
            "start_date": date(2026, 6, 1),
            "target_date": date(2026, 6, 11),
        }
        progress = get_flag_progress(flag, [], [], date(2026, 6, 6))
        assert progress == 55


class TestHeatmap:
    def test_build_heatmap_days(self):
        today = date(2026, 6, 13)
        checkins = [{"checkin_date": "2026-06-13"}, {"checkin_date": "2026-06-13"}]
        items = build_heatmap_days(checkins, days=3, today=today)
        assert len(items) == 3
        assert items[-1]["count"] == 2
