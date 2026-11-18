"""Standard roles shared by every HOT tool, ordered by rank.

Every tool uses the same role keys; each tool enables the subset it needs
(see `ToolRoles`) and may override how a role is shown to users.
"""

from dataclasses import dataclass, field
from typing import Literal

Role = Literal["viewer", "contributor", "editor", "owner"]

# Roles that can be granted to someone else. `owner` is never granted: it
# belongs to whoever owns the item.
GrantableRole = Literal["viewer", "contributor", "editor"]

ROLES: tuple[Role, ...] = ("viewer", "contributor", "editor", "owner")

ROLE_RANK: dict[str, int] = {role: rank for rank, role in enumerate(ROLES, start=1)}

LOCALES: tuple[str, ...] = ("en", "es", "fr", "pt")


@dataclass(frozen=True)
class RoleDisplay:
    """How a role is shown to users, per locale (`{"en": ..., "es": ...}`).

    Either field may be left empty in a tool override; missing locales fall
    back as described in `ToolRoles.role_options`.
    """

    label: dict[str, str] = field(default_factory=dict)
    description: dict[str, str] = field(default_factory=dict)


DEFAULT_ROLE_DISPLAY: dict[Role, RoleDisplay] = {
    "viewer": RoleDisplay(
        label={
            "en": "Can view",
            "es": "Puede ver",
            "fr": "Peut voir",
            "pt": "Pode ver",
        },
        description={
            "en": "Can view, but not make changes",
            "es": "Puede ver, pero no hacer cambios",
            "fr": "Peut voir, mais pas faire de modifications",
            "pt": "Pode ver, mas não fazer alterações",
        },
    ),
    "contributor": RoleDisplay(
        label={
            "en": "Can contribute",
            "es": "Puede contribuir",
            "fr": "Peut contribuer",
            "pt": "Pode contribuir",
        },
        description={
            "en": "Can add content, but not edit existing content",
            "es": "Puede agregar contenido, pero no editar el existente",
            "fr": "Peut ajouter du contenu, mais pas modifier l'existant",
            "pt": "Pode adicionar conteúdo, mas não editar o existente",
        },
    ),
    "editor": RoleDisplay(
        label={
            "en": "Can edit",
            "es": "Puede editar",
            "fr": "Peut modifier",
            "pt": "Pode editar",
        },
        description={
            "en": "Can view and make changes",
            "es": "Puede ver y hacer cambios",
            "fr": "Peut voir et faire des modifications",
            "pt": "Pode ver e fazer alterações",
        },
    ),
    "owner": RoleDisplay(
        label={
            "en": "Owner",
            "es": "Propietario",
            "fr": "Propriétaire",
            "pt": "Proprietário",
        },
        description={
            "en": "Full control, including sharing and deleting",
            "es": "Control total, incluido compartir y eliminar",
            "fr": "Contrôle total, y compris le partage et la suppression",
            "pt": "Controle total, incluindo compartilhar e excluir",
        },
    ),
}
