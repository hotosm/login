import os
from contextlib import contextmanager

import pytest

from hotosm_auth.config import AuthConfig


@contextmanager
def _patched_env(values: dict[str, str | None]):
    previous = {}
    for key, value in values.items():
        previous[key] = os.environ.get(key)
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value
    try:
        yield
    finally:
        for key, value in previous.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value


def _minimal_env(**overrides: str | None) -> dict[str, str | None]:
    base = {
        "HANKO_API_URL": "https://dev.login.hotosm.org",
        "COOKIE_SECRET": "x" * 40,
        "COOKIE_DOMAIN": None,
        "COOKIE_SECURE": None,
        "COOKIE_SAMESITE": "lax",
        "JWT_AUDIENCE": None,
        "JWT_ISSUER": None,
        "OSM_CLIENT_ID": None,
        "OSM_CLIENT_SECRET": None,
        "OSM_REDIRECT_URI": None,
        "OSM_SCOPES": None,
        "OSM_API_URL": None,
        "ADMIN_EMAILS": None,
    }
    base.update(overrides)
    return base


def test_from_env_requires_hanko_api_url() -> None:
    with _patched_env(_minimal_env(HANKO_API_URL=None)):
        with pytest.raises(ValueError, match="HANKO_API_URL"):
            AuthConfig.from_env()


def test_from_env_requires_cookie_secret() -> None:
    with _patched_env(_minimal_env(COOKIE_SECRET=None)):
        with pytest.raises(ValueError, match="COOKIE_SECRET"):
            AuthConfig.from_env()


def test_from_env_auto_sets_jwt_issuer_and_cookie_defaults() -> None:
    with _patched_env(_minimal_env()):
        cfg = AuthConfig.from_env()
        assert cfg.jwt_issuer == "https://dev.login.hotosm.org"
        assert cfg.cookie_domain == ".hotosm.org"
        assert cfg.cookie_secure is True


def test_from_env_localhost_defaults_cookie_domain_to_localhost() -> None:
    with _patched_env(_minimal_env(HANKO_API_URL="http://localhost:8000")):
        cfg = AuthConfig.from_env()
        assert cfg.cookie_domain == "localhost"
        assert cfg.cookie_secure is False


def test_from_env_enables_osm_only_with_both_credentials() -> None:
    with _patched_env(_minimal_env(OSM_CLIENT_ID="id-only")):
        cfg = AuthConfig.from_env()
        assert cfg.osm_enabled is False
        assert cfg.osm_client_id is None
        assert cfg.osm_client_secret is None

    with _patched_env(
        _minimal_env(
            OSM_CLIENT_ID="osm-client-id",
            OSM_CLIENT_SECRET="osm-client-secret",
            OSM_REDIRECT_URI=None,
        )
    ):
        cfg = AuthConfig.from_env()
        assert cfg.osm_enabled is True
        assert cfg.osm_client_id == "osm-client-id"
        assert cfg.osm_client_secret == "osm-client-secret"
        assert cfg.osm_redirect_uri == "https://dev.login.hotosm.org/auth/osm/callback"
