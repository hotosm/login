"""Shared permissions for HOT tools: catalog, roles and access rules."""

__version__ = "0.1.0.dev0"

from hotosm_permissions.catalog import Permission, ToolCatalog, get_catalog
from hotosm_permissions.context import (
    GroupRole,
    GroupType,
    Membership,
    PermissionContext,
)
from hotosm_permissions.engine import GrantLike, SubjectType, can, effective_role
from hotosm_permissions.login_client import (
    LoginClient,
    LoginGroup,
    LoginUnavailable,
    LoginUser,
    PublicGroup,
    PublicGroupPage,
)
from hotosm_permissions.roles import (
    DEFAULT_ROLE_DISPLAY,
    LOCALES,
    ROLE_RANK,
    ROLES,
    GrantableRole,
    Role,
    RoleDisplay,
)
from hotosm_permissions.schemas import (
    AccessAttribution,
    AccessGrant,
    AccessOwner,
    AttributionUpdate,
    GrantRoleUpdate,
    ItemAccess,
    LinkUpdate,
    UserGrantCreate,
)
from hotosm_permissions.tool_roles import RoleOption, ToolRoles

__all__ = [
    # Version
    "__version__",
    # Roles
    "Role",
    "GrantableRole",
    "ROLES",
    "ROLE_RANK",
    "LOCALES",
    "RoleDisplay",
    "DEFAULT_ROLE_DISPLAY",
    # Catalog
    "Permission",
    "ToolCatalog",
    "get_catalog",
    # Tool roles
    "ToolRoles",
    "RoleOption",
    # Context
    "GroupType",
    "GroupRole",
    "Membership",
    "PermissionContext",
    # Engine
    "SubjectType",
    "GrantLike",
    "effective_role",
    "can",
    # Login client
    "LoginClient",
    "LoginGroup",
    "LoginUser",
    "PublicGroup",
    "PublicGroupPage",
    "LoginUnavailable",
    # REST contract
    "AccessOwner",
    "AccessAttribution",
    "AccessGrant",
    "ItemAccess",
    "GrantRoleUpdate",
    "UserGrantCreate",
    "LinkUpdate",
    "AttributionUpdate",
]
