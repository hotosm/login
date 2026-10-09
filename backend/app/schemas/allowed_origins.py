"""Schemas for the admin-managed CORS allowlist."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AllowedOriginCreate(BaseModel):
    """Payload to add an origin to the allowlist."""

    origin: str = Field(
        ...,
        max_length=255,
        description="Scheme://host with an optional port, no path "
        "(e.g. https://portal.hotosm.org)",
    )
    note: str | None = Field(
        default=None, max_length=255, description="Which app this is, for the table"
    )


class AllowedOriginUpdate(BaseModel):
    """Payload to change an existing origin. Omitted fields are left alone."""

    note: str | None = Field(default=None, max_length=255)
    enabled: bool | None = None


class AllowedOriginRead(BaseModel):
    """An origin as returned to the admin dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    origin: str
    note: str | None
    enabled: bool
    created_by: str | None
    created_at: datetime
    updated_at: datetime
