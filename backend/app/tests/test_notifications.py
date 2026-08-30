"""Tests for in-app notifications and the events that emit them."""

from unittest.mock import AsyncMock, patch

from app.tests.conftest import ADMIN, USER_A, USER_B


async def _create_org(client, name="ADF Haiti"):
    resp = await client.post("/api/groups", json={"type": "organization", "name": name})
    assert resp.status_code == 201
    return resp.json()


async def _my_notifications(client):
    resp = await client.get("/api/me/notifications")
    assert resp.status_code == 200
    return resp.json()


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
