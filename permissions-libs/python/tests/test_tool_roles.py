"""Tests for ToolRoles: enabled roles, permissions and localized options."""

import pytest

from hotosm_permissions import (
    DEFAULT_ROLE_DISPLAY,
    Permission,
    RoleDisplay,
    ToolCatalog,
    ToolRoles,
)


def _catalog(available_roles) -> ToolCatalog:
    return ToolCatalog(
        tool="demo",
        available_roles=available_roles,
        permissions=(Permission("demo:items.view", "View"),),
        role_permissions={"viewer": ("demo:items.view",)},
    )


class TestEnabledRoles:
    def test_roles_follow_catalog(self, tool_roles):
        assert tool_roles.roles == ("viewer", "contributor", "editor", "owner")
        assert tool_roles.tool == "demo"

    def test_roles_in_rank_order_regardless_of_catalog_order(self):
        roles = ToolRoles(_catalog(("owner", "editor", "viewer")))
        assert roles.roles == ("viewer", "editor", "owner")

    def test_requires_owner(self):
        with pytest.raises(ValueError, match="must enable the 'owner' role"):
            ToolRoles(_catalog(("viewer", "editor")))

    def test_rejects_display_for_role_not_enabled(self):
        with pytest.raises(ValueError, match="not enabled"):
            ToolRoles(
                _catalog(("viewer", "owner")),
                display={"editor": RoleDisplay(label={"en": "Edit"})},
            )

    def test_grantable_roles_exclude_owner(self, tool_roles):
        assert tool_roles.grantable_roles == ("viewer", "contributor", "editor")

    def test_grantable_roles_only_enabled(self):
        roles = ToolRoles(_catalog(("viewer", "owner")))
        assert roles.grantable_roles == ("viewer",)


class TestPermissions:
    def test_has_permission(self, tool_roles):
        assert tool_roles.has_permission("viewer", "demo:items.view")
        assert not tool_roles.has_permission("viewer", "demo:items.edit")
        assert tool_roles.has_permission("editor", "demo:items.edit")
        assert tool_roles.has_permission("owner", "demo:items.share")

    def test_has_permission_unknown(self, tool_roles):
        assert not tool_roles.has_permission("admin", "demo:items.view")
        assert not tool_roles.has_permission("owner", "demo:items.unknown")

    def test_has_permission_role_not_enabled(self):
        roles = ToolRoles(_catalog(("viewer", "owner")))
        assert not roles.has_permission("editor", "demo:items.view")

    def test_permissions_for_sorted(self, tool_roles):
        assert tool_roles.permissions_for("owner") == [
            "demo:items.comment",
            "demo:items.edit",
            "demo:items.share",
            "demo:items.view",
        ]

    def test_permissions_for_unknown(self, tool_roles):
        assert tool_roles.permissions_for("admin") == []
        assert tool_roles.permissions_for("") == []


class TestRoleOptions:
    @pytest.fixture
    def roles(self, catalog):
        return ToolRoles(
            catalog,
            display={
                "contributor": RoleDisplay(
                    label={"en": "Comment", "es": "Comentar"},
                    description={"en": "Can comment"},
                ),
            },
        )

    def test_rank_order_and_keys(self, roles):
        options = roles.role_options()
        assert [o.key for o in options] == ["viewer", "contributor", "editor", "owner"]

    def test_tool_override_in_locale(self, roles):
        option = roles.role_options("es")[1]
        assert option.label == "Comentar"

    def test_tool_override_in_en_when_locale_missing(self, roles):
        option = roles.role_options("es")[1]
        assert option.description == "Can comment"

    def test_default_in_locale(self, roles):
        option = roles.role_options("fr")[0]
        assert option.label == DEFAULT_ROLE_DISPLAY["viewer"].label["fr"]
        assert option.description == DEFAULT_ROLE_DISPLAY["viewer"].description["fr"]

    def test_default_in_en_for_unknown_locale(self, roles):
        options = roles.role_options("de")
        assert options[0].label == DEFAULT_ROLE_DISPLAY["viewer"].label["en"]
        assert options[3].label == DEFAULT_ROLE_DISPLAY["owner"].label["en"]
        # The tool override in `en` still wins over the defaults.
        assert options[1].label == "Comment"

    def test_default_in_en_when_locale_missing_from_defaults(self, monkeypatch):
        monkeypatch.setitem(
            DEFAULT_ROLE_DISPLAY,
            "viewer",
            RoleDisplay(label={"en": "View only"}, description={"en": "Desc"}),
        )
        roles = ToolRoles(_catalog(("viewer", "owner")))
        option = roles.role_options("es")[0]
        assert option.label == "View only"
        assert option.description == "Desc"

    def test_default_locale_is_en(self, roles):
        assert roles.role_options()[0].label == "Can view"
