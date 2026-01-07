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

    pass


class ProfileResponse(ProfileBase):
    """Profile response with all fields."""

    hanko_user_id: str
    email: str | None = None  # From Hanko, not stored in profile
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
