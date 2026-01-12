"""Pydantic schemas for hotosm-auth."""

from .admin import (
    MappingResponse,
    MappingListResponse,
    MappingCreate,
    MappingUpdate,
)

__all__ = [
    "MappingResponse",
    "MappingListResponse",
    "MappingCreate",
    "MappingUpdate",
]
