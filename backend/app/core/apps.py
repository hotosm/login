"""Allowed HOT applications for API token scoping."""

from enum import StrEnum


class AllowedApp(StrEnum):
    """Apps that can be scoped to an API token."""

    FAIR = "fair"
    DRONE_TM = "drone-tm"
    OAM = "oam"
    PORTAL = "portal"
