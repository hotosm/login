"""Shared pytest fixtures for hotosm-permissions tests."""

from collections.abc import Callable
from dataclasses import dataclass, field

import httpx
import pytest

from hotosm_permissions import Permission, ToolCatalog, ToolRoles
from hotosm_permissions import login_client as login_client_module


def make_catalog() -> ToolCatalog:
    """A small catalog with every role and one permission per role."""
    return ToolCatalog(
        tool="demo",
        available_roles=("viewer", "contributor", "editor", "owner"),
        permissions=(
            Permission("demo:items.view", "View an item"),
            Permission("demo:items.comment", "Comment on an item"),
            Permission("demo:items.edit", "Edit an item"),
            Permission("demo:items.share", "Share an item"),
        ),
        role_permissions={
            "viewer": ("demo:items.view",),
            "contributor": ("demo:items.comment",),
            "editor": ("demo:items.edit",),
            "owner": ("demo:items.share",),
        },
    )


@pytest.fixture
def catalog() -> ToolCatalog:
    return make_catalog()


@pytest.fixture
def tool_roles(catalog: ToolCatalog) -> ToolRoles:
    return ToolRoles(catalog)


Handler = Callable[[httpx.Request], httpx.Response]


@dataclass
class LoginMock:
    """Routes the Login client's requests to a test handler and records them."""

    handler: Handler | None = None
    requests: list[httpx.Request] = field(default_factory=list)

    @property
    def calls(self) -> int:
        return len(self.requests)

    def transport(self) -> httpx.MockTransport:
        async def handle(request: httpx.Request) -> httpx.Response:
            self.requests.append(request)
            assert self.handler is not None, "LoginMock.handler not set"
            result = self.handler(request)
            if hasattr(result, "__await__"):
                result = await result
            return result

        return httpx.MockTransport(handle)


@pytest.fixture
def login_mock(monkeypatch: pytest.MonkeyPatch) -> LoginMock:
    """Patch `httpx.AsyncClient` in `login_client` to use a MockTransport."""
    mock = LoginMock()
    real_async_client = httpx.AsyncClient

    def factory(*args, **kwargs) -> httpx.AsyncClient:
        return real_async_client(*args, transport=mock.transport(), **kwargs)

    monkeypatch.setattr(login_client_module.httpx, "AsyncClient", factory)
    return mock


class FakeClock:
    """A controllable stand-in for the `time` module used by the client."""

    def __init__(self, now: float = 1000.0) -> None:
        self.now = now

    def monotonic(self) -> float:
        return self.now


@pytest.fixture
def clock(monkeypatch: pytest.MonkeyPatch) -> FakeClock:
    """Replace `login_client.time` only, so asyncio's own clock is untouched."""
    fake = FakeClock()
    monkeypatch.setattr(login_client_module, "time", fake)
    return fake
