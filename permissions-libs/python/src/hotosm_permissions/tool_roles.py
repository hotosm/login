"""Which roles a tool enables and how they are shown to its users."""

from collections.abc import Iterable, Mapping
from typing import Literal, cast

from pydantic import BaseModel

from hotosm_permissions.catalog import ToolCatalog, get_catalog
from hotosm_permissions.roles import (
    DEFAULT_ROLE_DISPLAY,
    ROLES,
    GrantableRole,
    Role,
    RoleDisplay,
)


class RoleOption(BaseModel):
    """A role as offered in the share dialog, already localized."""

    key: Role
    label: str
    description: str


class ToolRoles:
    """The roles one tool enables, with their display texts.

    Example:
        ChatMap enables `contributor` and renames it::

            chatmap_roles = ToolRoles(
                "chatmap",
                roles=["viewer", "contributor", "editor", "owner"],
                display={
                    "contributor": RoleDisplay(
                        label={"en": "Add tags"},
                        description={
                            "en": "Can add tags to points, but not edit them",
                        },
                    ),
                },
            )
            chatmap_roles.has_permission("contributor", "chatmap:tags.add")  # True
            chatmap_roles.has_permission("contributor", "chatmap:points.edit")  # False
    """

    def __init__(
        self,
        tool: str,
        roles: Iterable[Role],
        display: Mapping[Role, RoleDisplay] | None = None,
    ) -> None:
        """Validate and store the tool's roles.

        Raises:
            ValueError: If the tool is unknown, a role is not available for
                the tool, `owner` is not enabled, or `display` overrides a
                role that is not enabled.
        """
        self.catalog: ToolCatalog = get_catalog(tool)
        self.tool = tool
        enabled = set(roles)
        unavailable = enabled - set(self.catalog.available_roles)
        if unavailable:
            raise ValueError(f"Roles not available in {tool!r}: {sorted(unavailable)}")
        if "owner" not in enabled:
            raise ValueError(f"{tool!r} must enable the 'owner' role")
        self.roles: tuple[Role, ...] = tuple(r for r in ROLES if r in enabled)
        self._display: dict[Role, RoleDisplay] = dict(display or {})
        not_enabled = set(self._display) - enabled
        if not_enabled:
            raise ValueError(
                f"Display overrides for roles not enabled in {tool!r}: "
                f"{sorted(not_enabled)}"
            )

    @property
    def grantable_roles(self) -> tuple[GrantableRole, ...]:
        """Enabled roles that can be granted to others (all but `owner`)."""
        return tuple(cast(GrantableRole, r) for r in self.roles if r != "owner")

    def has_permission(self, role: str, permission: str) -> bool:
        """Whether a role has a permission; False for anything unknown."""
        if role not in self.roles:
            return False
        return permission in self.catalog.permissions_for(cast(Role, role))

    def role_options(self, locale: str = "en") -> list[RoleOption]:
        """The enabled roles in rank order, localized for the share dialog.

        Each text is the tool's override for the locale, else the tool's
        override in `en`, else the default for the locale, else the default in
        `en`.
        """
        return [
            RoleOption(
                key=role,
                label=self._text(role, "label", locale),
                description=self._text(role, "description", locale),
            )
            for role in self.roles
        ]

    def _text(
        self, role: Role, field: Literal["label", "description"], locale: str
    ) -> str:
        override: dict[str, str] = getattr(
            self._display.get(role, RoleDisplay()), field
        )
        default: dict[str, str] = getattr(DEFAULT_ROLE_DISPLAY[role], field)
        for texts, key in ((override, locale), (override, "en"), (default, locale)):
            if key in texts:
                return texts[key]
        return default["en"]
