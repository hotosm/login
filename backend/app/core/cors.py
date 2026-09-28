"""CORS middleware that reads its allowlist from the database."""

from starlette.middleware.cors import CORSMiddleware
from starlette.types import Receive, Scope, Send

from app.services import allowed_origins_service


class DynamicCORSMiddleware(CORSMiddleware):
    """Starlette's CORS middleware, with the allowlist loaded at runtime.

    Only the origin decision is replaced. Everything else — preflight handling,
    which headers are echoed, how a rejected origin is answered — stays with
    Starlette, which is the part worth not reimplementing.

    ``allow_origins`` passed at construction still applies, so any origin that
    must work regardless of the database can be listed there.
    """

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """Refresh the allowlist if it is stale, then delegate to Starlette.

        The refresh happens here because it needs to await the database, while
        ``is_allowed_origin`` below is synchronous and cannot.
        """
        if scope["type"] == "http":
            await allowed_origins_service.refresh_if_stale()
        await super().__call__(scope, receive, send)

    def is_allowed_origin(self, origin: str) -> bool:
        """Allow an origin from the database, or from the static list."""
        return allowed_origins_service.is_allowed(origin) or super().is_allowed_origin(
            origin
        )
