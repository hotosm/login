import pytest

from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import CookieDecryptionError


def test_cookie_crypto_rejects_short_secret() -> None:
    with pytest.raises(ValueError, match="at least 32 bytes"):
        CookieCrypto("too-short-secret")


def test_decrypt_rejects_structurally_invalid_encrypted_value() -> None:
    crypto = CookieCrypto("x" * 32)
    with pytest.raises(CookieDecryptionError):
        crypto.decrypt_osm_connection("not-a-valid-fernet-token")
