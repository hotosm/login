# Integration Guide

Step by step guide to integrate `hotosm-auth` in your project.

## Quick Links

| Framework | Without Legacy Auth | With Legacy Auth |
|-----------|---------------------|------------------|
| **FastAPI** | [Simple](#fastapi-simple-integration) | [With Mapping](#fastapi-integration-with-mapping) |
| **Django** | [Simple](#django-simple-integration) | [With Mapping](#django-integration-with-mapping) |
| **Litestar** | [Simple](#litestar-simple-integration) | [With Mapping](#litestar-integration-with-mapping) |
| **Frontend** | [All](#frontend-all) | [All](#frontend-all) |

---

## Step 0: Determine your case

```
Does your app have an existing auth system (legacy)?
│
├─ NO → Simple Integration (Portal, OAM)
│       You only need to validate Hanko JWT
│
└─ YES → Integration with Mapping (Drone-TM, fAIr)
         You need to map Hanko users → existing users
```

---

## FastAPI: Simple Integration

For apps **without legacy auth** (e.g.: Portal, OAM).

### Step 1: Dependency

```toml
# pyproject.toml
dependencies = [
    "hotosm-auth[fastapi]==0.2.10",
]
```

### Step 2: Initialization

```python
# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, osm_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    auth_config = AuthConfig.from_env()
    init_auth(auth_config)
    yield

app = FastAPI(lifespan=lifespan)

# Mount OSM OAuth routes (optional)
# router already has prefix="/auth/osm" → routes: /api/auth/osm/login, /api/auth/osm/callback
app.include_router(osm_router, prefix="/api")
```

### Step 3: Protect routes

```python
# routes.py
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional, OSMConnectionRequired

@router.get("/me")
async def get_me(user: CurrentUser):
    """Requires authentication."""
    return {"user_id": user.id, "email": user.email}

@router.get("/public")
async def public(user: CurrentUserOptional):
    """Optional auth."""
    return {"user": user.email if user else "anonymous"}

@router.post("/edit-osm")
async def edit_osm(user: CurrentUser, osm: OSMConnectionRequired):
    """Requires auth + OSM connection."""
    return {"osm_username": osm.osm_username}
```

### Step 4: Environment variables

```bash
# .env
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret

# Only if using OSM OAuth
OSM_CLIENT_ID=your-client-id
OSM_CLIENT_SECRET=your-client-secret
```

---

## FastAPI: Integration with Mapping

For apps **with legacy auth** that need to map users (e.g.: Drone-TM).

### Steps 1-2: Same as Simple

### Step 3: Override existing dependency

```python
# user_deps.py

# Your existing legacy auth
async def login_required(token: str = Depends(verify_token)) -> AuthUser:
    return AuthUser(**decode_token(token))

# Override when using Hanko
if settings.AUTH_PROVIDER == "hanko":
    from hotosm_auth_fastapi import CurrentUser, get_mapped_user_id
    from app.hanko_helpers import lookup_user_by_email, create_app_user

    async def login_required(
        hanko_user: CurrentUser,
        db: Connection = Depends(get_db),
    ) -> AuthUser:
        user_id = await get_mapped_user_id(
            hanko_user=hanko_user,
            db_conn=db,
            app_name="my-app",
            auto_create=True,
            email_lookup_fn=lookup_user_by_email,
            user_creator_fn=create_app_user,
        )
        user = await get_user_by_id(db, user_id)
        return AuthUser(id=user["id"], email=user["email"])
```

### Step 4: Helper functions

```python
# hanko_helpers.py
async def lookup_user_by_email(db, email: str) -> Optional[str]:
    """Look up user by email. Returns user_id or None."""
    result = await db.execute("SELECT id FROM users WHERE email = %s", [email])
    row = await result.fetchone()
    return str(row["id"]) if row else None

async def create_app_user(db, hanko_user: HankoUser) -> str:
    """Create new user. Returns user_id."""
    result = await db.execute(
        "INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id",
        [hanko_user.email, hanko_user.username or hanko_user.email.split("@")[0]]
    )
    return str((await result.fetchone())["id"])
```

### Step 5: Admin routes (optional)

```python
# main.py
from hotosm_auth_fastapi import create_admin_mappings_router_psycopg

admin_router = create_admin_mappings_router_psycopg(
    get_db, app_name="my-app", user_table="users",
    user_id_column="id", user_name_column="name", user_email_column="email",
)
app.include_router(admin_router, prefix="/api/admin")
```

---

## Django: Simple Integration

### Step 1: Dependency

```toml
dependencies = [
    "hotosm-auth[django]==0.2.10",
]
```

### Step 2: Settings

```python
# settings.py
INSTALLED_APPS = [..., 'rest_framework', 'hotosm_auth_django']

MIDDLEWARE = [
    ...
    'hotosm_auth_django.HankoAuthMiddleware',  # Before AuthenticationMiddleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    ...
]
```

### Step 3: Protect views

```python
# views.py
class ProtectedView(APIView):
    def get(self, request):
        if not request.hotosm.user:
            return Response({"error": "Not authenticated"}, status=401)
        return Response({"email": request.hotosm.user.email})
```

---

## Django: Integration with Mapping

### Step 3: Settings with dual-mode

```python
AUTH_PROVIDER = env("AUTH_PROVIDER", default="legacy")

if AUTH_PROVIDER == "hanko":
    INSTALLED_APPS.append("hotosm_auth_django")
    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware"),
        "hotosm_auth_django.HankoAuthMiddleware",
    )
```

### Step 4: Admin routes

```python
# urls.py
if getattr(settings, 'AUTH_PROVIDER', 'legacy') == 'hanko':
    from hotosm_auth_django.admin_routes import create_admin_urlpatterns
    admin_patterns = create_admin_urlpatterns(
        app_name="my-app", user_model="myapp.User",
        user_id_column="id", user_name_column="username", user_email_column="email",
    )
    urlpatterns += [path("api/admin/", include(admin_patterns))]
```

---

## Litestar: Simple Integration

For apps **without legacy auth** (e.g.: Field-TM).

### Step 1: Dependency

```toml
# pyproject.toml
dependencies = [
    "hotosm-auth[litestar]==0.2.10",
]
```

### Step 2: Initialization

```python
# main.py
from litestar import Litestar
from hotosm_auth_litestar import setup_auth

# setup_auth() loads config from env, returns (deps, route_handlers)
deps, route_handlers = setup_auth()

app = Litestar(route_handlers=route_handlers, dependencies=deps)
```

### Step 3: Protect routes

```python
from litestar import get
from hotosm_auth_litestar import AuthContext, OptionalAuthContext

@get("/me")
async def me(auth: AuthContext) -> dict:
    """Requires authentication."""
    return {"user_id": auth.user.id, "email": auth.user.email}

@get("/public")
async def public(optional_auth: OptionalAuthContext) -> dict:
    """Optional auth."""
    return {"user": optional_auth.user.email if optional_auth.user else "anonymous"}
```

### Step 4: Environment variables

```bash
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret

# Only if using OSM OAuth
OSM_CLIENT_ID=your-client-id
OSM_CLIENT_SECRET=your-client-secret
```

---

## Litestar: Integration with Mapping

### Steps 1-2: Same as Simple

### Step 3: Custom auth dependency

```python
# auth_deps.py
from litestar import Request
from hotosm_auth_litestar import get_current_user, get_mapped_user_id

async def login_required(request: Request):
    hanko_user = await get_current_user(request)
    db = request.app.state.db
    user_id = await get_mapped_user_id(
        hanko_user=hanko_user,
        db_conn=db,
        app_name="my-app",
        auto_create=True,
        email_lookup_fn=lookup_user_by_email,
        user_creator_fn=create_app_user,
    )
    return await get_user_by_id(db, user_id)
```

### Step 4: Admin routes (optional)

```python
# main.py
from hotosm_auth_litestar import create_admin_mappings_router

admin_router = create_admin_mappings_router(
    get_db, app_name="my-app"
)
deps, route_handlers = setup_auth()
app = Litestar(route_handlers=[*route_handlers, admin_router], dependencies=deps)
```

---

## Frontend (all)

```tsx
// Import
import '@hotosm/hanko-auth';

// Use
<hotosm-auth
  hanko-url={import.meta.env.VITE_HANKO_URL}
  redirect-after-login="/"
/>
```

```bash
# .env
VITE_HANKO_URL=https://login.hotosm.org
```

---

## Checklist

| Step | FastAPI Simple | FastAPI+Mapping | Django Simple | Django+Mapping | Litestar Simple | Litestar+Mapping |
|------|----------------|-----------------|---------------|----------------|-----------------|------------------|
| Dependency | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Init | init_auth | init_auth | middleware | middleware | setup_auth() | setup_auth() |
| Protect routes | CurrentUser | Override login_required | request.hotosm | request.hotosm | AuthContext | Custom dep |
| Helper functions | - | ✓ | - | ✓ | - | ✓ |
| Admin routes | - | Optional | - | Optional | - | Optional |
| AUTH_PROVIDER env | - | ✓ | - | ✓ | - | ✓ |
