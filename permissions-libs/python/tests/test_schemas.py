"""Tests for the sharing REST contract schemas."""

import pytest
from pydantic import ValidationError

from hotosm_permissions import (
    AccessGrant,
    AccessOwner,
    GrantRoleUpdate,
    ItemAccess,
    LinkUpdate,
    UserGrantCreate,
)


class TestItemAccess:
    def test_minimal_and_defaults(self, tool_roles):
        access = ItemAccess(
            owner=AccessOwner(id="u1"),
            grants=[],
            available_roles=tool_roles.role_options(),
        )
        assert access.owner.name is None
        assert access.link_role is None
        assert access.my_role is None
        assert access.link_roles == []
        assert [r.key for r in access.available_roles] == list(tool_roles.roles)

    def test_link_roles_default_not_shared(self, tool_roles):
        a = ItemAccess(owner=AccessOwner(id="u1"), grants=[], available_roles=[])
        b = ItemAccess(owner=AccessOwner(id="u2"), grants=[], available_roles=[])
        a.link_roles.append("viewer")
        assert b.link_roles == []

    def test_full(self, tool_roles):
        access = ItemAccess(
            owner=AccessOwner(id="u1", name="Ana"),
            grants=[
                AccessGrant(subject_type="user", subject_id="u2", role="editor"),
                AccessGrant(
                    subject_type="team",
                    subject_id="t1",
                    subject_name="Team",
                    role="viewer",
                ),
                AccessGrant(
                    subject_type="organization", subject_id="o1", role="contributor"
                ),
            ],
            link_role="viewer",
            my_role="owner",
            available_roles=tool_roles.role_options("es"),
            link_roles=["viewer", "contributor"],
        )
        assert access.my_role == "owner"
        assert len(access.grants) == 3

    def test_available_roles_required(self):
        with pytest.raises(ValidationError):
            ItemAccess(owner=AccessOwner(id="u1"), grants=[])

    @pytest.mark.parametrize("role", ["owner", "admin"])
    def test_link_role_rejects_owner_and_unknown(self, role):
        with pytest.raises(ValidationError):
            ItemAccess(
                owner=AccessOwner(id="u1"),
                grants=[],
                available_roles=[],
                link_role=role,
            )

    @pytest.mark.parametrize("role", ["owner", "admin"])
    def test_link_roles_rejects_owner_and_unknown(self, role):
        with pytest.raises(ValidationError):
            ItemAccess(
                owner=AccessOwner(id="u1"),
                grants=[],
                available_roles=[],
                link_roles=[role],
            )

    def test_my_role_rejects_unknown(self):
        with pytest.raises(ValidationError):
            ItemAccess(
                owner=AccessOwner(id="u1"),
                grants=[],
                available_roles=[],
                my_role="admin",
            )


class TestAccessGrant:
    @pytest.mark.parametrize("role", ["owner", "admin"])
    def test_rejects_owner_and_unknown_role(self, role):
        with pytest.raises(ValidationError):
            AccessGrant(subject_type="user", subject_id="u1", role=role)

    def test_rejects_link_subject(self):
        with pytest.raises(ValidationError):
            AccessGrant(subject_type="link", subject_id="x", role="viewer")


class TestUserGrantCreate:
    def test_default_role_viewer(self):
        assert UserGrantCreate(email="a@b.co").role == "viewer"

    @pytest.mark.parametrize("length", [3, 320])
    def test_email_length_bounds_ok(self, length):
        assert len(UserGrantCreate(email="a" * length).email) == length

    @pytest.mark.parametrize("length", [0, 2, 321])
    def test_email_length_out_of_bounds(self, length):
        with pytest.raises(ValidationError):
            UserGrantCreate(email="a" * length)

    def test_email_required(self):
        with pytest.raises(ValidationError):
            UserGrantCreate()

    @pytest.mark.parametrize("role", ["owner", "admin"])
    def test_rejects_owner_and_unknown_role(self, role):
        with pytest.raises(ValidationError):
            UserGrantCreate(email="a@b.co", role=role)


class TestGrantRoleUpdate:
    @pytest.mark.parametrize("role", ["viewer", "contributor", "editor"])
    def test_accepts_grantable(self, role):
        assert GrantRoleUpdate(role=role).role == role

    @pytest.mark.parametrize("role", ["owner", "admin", ""])
    def test_rejects_owner_and_unknown(self, role):
        with pytest.raises(ValidationError):
            GrantRoleUpdate(role=role)

    def test_role_required(self):
        with pytest.raises(ValidationError):
            GrantRoleUpdate()


class TestLinkUpdate:
    def test_default_role_viewer(self):
        assert LinkUpdate().role == "viewer"

    @pytest.mark.parametrize("role", ["owner", "admin"])
    def test_rejects_owner_and_unknown(self, role):
        with pytest.raises(ValidationError):
            LinkUpdate(role=role)
