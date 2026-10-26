"""Schemas for teams, organizations, members and invitations.

This is the public contract consumed by portal (and later ChatMap), so field
names and shapes are kept stable and explicit.
"""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, Field, field_validator

from app.utils.youtube import normalize_youtube_url

GroupType = Literal["team", "organization"]
GroupStatus = Literal["pending", "approved", "rejected"]
MemberRole = Literal["owner", "manager", "member"]
InvitationStatus = Literal["pending", "accepted", "declined", "expired", "revoked"]

# Locales a group's content can be written in, base or translation: every
# current two-letter ISO 639-1 code (he/id/yi, not the withdrawn iw/in/ji),
# except Swahili ("sw"), which is left out on purpose. Validated here, not in
# the database.
BASE_LOCALES: frozenset[str] = frozenset(
    (
        "aa ab ae af ak am an ar as av ay az ba be bg bi bm bn bo br bs "
        "ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy "
        "ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv "
        "ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv "
        "mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os "
        "pa pi pl ps pt qu rm rn ro ru rw "
        "sa sc sd se sg si sk sl sm sn so sq sr ss st su sv "
        "ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo "
        "za zh zu "
    ).split()
)

# Group fields that can be translated. Adding one takes a column on groups and
# group_translations (plus migration), a field on GroupTranslationFields and an
# entry here.
TRANSLATABLE_GROUP_FIELDS: tuple[str, ...] = ("description", "tagline", "video_url")


def _clean_tagline(value: object) -> object:
    """Trim a tagline; blank means none."""
    if isinstance(value, str):
        return value.strip() or None
    return value


# Shared by the base fields (GroupUpdate) and every translation.
# description holds markdown; clients render it with react-markdown, which
# doesn't run embedded HTML.
Description = Annotated[str | None, Field(max_length=5000)]
Tagline = Annotated[str | None, BeforeValidator(_clean_tagline), Field(max_length=120)]
# Any accepted YouTube link, stored as https://www.youtube.com/watch?v=ID.
YouTubeUrl = Annotated[str | None, BeforeValidator(normalize_youtube_url)]


# --- Groups ----------------------------------------------------------------


class GroupTranslationFields(BaseModel):
    """A group's translatable fields in one locale."""

    description: Description = None
    tagline: Tagline = None
    video_url: YouTubeUrl = None


class GroupCreate(BaseModel):
    """Request to create a team or organization."""

    type: GroupType
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=5000)
    contact_email: str | None = Field(None, max_length=320)
    website: str | None = Field(None, max_length=500)
    # Teams may seed members on creation by email (added directly, no invite).
    member_emails: list[str] | None = None


class GroupUpdate(BaseModel):
    """Editable group details. The ``name`` is NOT editable here.

    For organizations, changing the name goes through ``/name-change`` and
    requires account-manager approval.
    """

    # Base content, in default_locale.
    description: Description = None
    tagline: Tagline = None
    video_url: YouTubeUrl = None
    contact_email: str | None = Field(None, max_length=320)
    website: str | None = Field(None, max_length=500)
    is_public: bool | None = None
    # Locale the base fields above are written in: any of BASE_LOCALES.
    default_locale: str | None = None
    # Per locale (any of BASE_LOCALES): absent leaves it as is, an object
    # replaces that locale's fields, null removes it. The default locale's
    # content goes in the base fields, not here.
    translations: dict[str, GroupTranslationFields | None] | None = None

    @field_validator("default_locale")
    @classmethod
    def _known_base_locale(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.lower()
        if value not in BASE_LOCALES:
            raise ValueError("default_locale must be a two-letter ISO 639-1 code")
        return value

    @field_validator("translations")
    @classmethod
    def _known_translation_locales(
        cls, value: dict[str, GroupTranslationFields | None] | None
    ) -> dict[str, GroupTranslationFields | None] | None:
        if value is None:
            return None
        unknown = sorted(locale for locale in value if locale not in BASE_LOCALES)
        if unknown:
            raise ValueError(
                f"Unknown translation locales: {', '.join(unknown)} "
                "(must be two-letter ISO 639-1 codes)"
            )
        return value


class NameChangeRequest(BaseModel):
    """Request to change a group's name."""

    name: str = Field(..., min_length=1, max_length=200)


class GroupResponse(BaseModel):
    """Full group details (Details tab / management views)."""

    id: str
    type: GroupType
    name: str
    slug: str
    description: str | None = None
    tagline: str | None = None
    video_url: str | None = None
    contact_email: str | None = None
    website: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    status: GroupStatus
    pending_name: str | None = None
    is_public: bool
    default_locale: str
    # Only filled on single-group reads/updates; empty in listings.
    translations: dict[str, GroupTranslationFields] = Field(default_factory=dict)
    created_by: str
    # Resolved requester identity, when the endpoint looks it up (moderation
    # views). Best-first: profile name, then Hanko username, then Hanko email.
    created_by_name: str | None = None
    created_by_username: str | None = None
    created_by_email: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    # The requesting user's role in this group, when known.
    role: MemberRole | None = None
    members_count: int | None = None


class GroupListResponse(BaseModel):
    """Paginated list of groups."""

    items: list[GroupResponse]
    total: int
    page: int
    page_size: int


# --- Members ---------------------------------------------------------------


class MemberAdd(BaseModel):
    """Add a member directly by email (teams only)."""

    email: str = Field(..., min_length=3, max_length=320)
    role: MemberRole = "member"


class MemberRoleUpdate(BaseModel):
    """Change a member's role."""

    role: MemberRole


class MemberResponse(BaseModel):
    """A group member, enriched with profile data when available."""

    hanko_user_id: str
    role: MemberRole
    first_name: str | None = None
    last_name: str | None = None
    picture_url: str | None = None
    email: str | None = None
    created_at: datetime


class MemberListResponse(BaseModel):
    """Paginated list of members."""

    items: list[MemberResponse]
    total: int
    page: int
    page_size: int


# --- Invitations (organizations only) --------------------------------------


class InvitationCreate(BaseModel):
    """Invite a user to an organization by email."""

    email: str = Field(..., min_length=3, max_length=320)
    role: MemberRole = "member"


class InvitationResponse(BaseModel):
    """An organization invitation."""

    id: str
    group_id: str
    email: str
    role: MemberRole
    status: InvitationStatus
    invited_by: str
    created_at: datetime
    expires_at: datetime
    # Whether the invited email already has a HOT account. Set only on create;
    # None when unknown (e.g. Hanko unreachable) or in listings.
    recipient_exists: bool | None = None


class MyInvitationResponse(InvitationResponse):
    """An invitation as seen by its recipient, with group context.

    Includes the accept/decline ``token``: safe to expose here because the list
    is scoped to the recipient's own email.
    """

    token: str
    group_name: str
    group_type: GroupType


# --- Consumer contract (portal, ChatMap) -----------------------------------


class MyGroupItem(BaseModel):
    """A group the current user belongs to (for the plan scope selector)."""

    id: str
    type: GroupType
    slug: str
    name: str
    role: MemberRole
    status: GroupStatus
    avatar_url: str | None = None


class MyGroupsResponse(BaseModel):
    """The full set of groups a user belongs to (single call, no N+1)."""

    groups: list[MyGroupItem]


class MembershipCheckResponse(BaseModel):
    """Answer to 'is this user a member of this group (with >= role)?'."""

    is_member: bool
    role: MemberRole | None = None
    satisfies_min_role: bool


# --- Public profiles (rendered by portal in a later stage) -----------------


class PublicGroupResponse(BaseModel):
    """Public-facing group profile."""

    type: GroupType
    name: str
    slug: str
    description: str | None = None
    tagline: str | None = None
    video_url: str | None = None
    contact_email: str | None = None
    website: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    members_count: int


class PublicGroupProfileResponse(PublicGroupResponse):
    """A group's own public profile, with translatable fields in one locale.

    Kept apart from PublicGroupResponse so the user's group listing, which
    returns base values, keeps its shape.
    """

    id: str
    default_locale: str
    # Locale each translatable field was actually returned in.
    field_locales: dict[str, str]
    # The default locale first, then every locale with a translation.
    available_locales: list[str]


class PublicUserResponse(BaseModel):
    """Public-facing user profile."""

    slug: str
    # Internal cross-service join key (e.g. for Portal's own per-user tables).
    # Not a secret — login's own by-id profile lookup is already unauthenticated.
    hanko_user_id: str
    first_name: str | None = None
    last_name: str | None = None
    picture_url: str | None = None


class PublicUserGroupsResponse(BaseModel):
    """Public organizations/teams a user owns."""

    items: list[PublicGroupResponse]
