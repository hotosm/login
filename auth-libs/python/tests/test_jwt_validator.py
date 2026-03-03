"""Tests for JWT validation logic."""

from datetime import datetime

import pytest

from hotosm_auth.jwt_validator import JWTValidator
from hotosm_auth.config import AuthConfig
from hotosm_auth.exceptions import TokenInvalidError


# We can't easily test the full validate_token flow without a real JWKS endpoint,
# but we can test the payload parsing logic directly.


class TestPayloadToUser:
    """Test JWT payload parsing."""

    def _make_validator(self) -> JWTValidator:
        """Create a validator with minimal config (won't actually validate tokens)."""
        config = AuthConfig(
            hanko_api_url="https://localhost:8000",
            cookie_secret="x" * 40,
            cookie_domain="localhost",
        )
        return JWTValidator(config)

    def test_parses_standard_hanko_payload(self):
        validator = self._make_validator()

        payload = {
            "sub": "user-123",
            "email": "test@example.com",
            "email_verified": True,
            "username": "testuser",
            "iat": 1700000000,
        }

        user = validator._payload_to_user(payload)

        assert user.id == "user-123"
        assert user.email == "test@example.com"
        assert user.email_verified is True
        assert user.username == "testuser"

    def test_handles_email_as_object(self):
        """Hanko sometimes sends email as {address: ..., is_verified: ...}"""
        validator = self._make_validator()

        payload = {
            "sub": "user-456",
            "email": {
                "address": "nested@example.com",
                "is_verified": True,
            },
            "iat": 1700000000,
        }

        user = validator._payload_to_user(payload)

        assert user.email == "nested@example.com"
        assert user.email_verified is True

    def test_rejects_payload_without_sub(self):
        validator = self._make_validator()

        payload = {
            "email": "test@example.com",
            "iat": 1700000000,
        }

        with pytest.raises(TokenInvalidError, match="missing required claims"):
            validator._payload_to_user(payload)

    def test_rejects_payload_without_email(self):
        validator = self._make_validator()

        payload = {
            "sub": "user-123",
            "iat": 1700000000,
        }

        with pytest.raises(TokenInvalidError, match="missing required claims"):
            validator._payload_to_user(payload)

    def test_username_is_optional(self):
        validator = self._make_validator()

        payload = {
            "sub": "user-789",
            "email": "no-username@example.com",
            "iat": 1700000000,
        }

        user = validator._payload_to_user(payload)

        assert user.id == "user-789"
        assert user.username is None


class TestParseTimestamp:
    """Test timestamp parsing utility."""

    def test_parses_unix_timestamp(self):
        ts = 1700000000  # 2023-11-14 22:13:20 UTC

        result = JWTValidator._parse_timestamp(ts)

        assert result.year == 2023
        assert result.month == 11
        assert result.day == 14

    def test_handles_float_timestamp(self):
        ts = 1700000000.123

        result = JWTValidator._parse_timestamp(ts)

        assert isinstance(result, datetime)

    def test_returns_now_for_none(self):
        before = datetime.utcnow()
        result = JWTValidator._parse_timestamp(None)
        after = datetime.utcnow()

        assert before <= result <= after
