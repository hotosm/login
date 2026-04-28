"""Main FastAPI application for HOTOSM Login backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import CurrentUser, init_auth, osm_router

from app.__version__ import __version__
from app.api.routes import admin as admin_routes
from app.api.routes import api_token as api_token_routes
from app.api.routes import profile as profile_routes
from app.schemas.auth import UserInfoResponse


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
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3040",
        "http://127.0.0.1:3040",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        # Subdomain routing for development (HTTPS)
        "https://portal.hotosm.test",
        "https://login.hotosm.test",
        "https://dronetm.hotosm.test",
        "https://fair.hotosm.test",
        "https://openaerialmap.hotosm.test",
        "https://chatmap.hotosm.test",
        "https://umap.hotosm.test",
        "https://export-tool.hotosm.test",
        # Production domains
        "https://portal.hotosm.org",
        "https://dev.portal.hotosm.org",
        "https://dev.login.hotosm.org",
        "https://login.hotosm.org",
        "https://chatmap.hotosm.org",
        "https://chatmap-dev.hotosm.org",
        "https://fair.hotosm.org",
        "https://fair-dev.hotosm.org",
        "https://umap.hotosm.org",
        "https://umap-dev.hotosm.org",
        "https://field.hotosm.org",
        # Test environments
        "https://dronetm.testlogin.hotosm.org",
        "https://fair.testlogin.hotosm.org",
        "https://umap.testlogin.hotosm.org",
        "https://export.testlogin.hotosm.org",
        "https://drone.hotosm.org",
        "https://drone-dev.hotosm.org",
        "https://dev.drone.hotosm.org",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Exception handler to ensure CORS headers on error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Add CORS headers to HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        },
    )


# Initialize authentication
# AuthConfig.from_env() reads from environment variables automatically
auth_config = AuthConfig.from_env()


async def _local_pat_resolver(token_hash: str, app_name: str):
    """Resolve a PAT directly from the login DB (no HTTP call to self)."""
    from datetime import datetime, timezone

    from sqlalchemy import select

    from app.db.database import async_session_maker
    from app.db.models import UserApiToken, UserProfile
    from hotosm_auth.models import HankoUser

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
app.include_router(profile_routes.router)
app.include_router(api_token_routes.router)
app.include_router(api_token_routes.internal_router)


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
