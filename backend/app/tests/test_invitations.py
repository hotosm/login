"""Tests for the organization invitation lifecycle."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

from sqlalchemy import select

from app.db.models import Group, GroupInvitation
from app.tests.conftest import USER_B, make_user


async def _create_org(client, db, name="ADF Haiti"):
    resp = await client.post("/api/groups", json={"type": "organization", "name": name})
    org = resp.json()
    # Approve so invitations are allowed (pending orgs can't invite).
    group = await db.get(Group, org["id"])
    group.status = "approved"
    await db.commit()
    return org


async def _invite(client, org_id, email="invitee@test.org"):
    with patch("app.api.routes.invitations.send_email", new=AsyncMock()) as mock:
        resp = await client.post(
            f"/api/groups/{org_id}/invitations", json={"email": email}
        )
    return resp, mock


async def test_invite_sends_email_and_creates_pending(client, db):
    org = await _create_org(client, db)
    resp, mock = await _invite(client, org["id"])
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"
    assert resp.json()["email"] == "invitee@test.org"


async def test_teams_cannot_invite(client):
    resp = await client.post("/api/groups", json={"type": "team", "name": "T"})
    team_id = resp.json()["id"]
    resp = await client.post(
        f"/api/groups/{team_id}/invitations", json={"email": "x@test.org"}
    )
    assert resp.status_code == 400


async def test_cannot_invite_to_pending_org(client):
    resp = await client.post(
        "/api/groups", json={"type": "organization", "name": "Pending Org"}
    )
    org_id = resp.json()["id"]
    resp = await client.post(
        f"/api/groups/{org_id}/invitations", json={"email": "x@test.org"}
    )
    assert resp.status_code == 400


async def test_duplicate_pending_invite_conflicts(client, db):
    org = await _create_org(client, db)
    await _invite(client, org["id"])
    resp, _ = await _invite(client, org["id"])
    assert resp.status_code == 409


async def test_full_invite_accept_flow(client, auth, db):
    org = await _create_org(client, db)
    invitee = make_user("invitee-id", "invitee@test.org")
    await _invite(client, org["id"], email=invitee.email)

    # The recipient sees the invitation in their inbox with group context,
    # including the token they use to accept it in-app.
    auth["user"] = invitee
    inbox = await client.get("/api/me/invitations")
    assert len(inbox.json()) == 1
    assert inbox.json()[0]["group_name"] == "ADF Haiti"
    token = inbox.json()[0]["token"]
    assert token

    resp = await client.post(f"/api/me/invitations/{token}/accept")
    assert resp.status_code == 204

    # The invitee is now a member of the org.
    mine = await client.get("/api/groups")
    assert any(g["id"] == org["id"] for g in mine.json()["groups"])

    # Inbox is now empty (invitation accepted).
    inbox = await client.get("/api/me/invitations")
    assert inbox.json() == []


async def test_accept_wrong_email_forbidden(client, auth, db):
    org = await _create_org(client, db)
    await _invite(client, org["id"], email="someone@test.org")
    token = (await db.execute(select(GroupInvitation.token))).scalar_one()

    auth["user"] = USER_B  # b@test.org != someone@test.org
    resp = await client.post(f"/api/me/invitations/{token}/accept")
    assert resp.status_code == 403


async def test_accept_expired_invitation(client, auth, db):
    org = await _create_org(client, db)
    invitee = make_user("invitee-id", "invitee@test.org")
    await _invite(client, org["id"], email=invitee.email)

    invitation = (await db.execute(select(GroupInvitation))).scalar_one()
    invitation.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    await db.commit()

    auth["user"] = invitee
    resp = await client.post(f"/api/me/invitations/{invitation.token}/accept")
    assert resp.status_code == 410


async def test_revoke_invitation(client, auth, db):
    org = await _create_org(client, db)
    resp, _ = await _invite(client, org["id"])
    invitation_id = resp.json()["id"]

    resp = await client.delete(f"/api/groups/{org['id']}/invitations/{invitation_id}")
    assert resp.status_code == 204

    invitation = (await db.execute(select(GroupInvitation))).scalar_one()
    assert invitation.status == "revoked"
