from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class ApiResponse(BaseModel, Generic[T]):
    data: T
    message: str = "ok"


class ItemsWrapper(CamelModel, Generic[T]):
    items: list[T]
