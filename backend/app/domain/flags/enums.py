from enum import StrEnum


class FlagStatus(StrEnum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


VALID_FLAG_STATUSES = {s.value for s in FlagStatus}
