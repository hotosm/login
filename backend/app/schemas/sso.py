"""Schemas for the SSO linking flow."""

from pydantic import BaseModel, Field


class LinkRequest(BaseModel):
    """The address whose external account should be linked to this HOT user.

    A plain string rather than ``EmailStr``: the address only gets anywhere if
    it matches a verified email on the account, which Hanko already validated,
    so shape checking here would add a dependency and prove nothing.
    """

    email: str = Field(min_length=3, max_length=320)


class MappingResponse(BaseModel):
    """The account a Hanko user has in an external app, if any."""

    hanko_user_id: str
    app_name: str
    app_user_id: str | None = Field(
        default=None, description="None when the person has never used that app"
    )
