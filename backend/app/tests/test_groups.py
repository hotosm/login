"""Integration tests for group CRUD, members and access control."""

from app.tests.conftest import ADMIN, USER_A, USER_B


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


async def test_create_team_is_approved_with_owner(client):
    body = await _create_team(client)
    assert body["type"] == "team"
    assert body["status"] == "approved"
    assert body["role"] == "owner"
    assert body["members_count"] == 1
    assert body["slug"] == "mappers"


async def test_create_team_with_member_emails(client, auth):
    team = await _create_team(client, member_emails=[USER_B.email])
    assert team["members_count"] == 2
    auth["user"] = USER_B
    mine = await client.get("/api/groups")
    assert any(g["id"] == team["id"] for g in mine.json()["groups"])


async def test_create_org_is_pending(client):
    resp = await client.post(
        "/api/groups", json={"type": "organization", "name": "ADF Haiti"}
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


async def test_list_my_groups_only_mine(client, auth):
    await _create_team(client, name="Team A")
    auth["user"] = USER_B
    await _create_team(client, name="Team B")

    resp = await client.get("/api/groups")
    names = {g["name"] for g in resp.json()["groups"]}
    assert names == {"Team B"}


async def test_list_my_groups_type_filter(client):
    await _create_team(client, name="My Team")
    await client.post(
        "/api/groups", json={"type": "organization", "name": "My Org"}
    )
    resp = await client.get("/api/groups", params={"type": "organization"})
    groups = resp.json()["groups"]
    assert len(groups) == 1
    assert groups[0]["type"] == "organization"


async def test_non_member_gets_404(client, auth):
    team = await _create_team(client)
    auth["user"] = USER_B
    resp = await client.get(f"/api/groups/{team['id']}")
    assert resp.status_code == 404


async def test_account_manager_can_view_any_group(client, auth):
    team = await _create_team(client)
    auth["user"] = ADMIN  # admin@test.org is an account manager by allowlist
    resp = await client.get(f"/api/groups/{team['id']}")
    assert resp.status_code == 200
    assert resp.json()["role"] is None  # AM is not a member


async def test_team_add_member_directly(client, auth):
    team = await _create_team(client)
    resp = await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    assert resp.status_code == 201
    assert resp.json()["total"] == 2

    auth["user"] = USER_B
    mine = await client.get("/api/groups")
    assert len(mine.json()["groups"]) == 1


async def test_team_add_member_unknown_email_404(client):
    team = await _create_team(client)
    resp = await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": "nobody@test.org", "role": "member"},
    )
    assert resp.status_code == 404


async def test_org_rejects_direct_member_add(client):
    resp = await client.post(
        "/api/groups", json={"type": "organization", "name": "Org"}
    )
    org_id = resp.json()["id"]
    resp = await client.post(
        f"/api/groups/{org_id}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    assert resp.status_code == 400


async def test_member_cannot_update_details(client, auth):
    team = await _create_team(client)
    await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    auth["user"] = USER_B
    resp = await client.patch(
        f"/api/groups/{team['id']}", json={"description": "hi"}
    )
    assert resp.status_code == 403


async def test_owner_updates_details(client):
    team = await _create_team(client)
    resp = await client.patch(
        f"/api/groups/{team['id']}",
        json={"description": "We map things", "is_public": True},
    )
    assert resp.status_code == 200
    assert resp.json()["description"] == "We map things"
    assert resp.json()["is_public"] is True


async def test_team_name_change_is_direct(client):
    team = await _create_team(client)
    resp = await client.post(
        f"/api/groups/{team['id']}/name-change", json={"name": "New Name"}
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"
    assert resp.json()["pending_name"] is None


async def test_transfer_ownership(client, auth):
    team = await _create_team(client)
    await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    resp = await client.patch(
        f"/api/groups/{team['id']}/members/{USER_B.id}",
        json={"role": "owner"},
    )
    assert resp.status_code == 204

    # The former owner is now a manager; USER_B is the owner.
    resp = await client.get(f"/api/groups/{team['id']}")
    assert resp.json()["role"] == "manager"


async def test_delete_group_owner_only(client, auth):
    team = await _create_team(client)
    await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": USER_B.email, "role": "member"},
    )
    auth["user"] = USER_B
    resp = await client.delete(f"/api/groups/{team['id']}")
    assert resp.status_code == 403

    auth["user"] = USER_A
    resp = await client.delete(f"/api/groups/{team['id']}")
    assert resp.status_code == 204
    resp = await client.get(f"/api/groups/{team['id']}")
    assert resp.status_code == 404


async def test_membership_check(client):
    team = await _create_team(client)
    await client.post(
        f"/api/groups/{team['id']}/members",
        json={"email": USER_B.email, "role": "manager"},
    )
    resp = await client.get(
        f"/api/groups/{team['id']}/membership/{USER_B.id}",
        params={"min_role": "manager"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_member"] is True
    assert body["role"] == "manager"
    assert body["satisfies_min_role"] is True

    resp = await client.get(
        f"/api/groups/{team['id']}/membership/{USER_B.id}",
        params={"min_role": "owner"},
    )
    assert resp.json()["satisfies_min_role"] is False
