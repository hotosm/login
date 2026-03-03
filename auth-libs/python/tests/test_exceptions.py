"""Tests for exception hierarchy."""

from hotosm_auth.exceptions import (
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
    CookieDecryptionError,
    OSMOAuthError,
    OSMAPIError,
)


def test_token_errors_inherit_from_authentication_error():
    """All token errors should be catchable as AuthenticationError."""
    assert issubclass(TokenExpiredError, AuthenticationError)
    assert issubclass(TokenInvalidError, AuthenticationError)
    assert issubclass(CookieDecryptionError, AuthenticationError)


def test_osm_errors_are_separate():
    """OSM errors should not be AuthenticationError."""
    assert not issubclass(OSMOAuthError, AuthenticationError)
    assert not issubclass(OSMAPIError, AuthenticationError)


def test_can_catch_all_auth_errors():
    """Verify we can catch specific errors as their base class."""
    try:
        raise TokenExpiredError("token expired")
    except AuthenticationError as e:
        assert "expired" in str(e)

    try:
        raise TokenInvalidError("bad token")
    except AuthenticationError as e:
        assert "bad" in str(e)
