"""Admin schemas for user mapping management."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MappingResponse(BaseModel):
    """Response schema for a single user mapping."""

    hanko_user_id: str = Field(..., description="Hanko user UUID")
    app_user_id: str = Field(..., description="Application-specific user ID")
    app_name: str = Field(..., description="Application name")
    created_at: datetime = Field(..., description="When the mapping was created")
    updated_at: Optional[datetime] = Field(None, description="When the mapping was last updated")
    # Enriched fields (optional)
    hanko_email: Optional[str] = Field(None, description="Email from Hanko")
    app_username: Optional[str] = Field(None, description="Username from app")
    app_email: Optional[str] = Field(None, description="Email from app")

    class Config:
        from_attributes = True


class MappingListResponse(BaseModel):
    """Paginated list of user mappings."""

    items: list[MappingResponse] = Field(..., description="List of mappings")
    total: int = Field(..., description="Total number of mappings")
    page: int = Field(..., description="Current page number (1-indexed)")
    page_size: int = Field(..., description="Number of items per page")


class MappingCreate(BaseModel):
    """Request schema for creating a new mapping."""

    hanko_user_id: str = Field(..., description="Hanko user UUID")
    app_user_id: str = Field(..., description="Application-specific user ID")


class MappingUpdate(BaseModel):
    """Request schema for updating an existing mapping."""

    app_user_id: str = Field(..., description="New application-specific user ID")
