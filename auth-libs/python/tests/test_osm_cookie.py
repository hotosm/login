"""Tests for OSMConnection cookie encryption/decryption cycle."""

from datetime import datetime, timedelta, timezone

import pytest

from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import CookieDecryptionError
from hotosm_auth.models import OSMConnection


class TestOSMConnectionCookie:
    """Test full encrypt/decrypt cycle for OSM connection cookies."""

    @pytest.fixture
    def crypto(self):
        # Need at least 32 bytes for Fernet
        return CookieCrypto("a" * 32 + "12345678")

    def test_round_trip_basic(self, crypto):
        """Encrypt and decrypt preserves all fields."""
        original = OSMConnection(
            osm_user_id=12345,
            osm_username="mapper_joe",
            osm_avatar_url="https://osm.org/avatar/123.png",
            access_token="secret-token-abc",
            scopes=["read_prefs", "write_api"],
        )

        encrypted = crypto.encrypt_osm_connection(original)
        decrypted = crypto.decrypt_osm_connection(encrypted)

        assert decrypted.osm_user_id == 12345
        assert decrypted.osm_username == "mapper_joe"
        assert decrypted.osm_avatar_url == "https://osm.org/avatar/123.png"
        assert decrypted.access_token == "secret-token-abc"
        assert decrypted.scopes == ["read_prefs", "write_api"]

    def test_round_trip_with_expiration(self, crypto):
        """Preserves expiration timestamp."""
        expires = datetime.now(timezone.utc) + timedelta(hours=1)

        original = OSMConnection(
            osm_user_id=99999,
            osm_username="tester",
            osm_avatar_url=None,
            access_token="token",
            expires_at=expires,
            scopes=["read_prefs"],
        )

        encrypted = crypto.encrypt_osm_connection(original)
        decrypted = crypto.decrypt_osm_connection(encrypted)

        # Timestamps might lose microseconds in serialization
        assert abs((decrypted.expires_at - expires).total_seconds()) < 1

    def test_round_trip_with_refresh_token(self, crypto):
        """Preserves optional refresh token."""
        original = OSMConnection(
            osm_user_id=11111,
            osm_username="refresher",
            osm_avatar_url=None,
            access_token="access",
            refresh_token="refresh-token-xyz",
            scopes=["read_prefs"],
        )

        encrypted = crypto.encrypt_osm_connection(original)
        decrypted = crypto.decrypt_osm_connection(encrypted)

        assert decrypted.refresh_token == "refresh-token-xyz"

    def test_encrypted_value_is_not_plaintext(self, crypto):
        """Encrypted string doesn't contain plaintext values."""
        original = OSMConnection(
            osm_user_id=12345,
            osm_username="visible_name",
            osm_avatar_url=None,
            access_token="super_secret_token",
            scopes=["read_prefs"],
        )

        encrypted = crypto.encrypt_osm_connection(original)

        # Should not contain any plaintext
        assert "visible_name" not in encrypted
        assert "super_secret_token" not in encrypted
        assert "12345" not in encrypted

    def test_different_secrets_cannot_decrypt(self):
        """Cookie encrypted with one secret can't be decrypted with another."""
        crypto1 = CookieCrypto("a" * 40)
        crypto2 = CookieCrypto("b" * 40)

        original = OSMConnection(
            osm_user_id=1,
            osm_username="test",
            osm_avatar_url=None,
            access_token="token",
            scopes=[],
        )

        encrypted = crypto1.encrypt_osm_connection(original)

        with pytest.raises(CookieDecryptionError):
            crypto2.decrypt_osm_connection(encrypted)

    def test_tampered_cookie_fails(self, crypto):
        """Modified cookie fails decryption."""
        original = OSMConnection(
            osm_user_id=1,
            osm_username="test",
            osm_avatar_url=None,
            access_token="token",
            scopes=[],
        )

        encrypted = crypto.encrypt_osm_connection(original)

        # Tamper with the encrypted value
        tampered = encrypted[:-5] + "XXXXX"

        with pytest.raises(CookieDecryptionError):
            crypto.decrypt_osm_connection(tampered)
