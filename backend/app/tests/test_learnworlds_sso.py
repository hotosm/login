"""Tests for the LearnWorlds Custom SSO endpoint.

The LearnWorlds API is stubbed: these check how we resolve which account a
person owns, not that their API works.
"""

from unittest.mock import AsyncMock, patch
from urllib.parse import parse_qs, quote, urlparse

import pytest
from hotosm_auth_fastapi import get_current_user_optional
from sqlalchemy import select

from app.api.routes import sso as sso_route
from app.db.models import HankoUserMapping, UserProfile
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
async def test_no_match_asks_before_creating(client, db, lw, signed_in):
    """Nothing matched: ask, instead of quietly making a second account."""
    response = await client.get(SSO_PATH, follow_redirects=False)

    assert response.status_code == 302
    assert "/app/link/learnworlds" in response.headers["location"]

    # Nothing was created: the person can still claim their old account.
    lw.sso_login.assert_not_awaited()
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_i_am_new_creates_and_links(client, db, lw, signed_in):
    """The "I'm new" button comes back here and goes ahead."""
    response = await client.get(SSO_PATH, params={"new": "1"}, follow_redirects=False)

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
    assert "/app/link/learnworlds" in response.headers["location"]


@pytest.mark.asyncio
async def test_foreign_redirect_url_is_discarded(client, lw, signed_in):
    """RedirectUrl comes from the browser: anything off-school is dropped."""
    response = await client.get(
        SSO_PATH,
        params={"redirectUrl": "https://evil.example.com/steal", "new": "1"},
        follow_redirects=False,
    )

    assert response.status_code == 302
    assert lw.sso_login.await_args.kwargs["redirect_url"] == SCHOOL


@pytest.mark.asyncio
async def test_profile_name_and_avatar_are_sent(client, db, lw, signed_in):
    """A created account gets the real name, not the email local part."""
    db.add(
        UserProfile(
            hanko_user_id=USER_A.id,
            first_name="Ada",
            last_name="Lovelace",
            picture_url="https://example.org/ada.png",
        )
    )
    await db.commit()

    await client.get(SSO_PATH, params={"new": "1"}, follow_redirects=False)

    sent = lw.sso_login.await_args.kwargs
    assert sent["username"] == "Ada Lovelace"
    assert sent["first_name"] == "Ada"
    assert sent["last_name"] == "Lovelace"
    assert sent["avatar"] == "https://example.org/ada.png"


@pytest.mark.asyncio
async def test_without_profile_falls_back_to_display_name(client, lw, signed_in):
    """No profile row: fall back rather than sending an empty name."""
    await client.get(SSO_PATH, params={"new": "1"}, follow_redirects=False)

    sent = lw.sso_login.await_args.kwargs
    assert sent["username"] == USER_A.display_name
    assert "first_name" not in sent


@pytest.mark.asyncio
async def test_sign_in_page_redirect_goes_home(client, lw, signed_in):
    """Coming from the LMS sign-in page, going back there shows "you are lost"."""
    response = await client.get(
        SSO_PATH,
        params={"redirectUrl": f"{SCHOOL}/signin", "new": "1"},
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


# --- linking screen -------------------------------------------------------
#
# The browser adds and verifies the address through Hanko's own flow; these
# cover what happens afterwards, when the screen asks us to link.

LINK_PATH = "/api/sso/learnworlds/link"


@pytest.fixture
def verified():
    """Control which addresses Hanko considers verified for the user."""
    with patch.object(
        sso_route.hanko_lookup, "verified_emails", new=AsyncMock(return_value=[])
    ) as mock:
        yield mock


@pytest.mark.asyncio
async def test_link_adopts_the_account_behind_a_verified_email(
    client, db, lw, signed_in, verified
):
    """The whole point: recover the courses sitting under another address."""
    verified.return_value = [USER_A.email, "old@work.org"]
    lw.get_user_by_email.return_value = {"id": "lw-old", "email": "old@work.org"}
    lw.count_courses = AsyncMock(return_value=4)

    response = await client.post(LINK_PATH, json={"email": "old@work.org"})

    assert response.status_code == 200
    assert response.json() == {"linked": True, "courses": 4}
    assert [r.app_user_id for r in await _mappings(db)] == ["lw-old"]


@pytest.mark.asyncio
async def test_link_refuses_an_address_the_person_has_not_verified(
    client, db, lw, signed_in, verified
):
    """Otherwise anyone could claim someone else's courses by typing their email."""
    verified.return_value = [USER_A.email]
    lw.get_user_by_email.return_value = {"id": "lw-someone-else"}

    response = await client.post(LINK_PATH, json={"email": "victim@example.org"})

    assert response.status_code == 403
    lw.get_user_by_email.assert_not_awaited()
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_link_reports_when_the_address_has_no_courses(
    client, db, lw, signed_in, verified
):
    """Verified, but nothing there: say so instead of linking nothing."""
    verified.return_value = ["spare@example.org"]

    response = await client.post(LINK_PATH, json={"email": "spare@example.org"})

    assert response.status_code == 404
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_link_refuses_when_already_linked(client, db, lw, signed_in, verified):
    """A second link would silently move someone to a different account."""
    db.add(
        HankoUserMapping(
            hanko_user_id=USER_A.id, app_name="learnworlds", app_user_id="lw-linked"
        )
    )
    await db.commit()
    verified.return_value = ["other@example.org"]

    response = await client.post(LINK_PATH, json={"email": "other@example.org"})

    assert response.status_code == 409
    assert [r.app_user_id for r in await _mappings(db)] == ["lw-linked"]


@pytest.mark.asyncio
async def test_link_survives_a_failing_course_count(
    client, db, lw, signed_in, verified
):
    """The link is what matters; the count is only there to reassure."""
    verified.return_value = ["old@work.org"]
    lw.get_user_by_email.return_value = {"id": "lw-old"}
    lw.count_courses = AsyncMock(side_effect=sso_route.LearnWorldsError("boom"))

    response = await client.post(LINK_PATH, json={"email": "old@work.org"})

    assert response.status_code == 200
    assert response.json() == {"linked": True, "courses": None}
    assert [r.app_user_id for r in await _mappings(db)] == ["lw-old"]


@pytest.mark.asyncio
async def test_status_lists_the_addresses_to_try(client, lw, signed_in, verified):
    """The screen shows which address came up empty."""
    verified.return_value = [USER_A.email]

    response = await client.get("/api/sso/learnworlds/status")

    assert response.status_code == 200
    assert response.json() == {
        "linked": False,
        "emails": [USER_A.email],
        "linkedin": sso_route.linkedin_client.is_configured,
    }


@pytest.mark.asyncio
async def test_existing_account_keeps_its_own_profile(client, db, lw, signed_in):
    """Adopting an account must not overwrite the name it already has."""
    db.add(UserProfile(hanko_user_id=USER_A.id, first_name="Ada", last_name="Lovelace"))
    await db.commit()
    lw.get_user_by_email.return_value = {"id": "lw-existing", "email": USER_A.email}

    await client.get(SSO_PATH, follow_redirects=False)

    sent = lw.sso_login.await_args.kwargs
    assert sent["user_id"] == "lw-existing"
    assert "username" not in sent
    assert "first_name" not in sent
    assert "avatar" not in sent


# --- mapping for other services -------------------------------------------
#
# Portal asks login which LearnWorlds account belongs to a person, then talks
# to LearnWorlds itself. Public profiles show data about whoever is being
# looked at, so this answers for any user, not only the caller.

MAPPING_PATH = "/api/internal/mappings/learnworlds"
KEY = {"X-Internal-Key": "test-internal-key"}


@pytest.fixture
def internal_key():
    """Configure the shared secret these endpoints check."""
    with patch.object(
        sso_route.settings, "login_internal_api_key", "test-internal-key"
    ):
        yield


@pytest.mark.asyncio
async def test_mapping_is_resolved_for_any_user(client, db, internal_key):
    """Someone else's mapping, which is the public-profile case."""
    db.add(
        HankoUserMapping(
            hanko_user_id="someone-else", app_name="learnworlds", app_user_id="lw-42"
        )
    )
    await db.commit()

    response = await client.get(f"{MAPPING_PATH}/someone-else", headers=KEY)

    assert response.status_code == 200
    assert response.json() == {
        "hanko_user_id": "someone-else",
        "app_name": "learnworlds",
        "app_user_id": "lw-42",
    }


@pytest.mark.asyncio
async def test_mapping_is_null_when_there_is_none(client, internal_key):
    """Never used the LMS: say so plainly instead of 404ing."""
    response = await client.get(f"{MAPPING_PATH}/nobody", headers=KEY)

    assert response.status_code == 200
    assert response.json()["app_user_id"] is None


@pytest.mark.asyncio
async def test_mapping_needs_the_internal_key(client, db, internal_key):
    """Without the shared secret this would hand out account ids to anyone."""
    response = await client.get(
        f"{MAPPING_PATH}/someone-else", headers={"X-Internal-Key": "wrong"}
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_mapping_without_the_header_is_unauthorised(client, internal_key):
    """A missing header is not a malformed request, it is a refused one."""
    response = await client.get(f"{MAPPING_PATH}/someone-else")

    assert response.status_code == 401


# --- LinkedIn lookup -------------------------------------------------------
#
# LinkedIn is stubbed too: these check what we do with the address it gives.

LINKEDIN_PATH = "/api/sso/learnworlds/linkedin"
STATE = "state-123"


@pytest.fixture
def linkedin():
    """Stub the LinkedIn client as configured, returning a verified address."""
    with (
        patch.object(
            type(sso_route.linkedin_client),
            "is_configured",
            property(lambda self: True),
        ),
        patch.object(
            sso_route.linkedin_client,
            "verified_email",
            new=AsyncMock(return_value="old@linkedin.org"),
        ),
    ):
        yield sso_route.linkedin_client


async def _callback(client, state=STATE, cookie=STATE, **params):
    client.cookies.set(
        "lw_linkedin_state",
        f"{cookie}|{quote(f'{SCHOOL}/course/x', safe='')}",
        path=LINKEDIN_PATH,
    )
    query = {"code": "the-code", "state": state, **params}
    return await client.get(f"{LINKEDIN_PATH}/callback", params=query)


def _outcome(response) -> dict[str, list[str]]:
    assert response.status_code == 302
    location = urlparse(response.headers["location"])
    assert location.path == "/app/link/learnworlds"
    return parse_qs(location.query)


@pytest.mark.asyncio
async def test_linkedin_start_redirects_with_state_cookie(client, lw, linkedin):
    response = await client.get(
        LINKEDIN_PATH, params={"redirectUrl": f"{SCHOOL}/course/x"}
    )

    assert response.status_code == 302
    location = urlparse(response.headers["location"])
    assert location.netloc == "www.linkedin.com"
    query = parse_qs(location.query)
    assert query["scope"] == ["openid email"]
    assert query["redirect_uri"][0].endswith(f"{LINKEDIN_PATH}/callback")
    cookie = response.cookies["lw_linkedin_state"]
    assert cookie.startswith(query["state"][0] + "|")
    assert '"' not in cookie


@pytest.mark.asyncio
async def test_linkedin_round_trip_uses_the_cookie_it_set(client, db, lw, linkedin):
    """The state and destination survive the trip through LinkedIn."""
    lw.get_user_by_email.return_value = {"id": "lw-linkedin"}
    lw.count_courses = AsyncMock(return_value=1)

    start = await client.get(LINKEDIN_PATH, params={"redirectUrl": f"{SCHOOL}/c/1"})
    state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
    response = await client.get(
        f"{LINKEDIN_PATH}/callback", params={"code": "the-code", "state": state}
    )

    query = _outcome(response)
    assert query["linkedin"] == ["linked"]
    assert query["redirectUrl"] == [f"{SCHOOL}/c/1"]
    assert [r.app_user_id for r in await _mappings(db)] == ["lw-linkedin"]


@pytest.mark.asyncio
async def test_linkedin_start_needs_configuration(client, lw):
    with patch.object(
        type(sso_route.linkedin_client),
        "is_configured",
        property(lambda self: False),
    ):
        response = await client.get(LINKEDIN_PATH)

    assert response.status_code == 503


@pytest.mark.asyncio
async def test_linkedin_address_in_the_school_is_linked(client, db, lw, linkedin):
    """The whole point: courses under the LinkedIn address come back."""
    lw.get_user_by_email.return_value = {"id": "lw-linkedin"}
    lw.count_courses = AsyncMock(return_value=3)

    query = _outcome(await _callback(client))

    assert query["linkedin"] == ["linked"]
    assert query["courses"] == ["3"]
    assert query["redirectUrl"] == [f"{SCHOOL}/course/x"]
    lw.get_user_by_email.assert_awaited_once_with("old@linkedin.org")
    assert [r.app_user_id for r in await _mappings(db)] == ["lw-linkedin"]


@pytest.mark.asyncio
async def test_linkedin_address_not_in_the_school(client, db, lw, linkedin):
    query = _outcome(await _callback(client))

    assert query["linkedin"] == ["not_found"]
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_linkedin_unverified_address_is_not_looked_up(client, db, lw, linkedin):
    """LinkedIn not vouching for the address proves nothing about its courses."""
    linkedin.verified_email.return_value = None

    query = _outcome(await _callback(client))

    assert query["linkedin"] == ["unverified"]
    lw.get_user_by_email.assert_not_awaited()
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_linkedin_foreign_state_is_refused(client, db, lw, linkedin):
    """A callback URL from someone else's browser must not link their LinkedIn."""
    lw.get_user_by_email.return_value = {"id": "lw-attacker"}

    query = _outcome(await _callback(client, state="forged"))

    assert query["linkedin"] == ["failed"]
    linkedin.verified_email.assert_not_awaited()
    assert await _mappings(db) == []


@pytest.mark.asyncio
async def test_linkedin_cancel_goes_back_to_the_screen(client, lw, linkedin):
    response = await client.get(
        f"{LINKEDIN_PATH}/callback",
        params={"error": "user_cancelled_login", "state": STATE},
    )

    assert _outcome(response)["linkedin"] == ["cancelled"]
    linkedin.verified_email.assert_not_awaited()


@pytest.mark.asyncio
async def test_linkedin_failure_is_reported_not_raised(client, db, lw, linkedin):
    linkedin.verified_email.side_effect = sso_route.LinkedInError("boom")

    query = _outcome(await _callback(client))

    assert query["linkedin"] == ["failed"]
    assert await _mappings(db) == []
