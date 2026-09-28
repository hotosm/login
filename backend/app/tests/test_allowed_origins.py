"""Tests for the admin-managed CORS allowlist.

The point of the feature is that saving an origin changes what the browser is
allowed to do without a restart, so the tests exercise the middleware decision
and not only the CRUD.
"""

import pytest

from app.db.models import AllowedOrigin
from app.services import allowed_origins_service
from app.tests.conftest import ADMIN, USER_A

ORIGIN = "https://newsite.hotosm.org"


@pytest.fixture(autouse=True)
def clean_origin_cache():
    """Each test starts with an empty, stale cache."""
    allowed_origins_service._cache = frozenset()
    allowed_origins_service.invalidate()
    yield
    allowed_origins_service._cache = frozenset()
    allowed_origins_service.invalidate()


# ───────────────────────────── validation ────────────────────────────────────


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("https://portal.hotosm.org", "https://portal.hotosm.org"),
        ("https://portal.hotosm.org/", "https://portal.hotosm.org"),
        ("  https://Portal.HOTOSM.org  ", "https://portal.hotosm.org"),
        ("http://localhost:5173", "http://localhost:5173"),
    ],
)
def test_normalize_origin_accepts(raw, expected):
    assert allowed_origins_service.normalize_origin(raw) == expected


@pytest.mark.parametrize(
    "raw",
    [
        "",
        "portal.hotosm.org",  # no scheme: never matches an Origin header
        "https://portal.hotosm.org/path",  # a path is not part of an origin
        "https://*.hotosm.org",  # comparison is exact, so this never matches
        "ftp://portal.hotosm.org",
        "https://",
    ],
)
def test_normalize_origin_rejects(raw):
    with pytest.raises(allowed_origins_service.InvalidOriginError):
        allowed_origins_service.normalize_origin(raw)


# ─────────────────────────────── endpoints ───────────────────────────────────


async def test_non_admin_cannot_read_or_write(client, auth):
    auth["user"] = USER_A
    assert (await client.get("/api/admin/cors-origins")).status_code == 403
    resp = await client.post("/api/admin/cors-origins", json={"origin": ORIGIN})
    assert resp.status_code == 403


async def test_admin_creates_and_lists(client, auth):
    auth["user"] = ADMIN
    resp = await client.post(
        "/api/admin/cors-origins", json={"origin": ORIGIN, "note": "New site"}
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["origin"] == ORIGIN
    assert resp.json()["enabled"] is True
    assert resp.json()["created_by"] == ADMIN.id

    listed = (await client.get("/api/admin/cors-origins")).json()
    assert [row["origin"] for row in listed] == [ORIGIN]


async def test_duplicate_origin_is_rejected(client, auth):
    auth["user"] = ADMIN
    await client.post("/api/admin/cors-origins", json={"origin": ORIGIN})
    resp = await client.post("/api/admin/cors-origins", json={"origin": ORIGIN + "/"})
    assert resp.status_code == 409


async def test_invalid_origin_is_rejected_with_a_reason(client, auth):
    auth["user"] = ADMIN
    resp = await client.post(
        "/api/admin/cors-origins", json={"origin": "https://*.hotosm.org"}
    )
    assert resp.status_code == 422
    assert "wildcard" in resp.json()["message"].lower()


# ──────────────────────────── cache behaviour ────────────────────────────────


async def test_disabled_origin_is_not_loaded(db):
    db.add(AllowedOrigin(id="1", origin=ORIGIN, enabled=True))
    db.add(AllowedOrigin(id="2", origin="https://off.hotosm.org", enabled=False))
    await db.commit()

    loaded = await allowed_origins_service.load_origins(db)
    assert loaded == {ORIGIN}


async def test_cache_survives_a_database_failure(monkeypatch):
    """A transient outage must not drop every origin.

    Clearing the set would turn one broken query into every browser call
    failing CORS.
    """
    allowed_origins_service._cache = frozenset({ORIGIN})

    def _boom(*args, **kwargs):
        raise RuntimeError("database is down")

    monkeypatch.setattr(allowed_origins_service, "async_session_maker", _boom)
    allowed_origins_service.invalidate()

    assert await allowed_origins_service.refresh_if_stale() == {ORIGIN}
    assert allowed_origins_service.is_allowed(ORIGIN)


def test_bootstrap_origins_survive_an_empty_database():
    """Local development keeps working with nothing in the table."""
    allowed_origins_service._cache = frozenset()
    assert allowed_origins_service.is_allowed("http://localhost:5173")
    assert not allowed_origins_service.is_allowed(ORIGIN)


# ───────────────────────── end to end, no restart ────────────────────────────


@pytest.fixture
def db_backed_cache(db, monkeypatch):
    """Point the service's own session maker at the test database.

    The middleware opens its own session (it runs outside the request's
    dependency graph), so overriding get_db is not enough here.
    """

    class _Maker:
        def __call__(self):
            return self

        async def __aenter__(self):
            return db

        async def __aexit__(self, *exc):
            return False

    monkeypatch.setattr(allowed_origins_service, "async_session_maker", _Maker())


async def test_saving_an_origin_changes_cors_without_a_restart(
    client, auth, db, db_backed_cache
):
    """The whole point of the feature: same process, same app, new answer."""
    headers = {"Origin": ORIGIN}

    before = await client.get("/api/admin/cors-origins", headers=headers)
    assert "access-control-allow-origin" not in before.headers

    auth["user"] = ADMIN
    created = await client.post(
        "/api/admin/cors-origins", json={"origin": ORIGIN}, headers=headers
    )
    assert created.status_code == 201

    after = await client.get("/api/admin/cors-origins", headers=headers)
    assert after.headers.get("access-control-allow-origin") == ORIGIN
    assert after.headers.get("access-control-allow-credentials") == "true"


async def test_disabling_an_origin_revokes_cors(client, auth, db, db_backed_cache):
    auth["user"] = ADMIN
    created = await client.post("/api/admin/cors-origins", json={"origin": ORIGIN})
    origin_id = created.json()["id"]

    headers = {"Origin": ORIGIN}
    assert (await client.get("/health", headers=headers)).headers.get(
        "access-control-allow-origin"
    ) == ORIGIN

    await client.patch(f"/api/admin/cors-origins/{origin_id}", json={"enabled": False})

    after = await client.get("/health", headers=headers)
    assert "access-control-allow-origin" not in after.headers


async def test_error_responses_do_not_reflect_an_unknown_origin(
    client, auth, db, db_backed_cache
):
    """Errors must not echo an origin the middleware would reject.

    This handler used to reflect whatever Origin it was given, so a curl check
    passed while the browser was still blocked on real responses.
    """
    auth["user"] = USER_A
    resp = await client.get(
        "/api/admin/cors-origins", headers={"Origin": "https://evil.example.com"}
    )
    assert resp.status_code == 403
    assert "access-control-allow-origin" not in resp.headers
