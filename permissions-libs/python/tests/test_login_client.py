"""Tests for LoginClient with httpx.MockTransport."""

import asyncio
import json

import httpx
import pytest

from hotosm_permissions import (
    LoginClient,
    LoginGroup,
    LoginUnavailable,
    LoginUser,
    PublicGroup,
    PublicGroupPage,
)

BASE_URL = "https://login.test"

GROUPS_PAYLOAD = {
    "groups": [
        {
            "id": "t1",
            "type": "team",
            "slug": "team-one",
            "name": "Team One",
            "role": "manager",
            "status": "approved",
            "avatar_url": "https://img.test/t1.png",
        },
        {
            "id": "o1",
            "type": "organization",
            "slug": "org-one",
            "name": "Org One",
            "role": "member",
        },
    ]
}

EXPECTED_GROUPS = [
    LoginGroup(
        id="t1",
        type="team",
        slug="team-one",
        name="Team One",
        role="manager",
        status="approved",
        avatar_url="https://img.test/t1.png",
    ),
    LoginGroup(
        id="o1",
        type="organization",
        slug="org-one",
        name="Org One",
        role="member",
        status=None,
        avatar_url=None,
    ),
]


def ok(payload) -> httpx.Response:
    return httpx.Response(200, json=payload)


async def wait_for_calls(login_mock, n: int) -> None:
    """Yield to the loop until the mock has received `n` requests."""
    for _ in range(200):
        if login_mock.calls >= n:
            return
        await asyncio.sleep(0)
    raise AssertionError(f"expected {n} calls, got {login_mock.calls}")


def gated(gate: asyncio.Event, payload=GROUPS_PAYLOAD):
    """A handler that answers only after `gate` is set."""

    async def handler(request: httpx.Request) -> httpx.Response:
        await gate.wait()
        return ok(payload)

    return handler


@pytest.fixture
def client() -> LoginClient:
    return LoginClient(f"{BASE_URL}/", groups_ttl=60.0)


class TestGetUserGroups:
    async def test_parses_payload(self, client, login_mock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        groups = await client.get_user_groups("u1", "tok")
        assert groups == EXPECTED_GROUPS
        request = login_mock.requests[0]
        assert request.method == "GET"
        assert str(request.url) == f"{BASE_URL}/api/groups"
        assert request.headers["accept"] == "application/json"

    async def test_empty_groups(self, client, login_mock):
        login_mock.handler = lambda r: ok({"groups": []})
        assert await client.get_user_groups("u1", "tok") == []

    async def test_forwards_hanko_cookie(self, client, login_mock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok-123")
        assert login_mock.requests[0].headers["cookie"] == "hanko=tok-123"

    async def test_no_cookie_when_none(self, client, login_mock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", None)
        assert "cookie" not in login_mock.requests[0].headers


class TestGroupsCache:
    async def test_cached_within_ttl(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        first = await client.get_user_groups("u1", "tok")
        clock.now += 59.9
        second = await client.get_user_groups("u1", "tok")
        assert first == second == EXPECTED_GROUPS
        assert login_mock.calls == 1

    async def test_cache_is_per_user(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        await client.get_user_groups("u2", "tok")
        await client.get_user_groups("u1", "tok")
        await client.get_user_groups("u2", "tok")
        assert login_mock.calls == 2

    async def test_expired_entry_refetches(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        clock.now += 60.0
        login_mock.handler = lambda r: ok({"groups": []})
        assert await client.get_user_groups("u1", "tok") == []
        assert login_mock.calls == 2
        # The refetched value is cached again.
        await client.get_user_groups("u1", "tok")
        assert login_mock.calls == 2

    async def test_custom_ttl(self, login_mock, clock):
        client = LoginClient(BASE_URL, groups_ttl=5.0)
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        clock.now += 4.9
        await client.get_user_groups("u1", "tok")
        clock.now += 0.1
        await client.get_user_groups("u1", "tok")
        assert login_mock.calls == 2

    async def test_force_refresh_skips_cache(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        login_mock.handler = lambda r: ok({"groups": []})
        assert await client.get_user_groups("u1", "tok", force_refresh=True) == []
        assert login_mock.calls == 2
        # The forced result replaces the cached one.
        assert await client.get_user_groups("u1", "tok") == []
        assert login_mock.calls == 2

    async def test_force_refresh_skips_inflight(self, client, login_mock, clock):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        first = asyncio.create_task(client.get_user_groups("u1", "tok"))
        await wait_for_calls(login_mock, 1)
        forced = asyncio.create_task(
            client.get_user_groups("u1", "tok", force_refresh=True)
        )
        await wait_for_calls(login_mock, 2)
        gate.set()
        await asyncio.gather(first, forced)
        assert login_mock.calls == 2

    async def test_invalidate_drops_cache(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        client.invalidate("u1")
        await client.get_user_groups("u1", "tok")
        assert login_mock.calls == 2

    async def test_invalidate_only_that_user(self, client, login_mock, clock):
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        await client.get_user_groups("u1", "tok")
        await client.get_user_groups("u2", "tok")
        client.invalidate("u1")
        await client.get_user_groups("u2", "tok")
        assert login_mock.calls == 2

    async def test_invalidate_unknown_user_is_noop(self, client):
        client.invalidate("nobody")


class TestGroupsErrors:
    @pytest.mark.parametrize("status", [401, 403])
    async def test_rejected_session_returns_empty_not_cached(
        self, client, login_mock, clock, status
    ):
        login_mock.handler = lambda r: httpx.Response(status)
        assert await client.get_user_groups("u1", "tok") == []
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS
        assert login_mock.calls == 2

    @pytest.mark.parametrize("status", [400, 404, 500, 502, 503])
    async def test_http_error_raises_not_cached(
        self, client, login_mock, clock, status
    ):
        login_mock.handler = lambda r: httpx.Response(status)
        with pytest.raises(LoginUnavailable):
            await client.get_user_groups("u1", "tok")
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS
        assert login_mock.calls == 2

    @pytest.mark.parametrize(
        "exc", [httpx.ConnectError, httpx.ReadTimeout, httpx.RemoteProtocolError]
    )
    async def test_network_error_raises_not_cached(
        self, client, login_mock, clock, exc
    ):
        def fail(request):
            raise exc("boom", request=request)

        login_mock.handler = fail
        with pytest.raises(LoginUnavailable):
            await client.get_user_groups("u1", "tok")
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS

    @pytest.mark.parametrize(
        "response",
        [
            httpx.Response(200, text="not json"),
            httpx.Response(200, json={"nope": []}),
            httpx.Response(200, json={"groups": None}),
            httpx.Response(200, json={"groups": [{"id": "t1"}]}),
            httpx.Response(200, json=["groups"]),
            httpx.Response(200, json={"groups": ["t1"]}),
        ],
    )
    async def test_malformed_payload_raises_not_cached(
        self, client, login_mock, clock, response
    ):
        login_mock.handler = lambda r: response
        with pytest.raises(LoginUnavailable):
            await client.get_user_groups("u1", "tok")
        login_mock.handler = lambda r: ok(GROUPS_PAYLOAD)
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS

    async def test_error_shared_by_concurrent_callers(self, client, login_mock):
        gate = asyncio.Event()

        async def handler(request):
            await gate.wait()
            return httpx.Response(500)

        login_mock.handler = handler
        callers = [
            asyncio.create_task(client.get_user_groups("u1", "tok")) for _ in range(3)
        ]
        await wait_for_calls(login_mock, 1)
        gate.set()
        results = await asyncio.gather(*callers, return_exceptions=True)
        assert all(isinstance(r, LoginUnavailable) for r in results)
        assert login_mock.calls == 1


class TestGroupsConcurrency:
    async def test_concurrent_calls_share_one_request(self, client, login_mock):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        callers = [
            asyncio.create_task(client.get_user_groups("u1", "tok")) for _ in range(5)
        ]
        await wait_for_calls(login_mock, 1)
        gate.set()
        results = await asyncio.gather(*callers)
        assert all(r == EXPECTED_GROUPS for r in results)
        assert login_mock.calls == 1

    async def test_different_users_do_not_share(self, client, login_mock):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        callers = [
            asyncio.create_task(client.get_user_groups(uid, "tok"))
            for uid in ("u1", "u2")
        ]
        await wait_for_calls(login_mock, 2)
        gate.set()
        await asyncio.gather(*callers)
        assert login_mock.calls == 2

    async def test_cancelling_one_caller_does_not_cancel_others(
        self, client, login_mock, clock
    ):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        cancelled = asyncio.create_task(client.get_user_groups("u1", "tok"))
        survivor = asyncio.create_task(client.get_user_groups("u1", "tok"))
        await wait_for_calls(login_mock, 1)
        cancelled.cancel()
        with pytest.raises(asyncio.CancelledError):
            await cancelled
        gate.set()
        assert await survivor == EXPECTED_GROUPS
        # The shared fetch completed and was cached.
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS
        assert login_mock.calls == 1

    async def test_cancelling_only_caller_still_caches(self, client, login_mock, clock):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        caller = asyncio.create_task(client.get_user_groups("u1", "tok"))
        await wait_for_calls(login_mock, 1)
        caller.cancel()
        with pytest.raises(asyncio.CancelledError):
            await caller
        gate.set()
        # A new caller joins the still-running fetch.
        assert await client.get_user_groups("u1", "tok") == EXPECTED_GROUPS
        assert login_mock.calls == 1

    async def test_invalidate_during_fetch_is_not_cached(
        self, client, login_mock, clock
    ):
        gate = asyncio.Event()
        login_mock.handler = gated(gate)
        caller = asyncio.create_task(client.get_user_groups("u1", "tok"))
        await wait_for_calls(login_mock, 1)
        client.invalidate("u1")
        gate.set()
        # The caller still gets the result of its fetch...
        assert await caller == EXPECTED_GROUPS
        # ...but it wasn't cached, so the next call refetches.
        login_mock.handler = lambda r: ok({"groups": []})
        assert await client.get_user_groups("u1", "tok") == []
        assert login_mock.calls == 2

    async def test_call_after_invalidate_does_not_join_stale_fetch(
        self, client, login_mock, clock
    ):
        stale_gate = asyncio.Event()
        login_mock.handler = gated(stale_gate)
        stale = asyncio.create_task(client.get_user_groups("u1", "tok"))
        await wait_for_calls(login_mock, 1)
        client.invalidate("u1")
        login_mock.handler = lambda r: ok({"groups": []})
        fresh = await client.get_user_groups("u1", "tok")
        assert fresh == []
        assert login_mock.calls == 2
        stale_gate.set()
        assert await stale == EXPECTED_GROUPS
        # The stale fetch finishing later doesn't overwrite the fresh cache.
        assert await client.get_user_groups("u1", "tok") == []
        assert login_mock.calls == 2


class TestLookupUserByEmail:
    async def test_found(self, client, login_mock):
        login_mock.handler = lambda r: ok(
            {"exists": True, "hanko_user_id": "h1", "name": "Ana"}
        )
        user = await client.lookup_user_by_email("ana@example.org", "tok")
        assert user == LoginUser(id="h1", name="Ana")
        request = login_mock.requests[0]
        assert request.url.path == "/api/users/lookup"
        assert request.url.params["email"] == "ana@example.org"
        assert request.headers["cookie"] == "hanko=tok"
        assert request.headers["accept"] == "application/json"

    async def test_found_without_name(self, client, login_mock):
        login_mock.handler = lambda r: ok(
            {"exists": True, "hanko_user_id": "h1", "name": ""}
        )
        assert await client.lookup_user_by_email("a@b.co", None) == LoginUser(
            id="h1", name=None
        )
        assert "cookie" not in login_mock.requests[0].headers

    async def test_email_is_url_encoded(self, client, login_mock):
        login_mock.handler = lambda r: ok({"exists": False})
        await client.lookup_user_by_email("a+b@c.co", "tok")
        assert login_mock.requests[0].url.params["email"] == "a+b@c.co"

    async def test_not_exists(self, client, login_mock):
        login_mock.handler = lambda r: ok({"exists": False})
        assert await client.lookup_user_by_email("a@b.co", "tok") is None

    @pytest.mark.parametrize(
        "payload",
        [
            {"exists": True},
            {"exists": True, "hanko_user_id": None},
            {"exists": True, "hanko_user_id": ""},
        ],
    )
    async def test_missing_hanko_user_id(self, client, login_mock, payload):
        login_mock.handler = lambda r: ok(payload)
        assert await client.lookup_user_by_email("a@b.co", "tok") is None

    @pytest.mark.parametrize("status", [401, 403, 404, 500, 503])
    async def test_http_error(self, client, login_mock, status):
        login_mock.handler = lambda r: httpx.Response(status)
        with pytest.raises(LoginUnavailable):
            await client.lookup_user_by_email("a@b.co", "tok")

    async def test_network_error(self, client, login_mock):
        def fail(request):
            raise httpx.ConnectError("boom", request=request)

        login_mock.handler = fail
        with pytest.raises(LoginUnavailable):
            await client.lookup_user_by_email("a@b.co", "tok")

    @pytest.mark.parametrize(
        "response",
        [
            httpx.Response(200, text="not json"),
            httpx.Response(200, json={}),
            httpx.Response(200, json=[]),
        ],
    )
    async def test_malformed_payload(self, client, login_mock, response):
        login_mock.handler = lambda r: response
        with pytest.raises(LoginUnavailable):
            await client.lookup_user_by_email("a@b.co", "tok")

    async def test_not_cached(self, client, login_mock):
        login_mock.handler = lambda r: ok({"exists": False})
        await client.lookup_user_by_email("a@b.co", "tok")
        await client.lookup_user_by_email("a@b.co", "tok")
        assert login_mock.calls == 2


PUBLIC_PAYLOAD = {
    "items": [
        {
            "id": "t1",
            "type": "team",
            "slug": "team-one",
            "name": "Team One",
            "avatar_url": "https://img.test/t1.png",
        },
        {"id": "o1", "type": "organization", "slug": "org-one", "name": "Org One"},
    ],
    "total": 12,
    "page": 2,
    "page_size": 2,
}


class TestListPublicGroups:
    async def test_parses_payload(self, client, login_mock):
        login_mock.handler = lambda r: ok(PUBLIC_PAYLOAD)
        page = await client.list_public_groups(page=2, page_size=2)
        assert page == PublicGroupPage(
            items=[
                PublicGroup(
                    "t1", "team", "team-one", "Team One", "https://img.test/t1.png"
                ),
                PublicGroup("o1", "organization", "org-one", "Org One", None),
            ],
            total=12,
            page=2,
            page_size=2,
        )

    async def test_default_params(self, client, login_mock):
        login_mock.handler = lambda r: ok(PUBLIC_PAYLOAD)
        await client.list_public_groups()
        request = login_mock.requests[0]
        assert request.url.path == "/api/public/groups"
        assert dict(request.url.params) == {"page": "1", "page_size": "20"}
        assert "cookie" not in request.headers
        assert request.headers["accept"] == "application/json"

    async def test_all_params(self, client, login_mock):
        login_mock.handler = lambda r: ok(PUBLIC_PAYLOAD)
        await client.list_public_groups(
            type="organization", q="red cross", page=3, page_size=50, ids=["a", "b"]
        )
        params = login_mock.requests[0].url.params
        assert params["type"] == "organization"
        assert params["q"] == "red cross"
        assert params["page"] == "3"
        assert params["page_size"] == "50"
        assert params.get_list("ids") == ["a", "b"]

    async def test_ids_accepts_any_sequence(self, client, login_mock):
        login_mock.handler = lambda r: ok(PUBLIC_PAYLOAD)
        await client.list_public_groups(ids=("x",))
        assert login_mock.requests[0].url.params.get_list("ids") == ["x"]

    async def test_empty_ids_skips_login(self, client, login_mock):
        page = await client.list_public_groups(ids=[], page=4, page_size=10)
        assert page == PublicGroupPage(items=[], total=0, page=4, page_size=10)
        assert login_mock.calls == 0

    @pytest.mark.parametrize("status", [400, 401, 404, 500, 503])
    async def test_http_error(self, client, login_mock, status):
        login_mock.handler = lambda r: httpx.Response(status)
        with pytest.raises(LoginUnavailable):
            await client.list_public_groups()

    async def test_network_error(self, client, login_mock):
        def fail(request):
            raise httpx.ReadTimeout("slow", request=request)

        login_mock.handler = fail
        with pytest.raises(LoginUnavailable):
            await client.list_public_groups()

    @pytest.mark.parametrize(
        "body",
        [
            "not json",
            json.dumps({"items": []}),
            json.dumps({"items": None, "total": 0, "page": 1, "page_size": 20}),
            json.dumps(
                {"items": [{"id": "t1"}], "total": 1, "page": 1, "page_size": 20}
            ),
        ],
    )
    async def test_malformed_payload(self, client, login_mock, body):
        login_mock.handler = lambda r: httpx.Response(200, text=body)
        with pytest.raises(LoginUnavailable):
            await client.list_public_groups()
