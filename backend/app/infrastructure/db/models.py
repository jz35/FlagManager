from datetime import UTC, datetime
from uuid import UUID as PyUUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    open_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(128), nullable=False, default="微信用户")
    avatar_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    flags: Mapped[list["FlagModel"]] = relationship(back_populates="user")


class FlagModel(Base):
    __tablename__ = "flags"
    __table_args__ = (
        CheckConstraint("target_date >= start_date", name="ck_flags_target_after_start"),
        CheckConstraint(
            "status IN ('active','paused','completed','abandoned')",
            name="ck_flags_status",
        ),
        Index("ix_flags_user_status", "user_id", "status"),
    )

    id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    target_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active")
    cover: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    user: Mapped["UserModel"] = relationship(back_populates="flags")
    stages: Mapped[list["StageModel"]] = relationship(back_populates="flag", cascade="all, delete-orphan")
    checkins: Mapped[list["CheckinModel"]] = relationship(back_populates="flag", cascade="all, delete-orphan")


class StageModel(Base):
    __tablename__ = "stages"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="ck_stages_end_after_start"),
        CheckConstraint(
            "status IN ('pending','active','completed','failed')",
            name="ck_stages_status",
        ),
        Index("ix_stages_flag_status", "flag_id", "status"),
    )

    id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    flag_id: Mapped[PyUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("flags.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    goal: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    checkin_frequency: Mapped[str] = mapped_column(String(64), nullable=False)
    reward: Mapped[str] = mapped_column(Text, nullable=False, default="")
    punishment: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    flag: Mapped["FlagModel"] = relationship(back_populates="stages")
    checkins: Mapped[list["CheckinModel"]] = relationship(back_populates="stage", cascade="all, delete-orphan")


class CheckinModel(Base):
    __tablename__ = "checkins"
    __table_args__ = (
        Index("ix_checkins_user_date", "user_id", "checkin_date"),
        Index("ix_checkins_flag_date", "flag_id", "checkin_date"),
        Index("ix_checkins_stage_date", "stage_id", "checkin_date"),
    )

    id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[PyUUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    flag_id: Mapped[PyUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("flags.id", ondelete="CASCADE"), nullable=False
    )
    stage_id: Mapped[PyUUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("stages.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    mood: Mapped[str] = mapped_column(String(32), nullable=False)
    checkin_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    flag: Mapped["FlagModel"] = relationship(back_populates="checkins")
    stage: Mapped["StageModel"] = relationship(back_populates="checkins")
