"""Tests for organization approval, name moderation and the AM role."""

from unittest.mock import AsyncMock, patch

from app.db.models import AccountManager
from app.tests.conftest import ADMIN, USER_A, USER_B, make_user


async def _create_org(client, name="ADF Haiti"):
    resp = await client.post("/api/groups", json={"type": "organization", "name": name})
    assert resp.status_code == 201
    return resp.json()


async def test_approve_organization(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    resp = await client.post(f"/api/admin/organizations/{org['id']}/approve")
    assert resp.status_code == 204

    resp = await client.get(f"/api/groups/{org['id']}")
    assert resp.json()["status"] == "approved"


async def test_approve_notifies_owner(client, auth):
    org = await _create_org(client)  # owner = USER_A (default acting user)
    auth["user"] = ADMIN
    with patch(
        "app.api.routes.organizations_admin.send_email", new=AsyncMock()
    ) as mock:
        resp = await client.post(f"/api/admin/organizations/{org['id']}/approve")
    assert resp.status_code == 204
    mock.assert_awaited_once()
    assert mock.await_args.kwargs["to"] == [USER_A.email]


async def test_reject_notifies_owner_with_reason(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    with patch(
        "app.api.routes.organizations_admin.send_email", new=AsyncMock()
    ) as mock:
        resp = await client.post(
            f"/api/admin/organizations/{org['id']}/reject",
            json={"reason": "duplicate"},
        )
    assert resp.status_code == 204
    mock.assert_awaited_once()
    assert "duplicate" in mock.await_args.kwargs["text_body"]


async def test_non_am_cannot_approve(client, auth):
    org = await _create_org(client)
    auth["user"] = USER_B  # not admin, not account manager
    resp = await client.post(f"/api/admin/organizations/{org['id']}/approve")
    assert resp.status_code == 403


async def test_reject_organization(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    resp = await client.post(
        f"/api/admin/organizations/{org['id']}/reject",
        json={"reason": "duplicate"},
    )
    assert resp.status_code == 204


async def test_name_change_requires_approval_when_approved(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    await client.post(f"/api/admin/organizations/{org['id']}/approve")

    # Owner requests a name change: it is staged, not applied.
    auth["user"] = USER_A
    resp = await client.post(
        f"/api/groups/{org['id']}/name-change", json={"name": "ADF New"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "ADF Haiti"
    assert body["pending_name"] == "ADF New"

    # Account manager approves the name change.
    auth["user"] = ADMIN
    resp = await client.post(f"/api/admin/organizations/{org['id']}/approve-name")
    assert resp.status_code == 204

    resp = await client.get(f"/api/groups/{org['id']}")
    body = resp.json()
    assert body["name"] == "ADF New"
    assert body["pending_name"] is None
    assert body["slug"] == "adf-new"


async def test_owner_can_edit_details_but_not_name(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    await client.post(f"/api/admin/organizations/{org['id']}/approve")
    auth["user"] = USER_A
    # PATCH ignores name entirely (not an accepted field).
    resp = await client.patch(
        f"/api/groups/{org['id']}",
        json={"website": "https://adf.ht", "name": "Hacked"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "ADF Haiti"
    assert resp.json()["website"] == "https://adf.ht"


async def test_am_role_via_allowlist_and_table(client, auth, db):
    # admin@test.org resolves as AM through the email allowlist.
    auth["user"] = ADMIN
    resp = await client.get("/api/me/roles")
    assert resp.json() == {"is_admin": True, "is_account_manager": True}

    # A plain user is neither.
    auth["user"] = USER_B
    resp = await client.get("/api/me/roles")
    assert resp.json() == {"is_admin": False, "is_account_manager": False}

    # Granting an account_managers row makes them an AM (but not admin).
    db.add(AccountManager(hanko_user_id=USER_B.id, granted_by=ADMIN.id))
    await db.commit()
    resp = await client.get("/api/me/roles")
    assert resp.json() == {"is_admin": False, "is_account_manager": True}


async def test_admin_grants_and_revokes_am(client, auth):
    target = make_user("target-id", "target@test.org")
    auth["user"] = ADMIN
    resp = await client.put(f"/api/admin/account-managers/{target.id}")
    assert resp.status_code == 204

    resp = await client.get("/api/admin/account-managers")
    assert any(am["hanko_user_id"] == target.id for am in resp.json())

    # The granted user can now act as an AM.
    auth["user"] = target
    org = await _create_org(client, name="Test Org")
    auth["user"] = ADMIN
    resp = await client.post(f"/api/admin/organizations/{org['id']}/approve")
    assert resp.status_code == 204

    resp = await client.delete(f"/api/admin/account-managers/{target.id}")
    assert resp.status_code == 204


async def test_non_admin_cannot_grant_am(client, auth):
    # An account manager is not an admin, so cannot grant the role.
    resp = await client.put(f"/api/admin/account-managers/{USER_B.id}")
    # USER_A (default) is neither admin nor AM.
    assert resp.status_code == 403


async def _stage_name_change(client, auth, org_id, new_name="ADF New"):
    """Approve the org, then stage a name change as its owner."""
    auth["user"] = ADMIN
    await client.post(f"/api/admin/organizations/{org_id}/approve")
    auth["user"] = USER_A
    resp = await client.post(
        f"/api/groups/{org_id}/name-change", json={"name": new_name}
    )
    assert resp.status_code == 200
    auth["user"] = ADMIN


async def test_pending_action_lists_pending_name_changes(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])

    resp = await client.get("/api/admin/organizations?pending_action=true")
    assert resp.status_code == 200
    ids = [item["id"] for item in resp.json()["items"]]
    assert org["id"] in ids


async def test_pending_action_excludes_settled_orgs(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    await client.post(f"/api/admin/organizations/{org['id']}/approve")

    resp = await client.get("/api/admin/organizations?pending_action=true")
    ids = [item["id"] for item in resp.json()["items"]]
    assert org["id"] not in ids

    # The plain status filter is untouched by the new flag.
    resp = await client.get("/api/admin/organizations?status=approved")
    ids = [item["id"] for item in resp.json()["items"]]
    assert org["id"] in ids


async def test_reject_name_change_clears_pending_name(client, auth):
    org = await _create_org(client)
    await _stage_name_change(client, auth, org["id"])

    resp = await client.post(f"/api/admin/organizations/{org['id']}/reject-name")
    assert resp.status_code == 204

    auth["user"] = USER_A
    body = (await client.get(f"/api/groups/{org['id']}")).json()
    assert body["pending_name"] is None
    assert body["name"] == "ADF Haiti"
    assert body["slug"] == "adf-haiti"
    assert body["status"] == "approved"


async def test_reject_name_change_without_pending_name(client, auth):
    org = await _create_org(client)
    auth["user"] = ADMIN
    await client.post(f"/api/admin/organizations/{org['id']}/approve")

    resp = await client.post(f"/api/admin/organizations/{org['id']}/reject-name")
    assert resp.status_code == 400
