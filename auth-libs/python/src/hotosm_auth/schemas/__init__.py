"""Pydantic schemas for hotosm-auth."""

from .admin import (
    MappingCreate,
    MappingListResponse,
    MappingResponse,
    MappingUpdate,
)

__all__ = [
    "MappingResponse",
    "MappingListResponse",
    "MappingCreate",
    "MappingUpdate",
]
