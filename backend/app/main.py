from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, CurrentUser, osm_router

from app.core.config import settings
from app.schemas.auth import UserInfoResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI app."""
    # Startup
    print("🚀 Starting HOTOSM Login Service")
    yield
    # Shutdown
    print("👋 Shutting down HOTOSM Login Service")


app = FastAPI(
    title="HOTOSM Login Service",
    description="Authentication and SSO service for HOTOSM applications",
    version="1.0.0",
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
        # Test environments
        "https://testlogin.dronetm.hotosm.org",
        "https://testlogin.fair.hotosm.org",
        "https://testlogin.umap.hotosm.org",
        "https://testlogin.export.hotosm.org",
        "https://dronetm.hotosm.org",
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
init_auth(auth_config)

# Include OSM OAuth routes
api_v1_prefix = "/api"
app.include_router(
    osm_router,
    prefix=api_v1_prefix,
    tags=["auth"],
)

# Include admin routes for user mapping management
from app.api.routes import admin as admin_routes
from app.api.routes import profile as profile_routes

app.include_router(admin_routes.router)
app.include_router(profile_routes.router)


@app.get("/me", response_model=UserInfoResponse)
async def get_current_user(user: CurrentUser) -> UserInfoResponse:
    """
    Get current authenticated user information.

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
        "version": "1.0.0",
        "docs": "/docs",
    }
