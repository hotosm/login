from datetime import datetime, timedelta, timezone

from hotosm_auth.models import HankoUser, OSMConnection, OSMScope


def test_hanko_user_display_name_prefers_username() -> None:
    user = HankoUser(
        id="user-1",
        email="person@example.org",
        email_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        username="human-name",
    )
    assert user.display_name == "human-name"


def test_hanko_user_display_name_falls_back_to_email_prefix() -> None:
    user = HankoUser(
        id="user-2",
        email="fallback@example.org",
        email_verified=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        username=None,
    )
    assert user.display_name == "fallback"


def test_osm_connection_expiration_and_scope_checks() -> None:
    conn = OSMConnection(
        osm_user_id=42,
        osm_username="mapper",
        osm_avatar_url=None,
        access_token="access",
        refresh_token="refresh",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        scopes=[OSMScope.READ_PREFS.value, "write_api"],
    )

    assert conn.is_expired is False
    assert conn.has_scope(OSMScope.READ_PREFS) is True
    assert conn.has_scope("write_api") is True
    assert conn.has_scope(OSMScope.WRITE_GPX) is False


def test_osm_connection_reports_expired_token() -> None:
    conn = OSMConnection(
        osm_user_id=7,
        osm_username="expired-user",
        osm_avatar_url=None,
        access_token="access",
        refresh_token=None,
        expires_at=datetime.now(timezone.utc) - timedelta(seconds=1),
        scopes=[],
    )
    assert conn.is_expired is True
