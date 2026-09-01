"""Tests for in-app notifications and the events that emit them."""

from unittest.mock import AsyncMock, patch

from app.db.models import Group, GroupMembership, UserProfile
from app.tests.conftest import ADMIN, USER_A, USER_B, USER_C, make_user


async def _create_org(client, name="ADF Haiti"):
    resp = await client.post("/api/groups", json={"type": "organization", "name": name})
    assert resp.status_code == 201
    return resp.json()


async def _my_notifications(client):
    resp = await client.get("/api/me/notifications")
    assert resp.status_code == 200
    return resp.json()


async def _notifications_of(client, auth, user, type=None):
    """List a user's notifications (optionally of one type), acting as them."""
    auth["user"] = user
    items = await _my_notifications(client)
    return [item for item in items if type is None or item["type"] == type]


async def _approved_org(client, db, name="ADF Haiti"):
    """Create an org as USER_A and approve it, so invitations are allowed."""
    org = await _create_org(client, name)
    group = await db.get(Group, org["id"])
    group.status = "approved"
    await db.commit()
    return org


async def _invite(client, auth, org_id, invitee, role="member"):
    """Invite a user as the org owner; return their accept/decline token.

    Leaves the invitee as the acting user.
    """
    with patch("app.api.routes.invitations.send_email", new=AsyncMock()):
        resp = await client.post(
            f"/api/groups/{org_id}/invitations",
            json={"email": invitee.email, "role": role},
        )
    assert resp.status_code == 201, resp.text
    auth["user"] = invitee
    inbox = await client.get("/api/me/invitations")
    assert inbox.status_code == 200
    return inbox.json()[0]["token"]


async def _stage_name_change(client, auth, org_id, new_name="ADF New"):
    """Approve the org, then stage a name change as its owner."""
    auth["user"] = ADMIN
    with patch("app.api.routes.organizations_admin.send_email", new=AsyncMock()):
        await client.post(f"/api/admin/organizations/{org_id}/approve")
    auth["user"] = USER_A
    resp = await client.post(
        f"/api/groups/{org_id}/name-change", json={"name": new_name}
    )
    assert resp.status_code == 200
    auth["user"] = ADMIN


async def test_approve_organization_notifies_creator(client, auth):
    org = await _create_org(client)  # created by USER_A
    auth["user"] = ADMIN
    with patch("app.api.routes.organizations_admin.send_email", new=AsyncMock()):
        resp = await client.post(f"/api/admin/organizations/{org['id']}/approve")
    assert resp.status_code == 204

    auth["user"] = USER_A
    items = await _my_notifications(client)
    assert len(items) == 1
    assert items[0]["type"] == "org_approved"
    assert items[0]["data"] == {"group_id": org["id"], "group_name": "ADF Haiti"}
    assert items[0]["read_at"] is None


async def test_reject_organization_notifies_creator_with_reason(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    with patch("app.api.routes.organizations_admin.send_email", new=AsyncMock()):
        resp = await client.post(
            f"/api/admin/organizations/{org['id']}/reject",
            json={"reason": "duplicate"},
        )
    assert resp.status_code == 204

    auth["user"] = USER_A
    items = await _my_notifications(client)
    assert items[0]["type"] == "org_rejected"
    assert items[0]["data"]["reason"] == "duplicate"


async def test_approve_name_change_notifies_owner(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])
    resp = await client.post(f"/api/admin/organizations/{org['id']}/approve-name")
    assert resp.status_code == 204

    auth["user"] = USER_A
    items = await _my_notifications(client)
    assert items[0]["type"] == "org_name_approved"
    assert items[0]["data"] == {
        "group_id": org["id"],
        "group_name": "ADF New",
        "new_name": "ADF New",
    }


async def test_reject_name_change_notifies_owner(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])
    resp = await client.post(f"/api/admin/organizations/{org['id']}/reject-name")
    assert resp.status_code == 204

    auth["user"] = USER_A
    items = await _my_notifications(client)
    assert items[0]["type"] == "org_name_rejected"
    assert items[0]["data"] == {
        "group_id": org["id"],
        "group_name": "ADF Haiti",
        "rejected_name": "ADF New",
    }


async def test_notifications_are_listed_newest_first(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])
    await client.post(f"/api/admin/organizations/{org['id']}/approve-name")

    auth["user"] = USER_A
    items = await _my_notifications(client)
    types = [item["type"] for item in items]
    assert types == ["org_name_approved", "org_approved"]


async def test_mark_read_and_read_all(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])
    await client.post(f"/api/admin/organizations/{org['id']}/approve-name")

    auth["user"] = USER_A
    items = await _my_notifications(client)
    assert len(items) == 2

    resp = await client.post(f"/api/me/notifications/{items[0]['id']}/read")
    assert resp.status_code == 204
    items = await _my_notifications(client)
    unread = [item for item in items if item["read_at"] is None]
    assert len(unread) == 1

    resp = await client.post("/api/me/notifications/read-all")
    assert resp.status_code == 204
    items = await _my_notifications(client)
    assert all(item["read_at"] is not None for item in items)


async def test_cannot_read_another_users_notification(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    with patch("app.api.routes.organizations_admin.send_email", new=AsyncMock()):
        await client.post(f"/api/admin/organizations/{org['id']}/approve")

    auth["user"] = USER_A
    items = await _my_notifications(client)
    notification_id = items[0]["id"]

    auth["user"] = USER_B
    assert await _my_notifications(client) == []
    resp = await client.post(f"/api/me/notifications/{notification_id}/read")
    assert resp.status_code == 404


async def test_accepting_an_invitation_notifies_managers_and_the_invitee(
    client, auth, db
):
    org = await _approved_org(client, db)  # USER_A is the owner
    db.add(GroupMembership(group_id=org["id"], hanko_user_id=USER_B.id, role="manager"))
    db.add(GroupMembership(group_id=org["id"], hanko_user_id=USER_C.id, role="member"))
    invitee = make_user("invitee-id", "invitee@test.org")
    db.add(UserProfile(hanko_user_id=invitee.id, first_name="Ines", last_name="Vega"))
    await db.commit()

    token = await _invite(client, auth, org["id"], invitee)
    resp = await client.post(f"/api/me/invitations/{token}/accept")
    assert resp.status_code == 204

    for recipient in (USER_A, USER_B):
        items = await _notifications_of(client, auth, recipient, "org_invite_accepted")
        assert len(items) == 1, recipient.id
        assert items[0]["data"] == {
            "group_id": org["id"],
            "group_name": "ADF Haiti",
            "member_name": "Ines Vega",
            "role": "member",
        }
        assert items[0]["read_at"] is None

    # A plain member of the org is not notified.
    assert await _notifications_of(client, auth, USER_C) == []

    # The invitee gets their own receipt, already read.
    items = await _notifications_of(client, auth, invitee)
    assert len(items) == 1
    assert items[0]["type"] == "org_invite_response_self"
    assert items[0]["data"] == {
        "group_id": org["id"],
        "group_name": "ADF Haiti",
        "response": "accepted",
        "role": "member",
    }
    assert items[0]["read_at"] is not None


async def test_declining_an_invitation_notifies_managers_and_the_invitee(
    client, auth, db
):
    org = await _approved_org(client, db)  # USER_A is the owner
    db.add(GroupMembership(group_id=org["id"], hanko_user_id=USER_B.id, role="manager"))
    await db.commit()
    invitee = make_user("invitee-id", "invitee@test.org")

    token = await _invite(client, auth, org["id"], invitee, role="manager")
    resp = await client.post(f"/api/me/invitations/{token}/decline")
    assert resp.status_code == 204

    for recipient in (USER_A, USER_B):
        items = await _notifications_of(client, auth, recipient, "org_invite_declined")
        assert len(items) == 1, recipient.id
        # No profile for the invitee, so the invited email stands in.
        assert items[0]["data"] == {
            "group_id": org["id"],
            "group_name": "ADF Haiti",
            "member_name": invitee.email,
        }
        assert items[0]["read_at"] is None

    items = await _notifications_of(client, auth, invitee)
    assert len(items) == 1
    assert items[0]["type"] == "org_invite_response_self"
    assert items[0]["data"] == {
        "group_id": org["id"],
        "group_name": "ADF Haiti",
        "response": "declined",
    }
    assert items[0]["read_at"] is not None


async def test_accepting_without_a_profile_names_the_invitee_by_email(client, auth, db):
    """Nothing to show but the email: managers must never see a placeholder."""
    org = await _approved_org(client, db)  # USER_A is the owner
    invitee = make_user("invitee-id", "invitee@test.org")

    token = await _invite(client, auth, org["id"], invitee)
    resp = await client.post(f"/api/me/invitations/{token}/accept")
    assert resp.status_code == 204

    items = await _notifications_of(client, auth, USER_A, "org_invite_accepted")
    assert items[0]["data"]["member_name"] == invitee.email
