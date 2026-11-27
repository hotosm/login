"""Tests for PermissionContext constructors and membership checks."""

from hotosm_permissions import LoginGroup, Membership, PermissionContext


def _team(group_id="t1", role="member", status="approved"):
    return Membership("team", group_id, role, status)


def _org(group_id="o1", role="member", status="approved"):
    return Membership("organization", group_id, role, status)


class TestConstructors:
    def test_anonymous(self):
        ctx = PermissionContext.anonymous()
        assert ctx.user_id is None
        assert ctx.memberships == ()
        assert ctx.login_ok is True

    def test_login_unavailable(self):
        ctx = PermissionContext.login_unavailable("u1")
        assert ctx.user_id == "u1"
        assert ctx.memberships == ()
        assert ctx.login_ok is False

    def test_from_memberships(self):
        memberships = [_team(), _org()]
        ctx = PermissionContext.from_memberships("u1", iter(memberships))
        assert ctx.user_id == "u1"
        assert ctx.memberships == tuple(memberships)
        assert ctx.login_ok is True

    def test_from_login_groups(self):
        groups = [
            LoginGroup("t1", "team", "t-one", "Team One", "manager", "approved"),
            LoginGroup("o1", "organization", "o-one", "Org One", "owner", None),
        ]
        ctx = PermissionContext.from_login_groups("u1", groups)
        assert ctx.memberships == (
            Membership("team", "t1", "manager", "approved"),
            Membership("organization", "o1", "owner", None),
        )
        assert ctx.login_ok is True


class TestMembership:
    def test_approved_counts(self):
        ctx = PermissionContext.from_memberships("u1", [_team()])
        assert ctx.is_member("team", "t1")
        assert ctx.group_role("team", "t1") == "member"

    def test_status_none_does_not_count(self):
        ctx = PermissionContext.from_memberships("u1", [_team(status=None)])
        assert not ctx.is_member("team", "t1")
        assert ctx.group_role("team", "t1") is None

    def test_other_status_does_not_count(self):
        for status in ("pending", "rejected", "Approved", ""):
            ctx = PermissionContext.from_memberships("u1", [_team(status=status)])
            assert not ctx.is_member("team", "t1"), status

    def test_group_type_must_match(self):
        ctx = PermissionContext.from_memberships("u1", [_team(group_id="g1")])
        assert not ctx.is_member("organization", "g1")
        assert ctx.group_role("organization", "g1") is None

    def test_unknown_group(self):
        ctx = PermissionContext.from_memberships("u1", [_team()])
        assert not ctx.is_member("team", "t2")
        assert not ctx.is_member(None, None)

    def test_anonymous_has_no_groups(self):
        assert not PermissionContext.anonymous().is_member("team", "t1")


class TestIsOrgManager:
    def test_owner_and_manager(self):
        for role in ("owner", "manager"):
            ctx = PermissionContext.from_memberships("u1", [_org(role=role)])
            assert ctx.is_org_manager("o1"), role

    def test_member_is_not_manager(self):
        ctx = PermissionContext.from_memberships("u1", [_org(role="member")])
        assert not ctx.is_org_manager("o1")

    def test_non_approved_org(self):
        ctx = PermissionContext.from_memberships(
            "u1", [_org(role="owner", status="pending")]
        )
        assert not ctx.is_org_manager("o1")

    def test_team_manager_is_not_org_manager(self):
        ctx = PermissionContext.from_memberships("u1", [_team("o1", role="manager")])
        assert not ctx.is_org_manager("o1")

    def test_none_org(self):
        ctx = PermissionContext.from_memberships("u1", [_org(role="owner")])
        assert not ctx.is_org_manager(None)
