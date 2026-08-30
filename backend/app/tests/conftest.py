"""Pytest fixtures for the login backend.

Uses an in-memory SQLite database and overrides the Hanko auth dependency so
tests never validate a real JWT. The account-manager role is resolved against
the real ``account_managers`` table (not overridden) so its logic is exercised.
"""

import os

# Settings() is instantiated at import time and requires these; set them before
# importing anything under ``app``.
os.environ.setdefault("COOKIE_SECRET", "x" * 40)
os.environ.setdefault("ADMIN_EMAILS", "admin@test.org")

from collections.abc import AsyncGenerator  # noqa: E402
from datetime import datetime, timezone  # noqa: E402
from unittest.mock import patch  # noqa: E402

import pytest  # noqa: E402
from hotosm_auth.models import HankoUser  # noqa: E402
from hotosm_auth_fastapi import get_current_user  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import (  # noqa: E402
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def make_user(user_id: str, email: str | None = None) -> HankoUser:
    """Build a HankoUser for tests."""
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return HankoUser(
        id=user_id,
        email=email,
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


# Convenience test identities.
USER_A = make_user("user-a-id", "a@test.org")
USER_B = make_user("user-b-id", "b@test.org")
USER_C = make_user("user-c-id", "c@test.org")
USER_D = make_user("user-d-id", "d@test.org")
ADMIN = make_user("admin-id", "admin@test.org")


_KNOWN_EMAILS = {
    USER_A.email: USER_A.id,
    USER_B.email: USER_B.id,
    USER_C.email: USER_C.id,
    USER_D.email: USER_D.id,
    ADMIN.email: ADMIN.id,
}


@pytest.fixture(autouse=True)
def mock_hanko_lookup():
    """Stub the Hanko email lookups (no Hanko DB in tests)."""
    known_ids = {v: k for k, v in _KNOWN_EMAILS.items()}

    async def _email_to_user_id(email: str) -> str | None:
        return _KNOWN_EMAILS.get(email.strip().lower())

    async def _email_has_account(email: str) -> bool:
        return email.strip().lower() in _KNOWN_EMAILS

    async def _user_id_to_email(user_id: str) -> str | None:
        return known_ids.get(user_id)

    async def _user_ids_to_emails(user_ids: list[str]) -> dict[str, str]:
        return {uid: known_ids[uid] for uid in user_ids if uid in known_ids}

    async def _user_ids_to_usernames(user_ids: list[str]) -> dict[str, str]:
        return {}

    with (
        patch("app.services.hanko_lookup.email_to_user_id", new=_email_to_user_id),
        patch("app.services.hanko_lookup.email_has_account", new=_email_has_account),
        patch("app.services.hanko_lookup.user_id_to_email", new=_user_id_to_email),
        patch(
            "app.services.hanko_lookup.user_ids_to_emails",
            new=_user_ids_to_emails,
        ),
        patch(
            "app.services.hanko_lookup.user_ids_to_usernames",
            new=_user_ids_to_usernames,
        ),
    ):
        yield


@pytest.fixture(scope="session")
def anyio_backend():
    """Use asyncio backend for pytest-asyncio."""
    return "asyncio"


@pytest.fixture
async def test_engine():
    """Create an in-memory SQLite engine with all tables."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Provide a test database session."""
    session_maker = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_maker() as session:
        yield session


@pytest.fixture
def auth() -> dict[str, HankoUser]:
    """Mutable holder for the current test user (default USER_A)."""
    return {"user": USER_A}


@pytest.fixture
async def client(
    db: AsyncSession, auth: dict[str, HankoUser]
) -> AsyncGenerator[AsyncClient, None]:
    """AsyncClient with DB and auth dependency overrides.

    Change the acting user with ``auth["user"] = ...`` inside a test.
    """

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: auth["user"]

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as test_client:
        yield test_client

    app.dependency_overrides.clear()
