"""Profile schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    """Base profile fields."""

    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    picture_url: str | None = Field(None, max_length=500)
    language: str = Field("en", max_length=10)


class ProfileUpdate(ProfileBase):
    """Schema for updating profile."""

    slug: str | None = Field(None, min_length=1, max_length=80)
    is_public: bool | None = None


class ProfileResponse(ProfileBase):
    """Profile response with all fields."""

    hanko_user_id: str
    email: str | None = None  # From Hanko, not stored in profile
    slug: str | None = None
    is_public: bool = False
    # Computed, not stored: None means the slug can be changed right now, a
    # future timestamp means it stays locked until then.
    next_slug_change_at: datetime | None = None
    osm_user_id: int | None = None
    osm_username: str | None = None
    osm_avatar_url: str | None = None
    preferences: dict | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ProfileCreateInternal(ProfileBase):
    """Internal schema for creating profile (includes hanko_user_id)."""

    hanko_user_id: str
