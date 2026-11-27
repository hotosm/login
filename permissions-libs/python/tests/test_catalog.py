"""Tests for ToolCatalog validation and cumulative permissions."""

import pytest

from hotosm_permissions import Permission, ToolCatalog


class TestToolCatalogValidation:
    def test_valid_catalog(self, catalog):
        assert catalog.tool == "demo"

    def test_rejects_key_without_tool_prefix(self):
        with pytest.raises(ValueError, match="does not belong to 'demo'"):
            ToolCatalog(
                tool="demo",
                available_roles=("viewer", "owner"),
                permissions=(Permission("other:items.view", "View"),),
                role_permissions={},
            )

    def test_rejects_prefix_without_colon(self):
        with pytest.raises(ValueError, match="does not belong"):
            ToolCatalog(
                tool="demo",
                available_roles=("viewer", "owner"),
                permissions=(Permission("demoitems.view", "View"),),
                role_permissions={},
            )

    def test_rejects_role_not_available(self):
        with pytest.raises(ValueError, match="'editor' is not available"):
            ToolCatalog(
                tool="demo",
                available_roles=("viewer", "owner"),
                permissions=(Permission("demo:items.edit", "Edit"),),
                role_permissions={"editor": ("demo:items.edit",)},
            )

    def test_rejects_unknown_permission(self):
        with pytest.raises(ValueError, match="Unknown permissions"):
            ToolCatalog(
                tool="demo",
                available_roles=("viewer", "owner"),
                permissions=(Permission("demo:items.view", "View"),),
                role_permissions={"viewer": ("demo:items.missing",)},
            )

    def test_rejects_invalid_role_key(self):
        with pytest.raises(ValueError, match=r"Unknown roles in 'demo': \['admin'\]"):
            ToolCatalog(
                tool="demo",
                available_roles=("viewer", "admin", "owner"),  # type: ignore[arg-type]
                permissions=(Permission("demo:items.view", "View"),),
                role_permissions={"admin": ("demo:items.view",)},  # type: ignore[dict-item]
            )


class TestPermissionsFor:
    def test_viewer_gets_only_its_own(self, catalog):
        assert catalog.permissions_for("viewer") == frozenset({"demo:items.view"})

    def test_cumulative_by_rank(self, catalog):
        assert catalog.permissions_for("contributor") == frozenset(
            {"demo:items.view", "demo:items.comment"}
        )
        assert catalog.permissions_for("editor") == frozenset(
            {"demo:items.view", "demo:items.comment", "demo:items.edit"}
        )
        assert catalog.permissions_for("owner") == frozenset(
            {
                "demo:items.view",
                "demo:items.comment",
                "demo:items.edit",
                "demo:items.share",
            }
        )

    def test_role_not_available_returns_empty(self):
        catalog = ToolCatalog(
            tool="demo",
            available_roles=("viewer", "owner"),
            permissions=(Permission("demo:items.view", "View"),),
            role_permissions={"viewer": ("demo:items.view",)},
        )
        assert catalog.permissions_for("editor") == frozenset()

    def test_role_without_own_permissions_inherits(self):
        catalog = ToolCatalog(
            tool="demo",
            available_roles=("viewer", "editor", "owner"),
            permissions=(Permission("demo:items.view", "View"),),
            role_permissions={"viewer": ("demo:items.view",)},
        )
        assert catalog.permissions_for("editor") == frozenset({"demo:items.view"})
