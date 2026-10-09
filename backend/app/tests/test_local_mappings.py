"""Admin management of the mappings login keeps itself.

Every other app answers for its own ``hanko_user_mappings`` table and the admin
screens proxy to it. LearnWorlds has no backend of ours, so these go to login's
database instead — which is what lets support fix a bad link without opening a
psql session on production.
"""

import pytest
from hotosm_auth_fastapi import get_current_user

from app.db.models import HankoUserMapping
from app.main import app
from app.tests.conftest import ADMIN

MAPPINGS = "/api/admin/learnworlds/mappings"


@pytest.fixture
def as_admin():
    """Act as an admin; the endpoints are closed to everyone else."""
    app.dependency_overrides[get_current_user] = lambda: ADMIN
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_learnworlds_appears_in_the_app_picker(client, as_admin):
    """It has no backend URL, so without this it would be missing."""
    response = await client.get("/api/admin/apps")

    assert response.status_code == 200
    assert "learnworlds" in response.json()["apps"]


@pytest.mark.asyncio
async def test_mappings_are_listed_from_our_own_database(client, db, as_admin):
    """No proxying: there is nothing on the other side to ask."""
    db.add(
        HankoUserMapping(
            hanko_user_id="user-1", app_name="learnworlds", app_user_id="lw-1"
        )
    )
    await db.commit()

    response = await client.get(MAPPINGS)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["app_user_id"] == "lw-1"


@pytest.mark.asyncio
async def test_other_apps_are_not_affected(client, db, as_admin):
    """A mapping for another app must not show up under this one."""
    db.add(HankoUserMapping(hanko_user_id="user-1", app_name="fair", app_user_id="f-1"))
    await db.commit()

    response = await client.get(MAPPINGS)

    assert response.json()["total"] == 0


@pytest.mark.asyncio
async def test_a_mapping_can_be_repointed(client, db, as_admin):
    """The repair support actually needs: send someone back to their courses.

    Signing up with a second address links the person to a new, empty account;
    pointing the mapping at the old one gives their courses back without
    LearnWorlds having to merge anything.
    """
    db.add(
        HankoUserMapping(
            hanko_user_id="user-1", app_name="learnworlds", app_user_id="lw-empty"
        )
    )
    await db.commit()

    response = await client.put(
        f"{MAPPINGS}/user-1", json={"app_user_id": "lw-with-courses"}
    )

    assert response.status_code == 200
    assert response.json()["app_user_id"] == "lw-with-courses"

    listed = await client.get(MAPPINGS)
    assert [i["app_user_id"] for i in listed.json()["items"]] == ["lw-with-courses"]


@pytest.mark.asyncio
async def test_a_mapping_can_be_created_and_deleted(client, db, as_admin):
    """Deleting leaves the next login to resolve the person from scratch."""
    created = await client.post(
        MAPPINGS, json={"hanko_user_id": "user-2", "app_user_id": "lw-2"}
    )
    assert created.status_code == 200

    deleted = await client.delete(f"{MAPPINGS}/user-2")
    assert deleted.status_code in (200, 204)

    missing = await client.get(f"{MAPPINGS}/user-2")
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_mappings_are_closed_to_non_admins(client, db):
    """These expose who studies what, and allow repointing accounts."""
    response = await client.get(MAPPINGS)

    assert response.status_code == 403
