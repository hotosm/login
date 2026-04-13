# Python Libraries

Detailed documentation for the Python authentication packages.

---

## Core: `hotosm_auth`

The core package with no framework dependencies.

### AuthConfig

```python
# hotosm_auth/config.py

class AuthConfig(BaseModel):
    """Configuration loaded from environment. Immutable after creation."""

    # Required
    hanko_api_url: HttpUrl              # https://login.hotosm.org
    cookie_secret: str                  # Min 32 bytes (Fernet key)

    # Cookie settings (auto-detected)
    cookie_domain: Optional[str]        # .hotosm.org (from hanko_api_url)
    cookie_secure: bool                 # True if https://
    cookie_samesite: str                # "lax"

    # OSM OAuth (enabled if credentials provided)
    osm_enabled: bool
    osm_client_id: Optional[str]
    osm_client_secret: Optional[str]
    osm_redirect_uri: Optional[str]     # Auto: {hanko_api_url}/auth/osm/callback
    osm_scopes: list[str]               # ["read_prefs"]

    # JWT
    jwt_audience: Optional[str]
    jwt_issuer: Optional[str]           # "auto" = hanko_api_url

    # Admin
    admin_emails: str                   # Comma-separated

    @classmethod
    def from_env(cls) -> "AuthConfig":
        """Load from environment variables."""
```

**Smart Defaults:**

- `cookie_domain`: `login.hotosm.org` → `.hotosm.org`
- `cookie_secure`: `https://` → `True`
- `jwt_issuer`: `"auto"` → uses `hanko_api_url`
- `osm_redirect_uri`: Auto-generated if not set

---

### HankoUser

```python
# hotosm_auth/models.py

@dataclass
class HankoUser:
    """User from validated JWT."""

    id: str                      # UUID: "550e8400-e29b-41d4-a716-..."
    email: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    username: Optional[str]

    @property
    def display_name(self) -> str:
        return self.username or self.email.split("@")[0]
```

---

### OSMConnection

```python
# hotosm_auth/models.py

@dataclass
class OSMConnection:
    """OSM OAuth data from encrypted cookie."""

    osm_user_id: int             # 12345
    osm_username: str            # "mapper_jane"
    osm_avatar_url: Optional[str]
    access_token: str            # Decrypted, ready to use
    refresh_token: Optional[str]
    expires_at: Optional[datetime]
    scopes: list[str]            # ["read_prefs", "write_api"]

    @property
    def is_expired(self) -> bool: ...

    def has_scope(self, scope: OSMScope | str) -> bool: ...
```

---

### JWTValidator

```python
# hotosm_auth/jwt_validator.py

class JWTValidator:
    """Validates JWT using Hanko's JWKS."""

    def __init__(self, config: AuthConfig):
        # JWKS URL: {hanko_api_url}/.well-known/jwks.json
        # Key caching with TTL
        # SSL disabled for localhost (mkcert support)

    async def validate_token(self, token: str) -> HankoUser:
        """
        1. Get signing key from JWKS (cached)
        2. Verify RS256 signature
        3. Verify exp, iss, aud claims
        4. Extract user data → HankoUser

        Raises:
            TokenExpiredError
            TokenInvalidError
            AuthenticationError
        """
```

---

### CookieCrypto

```python
# hotosm_auth/crypto.py

class CookieCrypto:
    """Fernet encryption for OSM cookies."""

    def __init__(self, secret: str):
        # Derives Fernet key (AES-128-CBC + HMAC)
        # Secret must be ≥32 bytes

    def encrypt_osm_connection(self, conn: OSMConnection) -> str:
        """Serialize → JSON → Encrypt → Base64"""

    def decrypt_osm_connection(self, encrypted: str) -> OSMConnection:
        """Base64 → Decrypt → JSON → OSMConnection"""
```

---

## FastAPI: `hotosm_auth_fastapi`

### Simple Setup

```python
from fastapi import FastAPI
from hotosm_auth_fastapi import setup_auth, Auth

app = FastAPI()
setup_auth(app)  # Loads from .env, adds CORS, registers OSM routes

@app.get("/me")
async def me(auth: Auth):
    return {
        "user": auth.user.email,
        "osm": auth.osm.osm_username if auth.osm else None
    }

@app.post("/upload")
async def upload(auth: Auth):
    osm = auth.require_osm()  # Raises 403 if not connected
    return {"token": osm.access_token}
```

### Manual Setup

```python
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import (
    init_auth,
    CurrentUser,
    CurrentUserOptional,
    OSMConnectionRequired,
    osm_router,
)

app = FastAPI()

# Initialize at startup
config = AuthConfig.from_env()
init_auth(config)

# Mount OSM routes
app.include_router(osm_router, prefix="/api/auth/osm")

# Protected endpoint
@app.get("/protected")
async def protected(user: CurrentUser):
    return {"id": user.id}

# Optional auth
@app.get("/public")
async def public(user: CurrentUserOptional):
    return {"user": user.email if user else "anonymous"}

# OSM required
@app.post("/edit")
async def edit(osm: OSMConnectionRequired):
    return {"osm_user": osm.osm_username}
```

### Dependencies

| Dependency | Type | Raises |
|------------|------|--------|
| `CurrentUser` | `HankoUser` | 401 |
| `CurrentUserOptional` | `Optional[HankoUser]` | - |
| `OSMConnectionDep` | `Optional[OSMConnection]` | - |
| `OSMConnectionRequired` | `OSMConnection` | 403 |

### OSM Routes

```
GET  /auth/osm/login      → Redirect to OSM authorization
GET  /auth/osm/callback   → Handle OAuth callback, set cookie
GET  /auth/osm/status     → {"connected": true, "osm_username": "..."}
POST /auth/osm/disconnect → Revoke tokens, clear cookie
```

### Admin Routes

```python
from hotosm_auth_fastapi import create_admin_mappings_router_psycopg

# For psycopg (raw SQL)
admin_router = create_admin_mappings_router_psycopg(
    get_db,                          # Dependency returning Connection
    app_name="drone-tm",
    user_table="users",
    user_id_column="id",
    user_name_column="name",
    user_email_column="email_address",
)
app.include_router(admin_router, prefix="/api/admin")
```

Endpoints:

```
GET    /mappings              → List all mappings (paginated)
POST   /mappings              → Create mapping
GET    /mappings/{hanko_id}   → Get single mapping
PUT    /mappings/{hanko_id}   → Update mapping
DELETE /mappings/{hanko_id}   → Delete mapping
```

---

## Django: `hotosm_auth_django`

### Setup

```python
# settings.py

INSTALLED_APPS = [
    ...
    'hotosm_auth_django',
]

MIDDLEWARE = [
    ...
    'hotosm_auth_django.HankoAuthMiddleware',
]

# Configuration via environment variables:
# HANKO_API_URL, COOKIE_SECRET, OSM_CLIENT_ID, etc.
```

### Usage

```python
# views.py
from django.http import JsonResponse
from hotosm_auth_django import login_required, osm_required

# Access user in any view
def my_view(request):
    user = request.hotosm.user    # Optional[HankoUser]
    osm = request.hotosm.osm      # Optional[OSMConnection]

    if user:
        return JsonResponse({"email": user.email})
    return JsonResponse({"error": "Not logged in"}, status=401)

# Decorator: require Hanko login
@login_required
def protected_view(request):
    return JsonResponse({"user": request.hotosm.user.email})

# Decorator: require OSM connection
@osm_required
def osm_view(request):
    return JsonResponse({"osm_user": request.hotosm.osm.osm_username})
```

### Middleware

```python
# hotosm_auth_django/middleware.py

class HankoAuthMiddleware:
    """
    Adds to every request:
      - request.hotosm.user  (lazy HankoUser)
      - request.hotosm.osm   (lazy OSMConnection)
    """
```

### Admin Routes

```python
# urls.py
from django.urls import path, include
from hotosm_auth_django.admin_routes import create_admin_urlpatterns

urlpatterns = [
    path("api/admin/", include(create_admin_urlpatterns(
        app_name="fair",
        user_model="login.OsmUser",      # Optional: enrich with user data
        user_id_column="osm_id",
        user_name_column="username",
        user_email_column="email",
    ))),
]
```

### ORM Model

```python
# hotosm_auth_django/models.py

class HankoUserMapping(models.Model):
    class Meta:
        db_table = "hanko_user_mappings"

    hanko_user_id = models.CharField(max_length=255, primary_key=True)
    app_user_id = models.CharField(max_length=255)
    app_name = models.CharField(max_length=255, default="default")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
```

Run migrations:

```bash
python manage.py migrate hotosm_auth_django
```
