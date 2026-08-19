"""Integration tests for full JWT validation flow."""

import time
from unittest.mock import MagicMock, patch

import jwt
import pytest
from cryptography.hazmat.backends import default_backend

# Generate a test RSA key pair for signing JWTs
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from hotosm_auth.config import AuthConfig
from hotosm_auth.exceptions import TokenExpiredError, TokenInvalidError
from hotosm_auth.jwt_validator import JWTValidator


def _generate_test_keys():
    """Generate RSA key pair for testing."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    public_key = private_key.public_key()

    # Get PEM formats
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    return private_key, public_key, private_pem


class TestJWTValidation:
    """Test full JWT validation with mocked JWKS."""

    @pytest.fixture
    def keys(self):
        """Generate test keys once per test class."""
        return _generate_test_keys()

    @pytest.fixture
    def config(self):
        return AuthConfig(
            hanko_api_url="https://test.hanko.io",
            cookie_secret="x" * 40,
            cookie_domain="test.local",
            jwt_issuer="https://test.hanko.io",
            jwt_audience="https://myapp.test",
        )

    def _create_token(self, private_key, payload):
        """Create a signed JWT."""
        return jwt.encode(payload, private_key, algorithm="RS256")

    @pytest.mark.asyncio
    async def test_validates_good_token(self, config, keys):
        private_key, public_key, _ = keys

        now = int(time.time())
        payload = {
            "sub": "user-abc-123",
            "email": "test@example.com",
            "email_verified": True,
            "iat": now,
            "exp": now + 3600,
            "iss": "https://test.hanko.io",
            "aud": ["https://myapp.test"],
        }
        token = self._create_token(private_key, payload)

        validator = JWTValidator(config)

        # Mock the JWKS client to return our test key
        mock_signing_key = MagicMock()
        mock_signing_key.key = public_key

        with patch.object(
            validator._jwk_client,
            "get_signing_key_from_jwt",
            return_value=mock_signing_key,
        ):
            user = await validator.validate_token(token)

        assert user.id == "user-abc-123"
        assert user.email == "test@example.com"
        assert user.email_verified is True

    @pytest.mark.asyncio
    async def test_rejects_expired_token(self, config, keys):
        private_key, public_key, _ = keys

        now = int(time.time())
        payload = {
            "sub": "user-abc-123",
            "email": "test@example.com",
            "iat": now - 7200,
            "exp": now - 3600,  # Expired 1 hour ago
            "iss": "https://test.hanko.io",
            "aud": ["https://myapp.test"],
        }
        token = self._create_token(private_key, payload)

        validator = JWTValidator(config)

        mock_signing_key = MagicMock()
        mock_signing_key.key = public_key

        with (
            patch.object(
                validator._jwk_client,
                "get_signing_key_from_jwt",
                return_value=mock_signing_key,
            ),
            pytest.raises(TokenExpiredError),
        ):
            await validator.validate_token(token)

    @pytest.mark.asyncio
    async def test_rejects_wrong_issuer(self, config, keys):
        private_key, public_key, _ = keys

        now = int(time.time())
        payload = {
            "sub": "user-abc-123",
            "email": "test@example.com",
            "iat": now,
            "exp": now + 3600,
            "iss": "https://evil.attacker.com",  # Wrong issuer
            "aud": ["https://myapp.test"],
        }
        token = self._create_token(private_key, payload)

        validator = JWTValidator(config)

        mock_signing_key = MagicMock()
        mock_signing_key.key = public_key

        with (
            patch.object(
                validator._jwk_client,
                "get_signing_key_from_jwt",
                return_value=mock_signing_key,
            ),
            pytest.raises(TokenInvalidError),
        ):
            await validator.validate_token(token)

    @pytest.mark.asyncio
    async def test_rejects_wrong_audience(self, config, keys):
        private_key, public_key, _ = keys

        now = int(time.time())
        payload = {
            "sub": "user-abc-123",
            "email": "test@example.com",
            "iat": now,
            "exp": now + 3600,
            "iss": "https://test.hanko.io",
            "aud": ["https://other-app.test"],  # Wrong audience
        }
        token = self._create_token(private_key, payload)

        validator = JWTValidator(config)

        mock_signing_key = MagicMock()
        mock_signing_key.key = public_key

        with (
            patch.object(
                validator._jwk_client,
                "get_signing_key_from_jwt",
                return_value=mock_signing_key,
            ),
            pytest.raises(TokenInvalidError),
        ):
            await validator.validate_token(token)
