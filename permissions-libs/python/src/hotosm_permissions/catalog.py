"""Permission catalog: which permissions a tool has and which role gets them.

Each tool defines its own `ToolCatalog` and passes it to `ToolRoles`; this
library holds no tool's catalog.

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
