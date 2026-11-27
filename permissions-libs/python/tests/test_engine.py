"""Tests for effective_role and can."""

from dataclasses import dataclass

import pytest

from hotosm_permissions import (
    Membership,
    Permission,
    PermissionContext,
    ToolCatalog,
    ToolRoles,
    can,
    effective_role,
)


@dataclass(frozen=True)
class Grant:
    subject_type: str
    subject_id: str | None
    role: str


def user(uid, role):
    return Grant("user", uid, role)


def team(gid, role):
    return Grant("team", gid, role)


def org(gid, role):
    return Grant("organization", gid, role)


def link(role):
    return Grant("link", None, role)


def member_ctx(user_id="u1", *memberships):
    return PermissionContext.from_memberships(user_id, memberships)


class TestOwner:
    def test_owner_by_owner_id(self, tool_roles):
        assert effective_role("u1", [], member_ctx(), tool_roles) == "owner"

    def test_owner_when_login_down(self, tool_roles):
        ctx = PermissionContext.login_unavailable("u1")
        assert effective_role("u1", [], ctx, tool_roles) == "owner"

    def test_owner_wins_over_grants(self, tool_roles):
        grants = [user("u1", "viewer")]
        assert effective_role("u1", grants, member_ctx(), tool_roles) == "owner"

    def test_anonymous_never_owner_of_ownerless_item(self, tool_roles):
        ctx = PermissionContext.anonymous()
        assert effective_role(None, [], ctx, tool_roles) is None

    def test_other_user_is_not_owner(self, tool_roles):
        assert effective_role("u2", [], member_ctx(), tool_roles) is None


class TestAnonymous:
    def test_only_link_grants(self, tool_roles):
        ctx = PermissionContext.anonymous()
        grants = [
            user("u1", "editor"),
            team("t1", "editor"),
            org("o1", "editor"),
            link("viewer"),
        ]
        assert effective_role("owner", grants, ctx, tool_roles) == "viewer"

    def test_user_grant_with_none_subject_does_not_match(self, tool_roles):
        ctx = PermissionContext.anonymous()
        grants = [Grant("user", None, "editor")]
        assert effective_role("owner", grants, ctx, tool_roles) is None

    def test_no_link_no_access(self, tool_roles):
        ctx = PermissionContext.anonymous()
        assert effective_role("owner", [user("u1", "viewer")], ctx, tool_roles) is None


class TestGrants:
    def test_user_grant_matches_only_that_user(self, tool_roles):
        grants = [user("u1", "editor")]
        assert effective_role("owner", grants, member_ctx("u1"), tool_roles) == "editor"
        assert effective_role("owner", grants, member_ctx("u2"), tool_roles) is None

    def test_team_grant_needs_approved_membership(self, tool_roles):
        grants = [team("t1", "contributor")]
        approved = member_ctx("u1", Membership("team", "t1", "member", "approved"))
        pending = member_ctx("u1", Membership("team", "t1", "member", "pending"))
        no_status = member_ctx("u1", Membership("team", "t1", "member"))
        other = member_ctx("u1", Membership("team", "t2", "member", "approved"))
        assert effective_role("owner", grants, approved, tool_roles) == "contributor"
        assert effective_role("owner", grants, pending, tool_roles) is None
        assert effective_role("owner", grants, no_status, tool_roles) is None
        assert effective_role("owner", grants, other, tool_roles) is None

    def test_org_grant_needs_approved_membership(self, tool_roles):
        grants = [org("o1", "editor")]
        approved = member_ctx(
            "u1", Membership("organization", "o1", "member", "approved")
        )
        pending = member_ctx("u1", Membership("organization", "o1", "owner", "pending"))
        assert effective_role("owner", grants, approved, tool_roles) == "editor"
        assert effective_role("owner", grants, pending, tool_roles) is None

    def test_group_type_must_match(self, tool_roles):
        grants = [org("g1", "editor")]
        ctx = member_ctx("u1", Membership("team", "g1", "member", "approved"))
        assert effective_role("owner", grants, ctx, tool_roles) is None

    @pytest.mark.parametrize(
        ("grants", "expected"),
        [
            ([link("viewer"), user("u1", "contributor")], "contributor"),
            ([user("u1", "viewer"), team("t1", "editor")], "editor"),
            ([org("o1", "contributor"), team("t1", "viewer")], "contributor"),
            ([link("editor"), user("u1", "viewer"), org("o1", "viewer")], "editor"),
            (
                [
                    user("u1", "viewer"),
                    team("t1", "contributor"),
                    org("o1", "editor"),
                    link("viewer"),
                ],
                "editor",
            ),
        ],
    )
    def test_highest_role_wins(self, tool_roles, grants, expected):
        ctx = member_ctx(
            "u1",
            Membership("team", "t1", "member", "approved"),
            Membership("organization", "o1", "member", "approved"),
        )
        assert effective_role("owner", grants, ctx, tool_roles) == expected
        assert effective_role("owner", reversed(grants), ctx, tool_roles) == expected

    def test_owner_grant_ignored(self, tool_roles):
        grants = [user("u1", "owner"), link("owner")]
        assert effective_role("other", grants, member_ctx(), tool_roles) is None

    def test_owner_grant_ignored_but_others_count(self, tool_roles):
        grants = [user("u1", "owner"), user("u1", "viewer")]
        assert effective_role("other", grants, member_ctx(), tool_roles) == "viewer"

    def test_role_not_enabled_ignored(self):
        catalog = ToolCatalog(
            tool="demo",
            available_roles=("viewer", "owner"),
            permissions=(Permission("demo:items.view", "View"),),
            role_permissions={"viewer": ("demo:items.view",)},
        )
        roles = ToolRoles(catalog)
        grants = [user("u1", "editor"), user("u1", "viewer")]
        assert effective_role("other", grants, member_ctx(), roles) == "viewer"
        assert effective_role("other", [link("editor")], member_ctx(), roles) is None

    def test_unknown_role_ignored(self, tool_roles):
        grants = [user("u1", "admin"), link("superuser")]
        assert effective_role("other", grants, member_ctx(), tool_roles) is None

    def test_unknown_subject_type_ignored(self, tool_roles):
        grants = [Grant("everyone", None, "editor"), Grant("group", "t1", "editor")]
        ctx = member_ctx("u1", Membership("team", "t1", "member", "approved"))
        assert effective_role("other", grants, ctx, tool_roles) is None

    def test_accepts_generator(self, tool_roles):
        grants = (g for g in [user("u1", "editor")])
        assert effective_role("other", grants, member_ctx(), tool_roles) == "editor"


class TestLoginDown:
    def test_user_and_link_grants_still_work(self, tool_roles):
        ctx = PermissionContext.login_unavailable("u1")
        assert (
            effective_role("other", [user("u1", "editor")], ctx, tool_roles) == "editor"
        )
        assert effective_role("other", [link("viewer")], ctx, tool_roles) == "viewer"

    def test_group_grants_do_not_work(self, tool_roles):
        ctx = PermissionContext.login_unavailable("u1")
        grants = [team("t1", "editor"), org("o1", "editor")]
        assert effective_role("other", grants, ctx, tool_roles) is None


class TestCan:
    def test_per_permission(self, tool_roles):
        ctx = member_ctx()
        grants = [user("u1", "contributor")]
        assert can("demo:items.view", "other", grants, ctx, tool_roles)
        assert can("demo:items.comment", "other", grants, ctx, tool_roles)
        assert not can("demo:items.edit", "other", grants, ctx, tool_roles)
        assert not can("demo:items.share", "other", grants, ctx, tool_roles)

    def test_owner_has_everything(self, tool_roles):
        ctx = member_ctx()
        for permission in tool_roles.permissions_for("owner"):
            assert can(permission, "u1", [], ctx, tool_roles), permission

    def test_no_access(self, tool_roles):
        ctx = member_ctx()
        assert not can("demo:items.view", "other", [], ctx, tool_roles)
        assert not can(
            "demo:items.view", "other", [user("u2", "editor")], ctx, tool_roles
        )

    def test_unknown_permission(self, tool_roles):
        assert not can("demo:items.unknown", "u1", [], member_ctx(), tool_roles)
