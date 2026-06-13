from datetime import date

from pydantic import Field

from app.core.response import CamelModel


class UserOut(CamelModel):
    id: str
    nickname: str
    avatar_url: str = Field(alias="avatarUrl")
    bio: str = ""
    open_id: str = Field(alias="openId")
    logged_in: bool = Field(alias="loggedIn")


class LoginRequest(CamelModel):
    code: str
    nickname: str = "微信用户"
    avatar_url: str = Field(default="", alias="avatarUrl")


class LoginData(CamelModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")
    user: UserOut


class LogoutData(CamelModel):
    logged_out: bool = Field(alias="loggedOut")


class FlagOut(CamelModel):
    id: str
    user_id: str = Field(alias="userId")
    title: str
    description: str = ""
    category: str
    start_date: date = Field(alias="startDate")
    target_date: date = Field(alias="targetDate")
    status: str
    cover: str = ""


class FlagCreateRequest(CamelModel):
    title: str
    description: str = ""
    category: str
    start_date: date = Field(alias="startDate")
    target_date: date = Field(alias="targetDate")


class FlagUpdateRequest(CamelModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    start_date: date | None = Field(default=None, alias="startDate")
    target_date: date | None = Field(default=None, alias="targetDate")
    cover: str | None = None


class FlagStatusRequest(CamelModel):
    status: str


class FlagDetailData(CamelModel):
    flag: FlagOut
    stages: list["StageOut"]
    recent_checkins: list["CheckinOut"] = Field(alias="recentCheckins")


class StageOut(CamelModel):
    id: str
    flag_id: str = Field(alias="flagId")
    title: str
    goal: str
    start_date: date = Field(alias="startDate")
    end_date: date = Field(alias="endDate")
    checkin_frequency: str = Field(alias="checkinFrequency")
    reward: str = ""
    punishment: str = ""
    status: str


class StageCreateRequest(CamelModel):
    flag_id: str = Field(alias="flagId")
    title: str
    goal: str
    start_date: date = Field(alias="startDate")
    end_date: date = Field(alias="endDate")
    checkin_frequency: str = Field(alias="checkinFrequency")
    reward: str = ""
    punishment: str = ""


class StageUpdateRequest(CamelModel):
    title: str | None = None
    goal: str | None = None
    start_date: date | None = Field(default=None, alias="startDate")
    end_date: date | None = Field(default=None, alias="endDate")
    checkin_frequency: str | None = Field(default=None, alias="checkinFrequency")
    reward: str | None = None
    punishment: str | None = None
    status: str | None = None


class StageDetailStats(CamelModel):
    progress: int
    expected: int
    actual: int
    passed: bool
    miss_count: int = Field(alias="missCount")
    current_streak: int = Field(alias="currentStreak")


class StageDetailData(CamelModel):
    stage: StageOut
    flag: FlagOut
    checkins: list["CheckinOut"]
    stats: StageDetailStats


class StageEvaluateData(CamelModel):
    stage: StageOut
    expected: int
    actual: int
    passed: bool


class CheckinOut(CamelModel):
    id: str
    user_id: str = Field(alias="userId")
    flag_id: str = Field(alias="flagId")
    stage_id: str = Field(alias="stageId")
    content: str
    images: list[str] = []
    mood: str
    checkin_date: date = Field(alias="checkinDate")
    created_at: date = Field(alias="createdAt")


class CheckinCreateRequest(CamelModel):
    flag_id: str = Field(alias="flagId")
    stage_id: str = Field(alias="stageId")
    content: str
    mood: str
    images: list[str] = []
    checkin_date: date = Field(alias="checkinDate")


class StatsOverviewData(CamelModel):
    total_checkin_days: int = Field(alias="totalCheckinDays")
    current_streak: int = Field(alias="currentStreak")
    longest_streak: int = Field(alias="longestStreak")
    month_count: int = Field(alias="monthCount")


class HeatmapItem(CamelModel):
    date: str
    count: int


class FlagProgressItem(CamelModel):
    flag_id: str = Field(alias="flagId")
    percent: int


class TodayPendingItem(CamelModel):
    stage: StageOut
    flag: FlagOut


class HealthData(CamelModel):
    status: str = "ok"
