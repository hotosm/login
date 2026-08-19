"""API token schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.core.apps import AllowedApp


class ApiTokenCreateRequest(BaseModel):
    """Request to generate a token for an app."""

    app: AllowedApp


class ApiTokenMetadata(BaseModel):
    """Token metadata returned in list responses. Never includes the plaintext."""

    id: UUID
    app: AllowedApp
    created_at: datetime
    last_used_at: datetime | None = None

    model_config = {"from_attributes": True}


class ApiTokenCreated(BaseModel):
    """Response after generating a token. The plaintext is shown only once."""

    id: UUID
    app: AllowedApp
    token: str
    created_at: datetime
