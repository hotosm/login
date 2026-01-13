# Integration Guide

Step by step guide to integrate `hotosm-auth` in your project.

## Quick Links

| Framework | Without Legacy Auth | With Legacy Auth |
|-----------|---------------------|------------------|
| **FastAPI** | [Simple](#fastapi-simple-integration) | [With Mapping](#fastapi-integration-with-mapping) |
| **Django** | [Simple](#django-simple-integration) | [With Mapping](#django-integration-with-mapping) |
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
    "hotosm-auth[fastapi] @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
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
app.include_router(osm_router, prefix="/api/auth/osm")
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
    "hotosm-auth[django] @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
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

## Frontend (all)

```tsx
// Import
import '/auth-libs/web-component/dist/hanko-auth.esm.js';

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

| Step | FastAPI Simple | FastAPI+Mapping | Django Simple | Django+Mapping |
|------|----------------|-----------------|---------------|----------------|
| Dependency | ✓ | ✓ | ✓ | ✓ |
| init_auth / middleware | ✓ | ✓ | ✓ | ✓ |
| Protect routes | CurrentUser | Override login_required | request.hotosm | request.hotosm |
| Helper functions | - | ✓ | - | ✓ |
| Admin routes | - | Optional | - | Optional |
| AUTH_PROVIDER env | - | ✓ | - | ✓ |
