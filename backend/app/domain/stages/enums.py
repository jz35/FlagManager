from enum import StrEnum


class StageStatus(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


VALID_STAGE_STATUSES = {s.value for s in StageStatus}
