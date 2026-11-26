"""Which roles a tool enables and how they are shown to its users."""

from collections.abc import Mapping
from typing import Literal, cast

from pydantic import BaseModel

from hotosm_permissions.catalog import ToolCatalog
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

    The enabled roles are the catalog's `available_roles`.

    Example:
        ChatMap defines its catalog and renames `contributor`::

            chatmap_catalog = ToolCatalog(
                tool="chatmap",
                available_roles=("viewer", "contributor", "editor", "owner"),
                permissions=(
                    Permission("chatmap:maps.view", "View a map"),
                    Permission("chatmap:tags.edit", "Edit tags on points"),
                    Permission("chatmap:points.edit", "Edit points"),
                    Permission("chatmap:maps.share", "Share a map with others"),
                    Permission("chatmap:maps.delete", "Delete a map"),
                ),
                role_permissions={
                    "viewer": ("chatmap:maps.view",),
                    "contributor": ("chatmap:tags.edit",),
                    "editor": ("chatmap:points.edit",),
                    "owner": ("chatmap:maps.share", "chatmap:maps.delete"),
                },
            )
            chatmap_roles = ToolRoles(
                chatmap_catalog,
                display={
                    "contributor": RoleDisplay(
                        label={"en": "Edit tags"},
                        description={
                            "en": "Can edit tags on points, but not the points",
                        },
                    ),
                },
            )
            chatmap_roles.has_permission("contributor", "chatmap:tags.edit")  # True
            chatmap_roles.has_permission("contributor", "chatmap:points.edit")  # False
    """

    def __init__(
        self,
        catalog: ToolCatalog,
        display: Mapping[Role, RoleDisplay] | None = None,
    ) -> None:
        """Validate and store the tool's roles.

        Raises:
            ValueError: If `owner` is not available in the catalog, or
                `display` overrides a role that is not enabled.
        """
        self.catalog: ToolCatalog = catalog
        self.tool = catalog.tool
        enabled = set(catalog.available_roles)
        if "owner" not in enabled:
            raise ValueError(f"{self.tool!r} must enable the 'owner' role")
        self.roles: tuple[Role, ...] = tuple(r for r in ROLES if r in enabled)
        self._display: dict[Role, RoleDisplay] = dict(display or {})
        not_enabled = set(self._display) - enabled
        if not_enabled:
            raise ValueError(
                f"Display overrides for roles not enabled in {self.tool!r}: "
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

    def permissions_for(self, role: str) -> list[str]:
        """Sorted permission keys of an enabled role; [] for anything unknown.

        Tools return it as `my_permissions` so their frontend checks
        permission keys, not roles.
        """
        if role not in self.roles:
            return []
        return sorted(self.catalog.permissions_for(cast(Role, role)))

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
