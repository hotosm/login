"""Tests for the in-app notifications emitted by group membership changes."""

from app.db.models import GroupMembership, UserProfile
from app.tests.conftest import USER_A, USER_B, USER_C, USER_D


async def _create_team(client, name="Mappers", member_emails=None):
    resp = await client.post(
        "/api/groups",
        json={
            "type": "team",
            "name": name,
            "member_emails": member_emails or [],
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _add_member(client, group_id, user, role="member"):
    resp = await client.post(
        f"/api/groups/{group_id}/members",
        json={"email": user.email, "role": role},
    )
    assert resp.status_code == 201, resp.text


async def _notifications_of(client, auth, user, type=None):
    """List a user's notifications (optionally of one type), acting as them."""
    auth["user"] = user
    resp = await client.get("/api/me/notifications")
    assert resp.status_code == 200
    items = resp.json()
    return [item for item in items if type is None or item["type"] == type]


async def test_add_member_to_team_notifies_the_member(client, auth):
    team = await _create_team(client)
    await _add_member(client, team["id"], USER_B)

    items = await _notifications_of(client, auth, USER_B)
    assert len(items) == 1
    assert items[0]["type"] == "team_member_joined"
    assert items[0]["data"] == {"group_id": team["id"], "group_name": "Mappers"}
    assert items[0]["read_at"] is None
    assert await _notifications_of(client, auth, USER_A) == []


async def test_re_adding_an_existing_member_does_not_notify_again(client, auth):
    team = await _create_team(client)
    await _add_member(client, team["id"], USER_B)
    auth["user"] = USER_A
    await _add_member(client, team["id"], USER_B)

    items = await _notifications_of(client, auth, USER_B, "team_member_joined")
    assert len(items) == 1


async def test_seeded_members_are_notified_but_not_the_owner(client, auth):
    team = await _create_team(client, member_emails=[USER_B.email, USER_C.email])
    assert team["members_count"] == 3

    for member in (USER_B, USER_C):
        items = await _notifications_of(client, auth, member)
        assert len(items) == 1
        assert items[0]["type"] == "team_member_joined"
        assert items[0]["data"] == {"group_id": team["id"], "group_name": "Mappers"}

    assert await _notifications_of(client, auth, USER_A) == []


async def test_leaving_a_team_notifies_owner_and_managers(client, auth, db):
    team = await _create_team(client)  # USER_A is the owner
    await _add_member(client, team["id"], USER_B, role="manager")
    await _add_member(client, team["id"], USER_C, role="manager")
    await _add_member(client, team["id"], USER_D)
    db.add(UserProfile(hanko_user_id=USER_D.id, first_name="Dana", last_name="Doe"))
    await db.commit()

    auth["user"] = USER_D
    resp = await client.delete(f"/api/groups/{team['id']}/members/{USER_D.id}")
    assert resp.status_code == 204

    for recipient in (USER_A, USER_B, USER_C):
        items = await _notifications_of(client, auth, recipient, "member_left")
        assert len(items) == 1, recipient.id
        assert items[0]["data"] == {
            "group_id": team["id"],
            "group_name": "Mappers",
            "group_type": "team",
            "member_name": "Dana Doe",
        }

    assert await _notifications_of(client, auth, USER_D, "member_left") == []


async def test_member_name_falls_back_to_email_without_a_profile(client, auth):
    team = await _create_team(client)
    await _add_member(client, team["id"], USER_B)

    auth["user"] = USER_B
    resp = await client.delete(f"/api/groups/{team['id']}/members/{USER_B.id}")
    assert resp.status_code == 204

    items = await _notifications_of(client, auth, USER_A, "member_left")
    assert items[0]["data"]["member_name"] == USER_B.email


async def test_manager_removing_a_member_notifies_only_that_member(client, auth):
    team = await _create_team(client)  # USER_A is the owner
    await _add_member(client, team["id"], USER_B, role="manager")
    await _add_member(client, team["id"], USER_C, role="manager")
    await _add_member(client, team["id"], USER_D)

    auth["user"] = USER_B  # the acting manager
    resp = await client.delete(f"/api/groups/{team['id']}/members/{USER_D.id}")
    assert resp.status_code == 204

    items = await _notifications_of(client, auth, USER_D, "member_removed")
    assert len(items) == 1
    assert items[0]["data"] == {
        "group_id": team["id"],
        "group_name": "Mappers",
        "group_type": "team",
    }

    # The managers did the removing, so none of them is notified.
    for manager in (USER_A, USER_B, USER_C):
        assert await _notifications_of(client, auth, manager, "member_left") == []
        assert await _notifications_of(client, auth, manager, "member_removed") == []


async def _create_org_with_member(client, auth, db, member, role="member"):
    """Create an org owned by USER_A and seed a member the way an invite would."""
    auth["user"] = USER_A
    resp = await client.post(
        "/api/groups", json={"type": "organization", "name": "ADF Haiti"}
    )
    assert resp.status_code == 201
    org = resp.json()
    db.add(GroupMembership(group_id=org["id"], hanko_user_id=member.id, role=role))
    await db.commit()
    return org


async def test_orgs_reject_direct_member_adds(client, auth, db):
    org = await _create_org_with_member(client, auth, db, USER_C)

    # Orgs add members via invitations; the direct endpoint is rejected.
    auth["user"] = USER_A
    resp = await client.post(
        f"/api/groups/{org['id']}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    assert resp.status_code == 400
    assert await _notifications_of(client, auth, USER_B) == []


async def test_leaving_an_org_notifies_owner_and_managers(client, auth, db):
    org = await _create_org_with_member(client, auth, db, USER_B)
    db.add(GroupMembership(group_id=org["id"], hanko_user_id=USER_C.id, role="manager"))
    db.add(UserProfile(hanko_user_id=USER_B.id, first_name="Bea", last_name="Blue"))
    await db.commit()

    auth["user"] = USER_B
    resp = await client.delete(f"/api/groups/{org['id']}/members/{USER_B.id}")
    assert resp.status_code == 204

    for recipient in (USER_A, USER_C):
        items = await _notifications_of(client, auth, recipient, "member_left")
        assert len(items) == 1, recipient.id
        assert items[0]["data"] == {
            "group_id": org["id"],
            "group_name": "ADF Haiti",
            "group_type": "organization",
            "member_name": "Bea Blue",
        }

    assert await _notifications_of(client, auth, USER_B, "member_left") == []


async def test_removing_an_org_member_notifies_only_that_member(client, auth, db):
    org = await _create_org_with_member(client, auth, db, USER_B)

    auth["user"] = USER_A  # the owner does the removing
    resp = await client.delete(f"/api/groups/{org['id']}/members/{USER_B.id}")
    assert resp.status_code == 204

    items = await _notifications_of(client, auth, USER_B, "member_removed")
    assert len(items) == 1
    assert items[0]["data"] == {
        "group_id": org["id"],
        "group_name": "ADF Haiti",
        "group_type": "organization",
    }

    assert await _notifications_of(client, auth, USER_A) == []
