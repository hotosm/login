"""Permission catalog: which permissions each tool has and which role gets them.

Permission keys are strings `tool:resource.action` (e.g. `portal:plans.edit`).
Roles are cumulative: a role gets its own permissions plus those of every
lower-ranked role available in the tool.
"""

from dataclasses import dataclass

from hotosm_permissions.roles import ROLE_RANK, Role


@dataclass(frozen=True)
class Permission:
    """One permission key and a short English description."""

    key: str
    description: str


@dataclass(frozen=True)
class ToolCatalog:
    """The permissions of one tool and the role that first gets each one."""

    tool: str
    available_roles: tuple[Role, ...]
    permissions: tuple[Permission, ...]
    # Permissions introduced at each role; higher roles inherit them.
    role_permissions: dict[Role, tuple[str, ...]]

    def __post_init__(self) -> None:
        """Check that keys belong to this tool and roles are available."""
        keys = {p.key for p in self.permissions}
        for key in keys:
            if not key.startswith(f"{self.tool}:"):
                raise ValueError(f"Permission {key!r} does not belong to {self.tool!r}")
        for role, granted in self.role_permissions.items():
            if role not in self.available_roles:
                raise ValueError(f"Role {role!r} is not available in {self.tool!r}")
            missing = set(granted) - keys
            if missing:
                raise ValueError(f"Unknown permissions in {self.tool!r}: {missing}")

    def permissions_for(self, role: Role) -> frozenset[str]:
        """All permissions a role gets in this tool, including inherited ones."""
        if role not in self.available_roles:
            return frozenset()
        return frozenset(
            key
            for granted_role, keys in self.role_permissions.items()
            if ROLE_RANK[granted_role] <= ROLE_RANK[role]
            for key in keys
        )


PORTAL = ToolCatalog(
    tool="portal",
    available_roles=("viewer", "editor", "owner"),
    permissions=(
        Permission("portal:plans.view", "View a plan"),
        Permission("portal:plans.edit", "Edit a plan and its projects"),
        Permission("portal:plans.share", "Share a plan with others"),
        Permission("portal:plans.attribute", "Attribute a plan to an organization"),
        Permission("portal:plans.delete", "Delete a plan"),
    ),
    role_permissions={
        "viewer": ("portal:plans.view",),
        "editor": ("portal:plans.edit",),
        "owner": (
            "portal:plans.share",
            "portal:plans.attribute",
            "portal:plans.delete",
        ),
    },
)

CHATMAP = ToolCatalog(
    tool="chatmap",
    available_roles=("viewer", "contributor", "editor", "owner"),
    permissions=(
        Permission("chatmap:maps.view", "View a map"),
        Permission("chatmap:tags.add", "Add tags to points"),
        Permission("chatmap:points.edit", "Edit points"),
        Permission("chatmap:maps.share", "Share a map with others"),
        Permission("chatmap:maps.delete", "Delete a map"),
    ),
    role_permissions={
        "viewer": ("chatmap:maps.view",),
        "contributor": ("chatmap:tags.add",),
        "editor": ("chatmap:points.edit",),
        "owner": ("chatmap:maps.share", "chatmap:maps.delete"),
    },
)

# `oam:imagery.moderate` is for platform admins only and is not modeled here:
# platform roles are out of scope for item-level permissions for now.
OAM = ToolCatalog(
    tool="oam",
    available_roles=("viewer", "owner"),
    permissions=(
        Permission("oam:imagery.view", "View imagery"),
        Permission("oam:imagery.attribute", "Attribute imagery to an organization"),
        Permission("oam:imagery.delete", "Delete imagery"),
    ),
    role_permissions={
        "viewer": ("oam:imagery.view",),
        "owner": ("oam:imagery.attribute", "oam:imagery.delete"),
    },
)

CATALOGS: dict[str, ToolCatalog] = {c.tool: c for c in (PORTAL, CHATMAP, OAM)}


def get_catalog(tool: str) -> ToolCatalog:
    """Return the catalog of a tool.

    Raises:
        ValueError: If the tool has no catalog.
    """
    try:
        return CATALOGS[tool]
    except KeyError:
        known = ", ".join(sorted(CATALOGS))
        raise ValueError(f"Unknown tool {tool!r}; known tools: {known}") from None
