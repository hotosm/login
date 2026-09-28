"""Tests for the LearnWorlds Custom SSO endpoint.

The LearnWorlds API is stubbed: these check how we resolve which account a
person owns, not that their API works.
"""

from unittest.mock import AsyncMock, patch
from urllib.parse import parse_qs, urlparse

import pytest
from hotosm_auth_fastapi import get_current_user_optional
from sqlalchemy import select

from app.api.routes import sso as sso_route
from app.db.models import HankoUserMapping
from app.main import app
from app.tests.conftest import USER_A, make_user

SCHOOL = "https://learn-dev.hotosm.org"
LOGIN_URL = f"{SCHOOL}/login?code=one-time-code"
SSO_PATH = "/api/sso/learnworlds"


@pytest.fixture
def lw():
    """Stub the LearnWorlds client with a configured school and no users."""
    with (
        patch.object(sso_route.learnworlds_client, "school_url", SCHOOL),
        patch.object(
            type(sso_route.learnworlds_client),
            "is_configured",
            property(lambda self: True),
        ),
        patch.object(
            sso_route.learnworlds_client,
            "get_user_by_email",
            new=AsyncMock(return_value=None),
        ),
        patch.object(
            sso_route.learnworlds_client,
            "sso_login",
            new=AsyncMock(return_value=(LOGIN_URL, "lw-user-1")),
        ),
    ):
        yield sso_route.learnworlds_client


@pytest.fixture
def anon():
    """Make the endpoint see an anonymous visitor."""
    app.dependency_overrides[get_current_user_optional] = lambda: None
    yield
    app.dependency_overrides.pop(get_current_user_optional, None)


@pytest.fixture
def signed_in(auth):
    """Make the endpoint see the acting test user."""
    app.dependency_overrides[get_current_user_optional] = lambda: auth["user"]
    yield auth
    app.dependency_overrides.pop(get_current_user_optional, None)


async def _mappings(db) -> list[HankoUserMapping]:
    result = await db.execute(select(HankoUserMapping))
    return list(result.scalars().all())


@pytest.mark.asyncio
async def test_anonymous_goes_to_login_and_comes_back(client, lw, anon):
    """Without a session the visitor is sent to our login page."""
    response = await client.get(
        SSO_PATH,
        params={"action": "login", "redirectUrl": f"{SCHOOL}/courses"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    location = urlparse(response.headers["location"])
    assert location.path == "/app/"

    # ...and the round trip back here keeps both parameters.
    return_to = parse_qs(location.query)["return_to"][0]
    back = urlparse(return_to)
    assert back.path == SSO_PATH  # /api, the prefix the ingress routes here
    assert parse_qs(back.query) == {
        "action": ["login"],
        "redirectUrl": [f"{SCHOOL}/courses"],
    }

    lw.sso_login.assert_not_awaited()


@pytest.mark.asyncio
async def test_existing_email_is_adopted_and_linked(client, db, lw, signed_in):
    """A matching email takes over the existing account, with no screens."""
    lw.get_user_by_email.return_value = {"id": "lw-existing", "email": USER_A.email}
    lw.sso_login.return_value = (LOGIN_URL, "lw-existing")

    response = await client.get(
        SSO_PATH, params={"redirectUrl": f"{SCHOOL}/courses"}, follow_redirects=False
    )

    assert response.status_code == 302
    assert response.headers["location"] == LOGIN_URL

    # Logged in by id, not by email: the account already existed.
    assert lw.sso_login.await_args.kwargs["user_id"] == "lw-existing"
    assert lw.sso_login.await_args.kwargs["email"] is None

    rows = await _mappings(db)
    assert [(r.hanko_user_id, r.app_name, r.app_user_id) for r in rows] == [
        (USER_A.id, "learnworlds", "lw-existing")
    ]


@pytest.mark.asyncio
async def test_second_login_uses_the_mapping(client, db, lw, signed_in):
    """Once linked, the email is never consulted again."""
    db.add(
        HankoUserMapping(
            hanko_user_id=USER_A.id, app_name="learnworlds", app_user_id="lw-linked"
        )
    )
    await db.commit()
    lw.sso_login.return_value = (LOGIN_URL, "lw-linked")

    response = await client.get(SSO_PATH, follow_redirects=False)

    assert response.status_code == 302
    lw.get_user_by_email.assert_not_awaited()
    assert lw.sso_login.await_args.kwargs["user_id"] == "lw-linked"
    assert len(await _mappings(db)) == 1


@pytest.mark.asyncio
async def test_unknown_email_creates_and_links(client, db, lw, signed_in):
    """No match anywhere: LearnWorlds creates the account and we link it."""
    response = await client.get(SSO_PATH, follow_redirects=False)

    assert response.status_code == 302
    assert lw.sso_login.await_args.kwargs["user_id"] is None
    assert lw.sso_login.await_args.kwargs["email"] == USER_A.email

    rows = await _mappings(db)
    assert [r.app_user_id for r in rows] == ["lw-user-1"]


@pytest.mark.asyncio
async def test_unverified_email_is_not_adopted(client, db, lw, signed_in):
    """An unverified email must not hand over someone else's courses."""
    unverified = make_user("user-unverified", "a@test.org")
    unverified.email_verified = False
    signed_in["user"] = unverified
    lw.get_user_by_email.return_value = {"id": "lw-existing", "email": "a@test.org"}

    response = await client.get(SSO_PATH, follow_redirects=False)

    assert response.status_code == 302
    lw.get_user_by_email.assert_not_awaited()
    assert lw.sso_login.await_args.kwargs["user_id"] is None


@pytest.mark.asyncio
async def test_foreign_redirect_url_is_discarded(client, lw, signed_in):
    """RedirectUrl comes from the browser: anything off-school is dropped."""
    response = await client.get(
        SSO_PATH,
        params={"redirectUrl": "https://evil.example.com/steal"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert lw.sso_login.await_args.kwargs["redirect_url"] == SCHOOL


@pytest.mark.asyncio
async def test_sign_in_page_redirect_goes_home(client, lw, signed_in):
    """Coming from the LMS sign-in page, going back there shows "you are lost"."""
    response = await client.get(
        SSO_PATH,
        params={"redirectUrl": f"{SCHOOL}/signin"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert lw.sso_login.await_args.kwargs["redirect_url"] == SCHOOL


@pytest.mark.asyncio
async def test_unknown_action_is_rejected(client, lw, signed_in):
    """Only the three actions LearnWorlds sends are accepted."""
    response = await client.get(
        SSO_PATH, params={"action": "delete-everything"}, follow_redirects=False
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_missing_credentials_answer_503(client, signed_in):
    """Without credentials the endpoint says so instead of blowing up."""
    with patch.object(
        type(sso_route.learnworlds_client),
        "is_configured",
        property(lambda self: False),
    ):
        response = await client.get(SSO_PATH, follow_redirects=False)

    assert response.status_code == 503
