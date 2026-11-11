"""CORS allowlist: parsing CORS_ORIGINS and the headers on error responses."""

import uuid

from app.core.config import DEFAULT_CORS_ORIGINS, Settings

ALLOWED = "https://portal.hotosm.org"
UNKNOWN = "https://evil.example.com"


def test_cors_origins_env_replaces_default():
    settings = Settings(cors_origins=" https://a.hotosm.org, https://b.hotosm.org/ ,")
    assert settings.cors_origin_list == ["https://a.hotosm.org", "https://b.hotosm.org"]


def test_cors_origins_unset_uses_default():
    assert Settings(cors_origins="").cors_origin_list == DEFAULT_CORS_ORIGINS


async def test_error_echoes_allowed_origin(client):
    resp = await client.get(f"/api/groups/{uuid.uuid4()}", headers={"Origin": ALLOWED})
    assert resp.status_code == 404
    assert resp.headers["access-control-allow-origin"] == ALLOWED
    assert resp.headers["access-control-allow-credentials"] == "true"


async def test_error_does_not_echo_unknown_origin(client):
    resp = await client.get(f"/api/groups/{uuid.uuid4()}", headers={"Origin": UNKNOWN})
    assert resp.status_code == 404
    assert "access-control-allow-origin" not in resp.headers
