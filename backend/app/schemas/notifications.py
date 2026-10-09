"""Schemas for in-app notifications.

Notifications carry no display text: ``type`` tells the frontend which message
to render and ``data`` gives it the values to interpolate, so the copy stays
translatable client-side.
"""

from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """A single notification addressed to the current user."""

    id: str
    type: str
    data: dict | None = None
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
