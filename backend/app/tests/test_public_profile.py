"""Integration tests for the profile slug/is_public opt-in and public groups."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.db.models import Group, GroupMembership, UserProfile
from app.tests.conftest import USER_A, USER_B

# A profile may only go public with a slug and a first/last name.
PUBLIC_PROFILE = {
    "slug": "alice",
    "first_name": "Alice",
    "last_name": "Mapper",
    "is_public": True,
}


async def test_first_slug_set_has_no_cooldown(client):
    resp = await client.patch("/api/profile/me", json={"slug": "Alice Mapper"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["slug"] == "alice-mapper"


async def test_next_slug_change_at_is_null_before_any_slug(client):
    resp = await client.get("/api/profile/me")
    assert resp.status_code == 200, resp.text
    assert resp.json()["next_slug_change_at"] is None


async def test_next_slug_change_at_is_exposed_after_setting_a_slug(client):
    await client.patch("/api/profile/me", json={"slug": "alice"})

    resp = await client.get("/api/profile/me")
    assert resp.status_code == 200, resp.text
    next_change = datetime.fromisoformat(resp.json()["next_slug_change_at"])
    assert next_change > datetime.now(timezone.utc)


async def test_slug_change_within_cooldown_is_rejected(client):
    await client.patch("/api/profile/me", json={"slug": "alice"})
    resp = await client.patch("/api/profile/me", json={"slug": "alice-two"})
    assert resp.status_code == 429, resp.text


async def test_slug_change_after_cooldown_is_allowed(client, db):
    await client.patch("/api/profile/me", json={"slug": "alice"})

    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == USER_A.id)
    )
    profile = result.scalar_one()
    profile.slug_updated_at = datetime.now(timezone.utc) - timedelta(days=16)
    await db.commit()

    resp = await client.patch("/api/profile/me", json={"slug": "alice-two"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["slug"] == "alice-two"


async def test_slug_taken_by_another_profile_returns_suggestion(client, auth):
    await client.patch("/api/profile/me", json={"slug": "mapper"})
    auth["user"] = USER_B
    resp = await client.patch("/api/profile/me", json={"slug": "mapper"})
    assert resp.status_code == 409, resp.text
    assert resp.json()["message"]["suggestion"] == "mapper-2"


async def test_reserved_slug_returns_suggestion(client):
    resp = await client.patch("/api/profile/me", json={"slug": "admin"})
    assert resp.status_code == 409, resp.text
    assert resp.json()["message"]["suggestion"] != "admin"


async def test_is_public_without_slug_is_rejected(client):
    resp = await client.patch("/api/profile/me", json={"is_public": True})
    assert resp.status_code == 400, resp.text


async def test_is_public_without_name_is_rejected(client):
    await client.patch("/api/profile/me", json={"slug": "alice"})
    resp = await client.patch("/api/profile/me", json={"is_public": True})
    assert resp.status_code == 400, resp.text
    assert "first and last name" in resp.json()["message"]


async def test_is_public_with_only_first_name_is_rejected(client):
    resp = await client.patch(
        "/api/profile/me",
        json={"slug": "alice", "first_name": "Alice", "is_public": True},
    )
    assert resp.status_code == 400, resp.text


async def test_clearing_name_on_public_profile_is_rejected(client):
    resp = await client.patch("/api/profile/me", json=PUBLIC_PROFILE)
    assert resp.status_code == 200, resp.text

    resp = await client.patch("/api/profile/me", json={"last_name": "   "})
    assert resp.status_code == 400, resp.text

    resp = await client.patch("/api/profile/me", json={"first_name": None})
    assert resp.status_code == 400, resp.text

    resp = await client.get("/api/public/user/alice")
    assert resp.json()["first_name"] == "Alice"


async def test_public_user_requires_is_public(client):
    await client.patch(
        "/api/profile/me",
        json={"slug": "alice", "first_name": "Alice", "last_name": "Mapper"},
    )
    resp = await client.get("/api/public/user/alice")
    assert resp.status_code == 404

    await client.patch("/api/profile/me", json={"is_public": True})
    resp = await client.get("/api/public/user/alice")
    assert resp.status_code == 200
    assert resp.json()["slug"] == "alice"


async def _make_group(
    db, *, type: str, name: str, slug: str, is_public: bool, status: str = "approved"
) -> Group:
    group = Group(
        type=type,
        name=name,
        slug=slug,
        status=status,
        is_public=is_public,
        created_by=USER_A.id,
    )
    db.add(group)
    await db.flush()
    db.add(GroupMembership(group_id=group.id, hanko_user_id=USER_A.id, role="owner"))
    await db.commit()
    return group


async def test_public_user_groups_lists_public_approved_orgs(client, db):
    await client.patch("/api/profile/me", json=PUBLIC_PROFILE)
    await _make_group(
        db, type="organization", name="Visible Org", slug="visible-org", is_public=True
    )
    await _make_group(
        db, type="organization", name="Private Org", slug="private-org", is_public=False
    )
    await _make_group(
        db,
        type="organization",
        name="Pending Org",
        slug="pending-org",
        is_public=True,
        status="pending",
    )

    resp = await client.get("/api/public/user/alice/groups", params={"type": "org"})
    assert resp.status_code == 200, resp.text
    names = {item["name"] for item in resp.json()["items"]}
    assert names == {"Visible Org"}


async def test_public_user_groups_includes_any_membership_role(client, db):
    await client.patch("/api/profile/me", json=PUBLIC_PROFILE)
    group = await _make_group(
        db, type="organization", name="Managed Org", slug="managed-org", is_public=True
    )
    result = await db.execute(
        select(GroupMembership).where(
            GroupMembership.group_id == group.id,
            GroupMembership.hanko_user_id == USER_A.id,
        )
    )
    membership = result.scalar_one()

    # Owner, manager and plain member are all listed.
    for role in ("owner", "manager", "member"):
        membership.role = role
        await db.commit()

        resp = await client.get("/api/public/user/alice/groups", params={"type": "org"})
        assert [item["name"] for item in resp.json()["items"]] == ["Managed Org"], role


async def test_public_user_groups_type_team(client, db):
    await client.patch("/api/profile/me", json=PUBLIC_PROFILE)
    await _make_group(
        db, type="team", name="Mappers Team", slug="mappers-team", is_public=True
    )

    resp = await client.get("/api/public/user/alice/groups", params={"type": "org"})
    assert resp.json()["items"] == []

    resp = await client.get("/api/public/user/alice/groups", params={"type": "team"})
    assert [item["name"] for item in resp.json()["items"]] == ["Mappers Team"]
