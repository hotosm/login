from datetime import datetime, timedelta, timezone

import pytest

from hotosm_auth.crypto import CookieCrypto, generate_cookie_secret
from hotosm_auth.exceptions import CookieDecryptionError
from hotosm_auth.models import OSMConnection


def _sample_connection() -> OSMConnection:
    return OSMConnection(
        osm_user_id=123456,
        osm_username="test-user",
        osm_avatar_url="https://example.com/avatar.png",
        access_token="access-token-value",
        refresh_token="refresh-token-value",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        scopes=["read_prefs", "write_api"],
    )


def test_generate_cookie_secret_has_fernet_compatible_length() -> None:
    secret = generate_cookie_secret()
    assert isinstance(secret, str)
    assert len(secret) >= 44


def test_encrypt_decrypt_round_trip() -> None:
    crypto = CookieCrypto("x" * 32)
    original = _sample_connection()

    encrypted = crypto.encrypt_osm_connection(original)
    restored = crypto.decrypt_osm_connection(encrypted)

    assert restored.osm_user_id == original.osm_user_id
    assert restored.osm_username == original.osm_username
    assert restored.osm_avatar_url == original.osm_avatar_url
    assert restored.access_token == original.access_token
    assert restored.refresh_token == original.refresh_token
    assert restored.scopes == original.scopes
    assert restored.expires_at is not None


def test_decrypt_rejects_tampered_payload() -> None:
    crypto = CookieCrypto("x" * 32)
    encrypted = crypto.encrypt_osm_connection(_sample_connection())

    tampered = encrypted[:-1] + ("A" if encrypted[-1] != "A" else "B")

    with pytest.raises(CookieDecryptionError):
        crypto.decrypt_osm_connection(tampered)
