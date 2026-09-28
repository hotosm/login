"""Main FastAPI application for HOTOSM Login backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import CurrentUser, init_auth, osm_router

from app.__version__ import __version__
from app.api.routes import admin as admin_routes
from app.api.routes import allowed_origins as allowed_origins_routes
from app.api.routes import api_token as api_token_routes
from app.api.routes import data_deletion as data_deletion_routes
from app.api.routes import groups as groups_routes
from app.api.routes import invitations as invitations_routes
from app.api.routes import notifications as notifications_routes
from app.api.routes import organizations_admin as organizations_admin_routes
from app.api.routes import profile as profile_routes
from app.api.routes import public as public_routes
from app.api.routes import sso as sso_routes
from app.api.routes import users as users_routes
from app.core.cors import DynamicCORSMiddleware
from app.schemas.auth import UserInfoResponse
from app.services import allowed_origins_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI app."""
    # Startup
    print("Starting HOTOSM Login Service")
    yield
    # Shutdown
    print("Shutting down HOTOSM Login Service")


app = FastAPI(
    title="HOTOSM Login Service",
    description="Authentication and SSO service for HOTOSM applications",
    version=__version__,
    lifespan=lifespan,
)

# CORS configuration - allow credentials for cookie-based auth
app.add_middleware(
    # Reads its allowlist from the allowed_origins table (see
    # services/allowed_origins_service.py), so a site added in the admin
    # dashboard is accepted on the next request rather than the next deploy.
    # The list passed here is only the fallback for when the database cannot be
    # reached — everything else lives in the table.
    DynamicCORSMiddleware,
    allow_origins=sorted(allowed_origins_service.BOOTSTRAP_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Exception handler to ensure CORS headers on error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Add CORS headers to HTTP exceptions."""
    # Only echo an origin the middleware would also have accepted. Reflecting
    # any origin here used to make errors look CORS-clean while real (200)
    # responses were blocked by the browser, so curl reported a false pass.
    headers: dict[str, str] = {}
    origin = request.headers.get("origin")
    if origin and allowed_origins_service.is_allowed(origin):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail},
        headers=headers,
    )


# Initialize authentication
# AuthConfig.from_env() reads from environment variables automatically
auth_config = AuthConfig.from_env()


async def _local_pat_resolver(token_hash: str, app_name: str):
    """Resolve a PAT directly from the login DB (no HTTP call to self)."""
    from hotosm_auth.models import HankoUser
    from sqlalchemy import select

    from app.db.database import async_session_maker
    from app.db.models import UserApiToken, UserProfile

    async with async_session_maker() as session:
        result = await session.execute(
            select(UserApiToken).where(
                UserApiToken.token_hash == token_hash,
                UserApiToken.app == app_name,
            )
        )
        token_row = result.scalar_one_or_none()
        if not token_row:
            return None

        from sqlalchemy import func

        token_row.last_used_at = func.now()
        await session.commit()

        profile_result = await session.execute(
            select(UserProfile).where(
                UserProfile.hanko_user_id == token_row.hanko_user_id
            )
        )
        profile = profile_result.scalar_one_or_none()
        if not profile:
            return None

        return HankoUser(
            id=profile.hanko_user_id,
            email="",
            email_verified=True,
            created_at=profile.created_at,
            updated_at=profile.updated_at or profile.created_at,
        )


init_auth(auth_config, app_name="portal", pat_resolver=_local_pat_resolver)

# Include OSM OAuth routes
api_v1_prefix = "/api"
app.include_router(
    osm_router,
    prefix=api_v1_prefix,
    tags=["auth"],
)

app.include_router(admin_routes.router)
app.include_router(allowed_origins_routes.router)
app.include_router(profile_routes.router)
app.include_router(api_token_routes.router)
app.include_router(api_token_routes.internal_router)
app.include_router(data_deletion_routes.router)
app.include_router(groups_routes.router)
app.include_router(invitations_routes.router)
app.include_router(invitations_routes.me_router)
app.include_router(notifications_routes.me_router)
app.include_router(organizations_admin_routes.router)
app.include_router(organizations_admin_routes.me_router)
app.include_router(public_routes.router)
app.include_router(sso_routes.router)
app.include_router(users_routes.router)


@app.get("/me", response_model=UserInfoResponse)
async def get_current_user(user: CurrentUser) -> UserInfoResponse:
    """Get current authenticated user information.

    Validates Hanko JWT from cookie or Authorization header.

    **Authentication**: Requires valid Hanko session (JWT in cookie or Bearer token)

    **Returns**:
    - 200: User information
    - 401: Not authenticated
    """
    return UserInfoResponse(
        message="You are logged in",
        user_id=user.id,
        email=user.email,
        username=user.username,
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "login"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "HOTOSM Login Service",
        "version": __version__,
        "docs": "/docs",
    }
