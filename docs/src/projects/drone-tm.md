# Drone-TM Implementation

**Stack:** FastAPI + React | **Repo:** `drone-tm/` | **Branch:** `login-hanko` (vs `dev`)

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | FastAPI |
| Type | With User Mapping |
| OSM Required | Yes |

Drone-TM has legacy auth (Google OAuth). Instead of changing all routes,
**we override `login_required`** to use Hanko internally but return the same `AuthUser`.

---

## Backend

### 1. Dependency

```toml
# src/backend/pyproject.toml
dependencies = [
    "hotosm-auth[fastapi] @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
]
```

### 2. Initialization

```python
# src/backend/app/main.py

from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, create_admin_mappings_router_psycopg

def get_application() -> FastAPI:
    _app = FastAPI(...)

    # Include routers
    _app.include_router(drone_routes.router)
    _app.include_router(project_routes.router)
    _app.include_router(user_routes.router)

    # Admin router for managing mappings
    admin_router = create_admin_mappings_router_psycopg(
        get_db,
        app_name="drone-tm",
        user_table="users",
        user_id_column="id",
        user_name_column="name",
        user_email_column="email_address",
    )
    _app.include_router(admin_router)

    return _app


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AUTH_PROVIDER == "hanko":
        log.info("Initializing Hanko SSO authentication...")
        auth_config = AuthConfig.from_env()
        init_auth(auth_config)

    yield
```

### 3. Protected Routes

#### Override `login_required`

```python
# src/backend/app/users/user_deps.py

# Legacy auth (Google OAuth)
async def login_required(
    user_dict: dict = Depends(verify_access_token),
) -> AuthUser:
    return AuthUser(**user_dict)

# Override when using Hanko SSO
if settings.AUTH_PROVIDER == "hanko":
    from hotosm_auth_fastapi import CurrentUser, get_mapped_user_id
    from app.users.hanko_helpers import lookup_user_by_email, create_drone_tm_user

    async def login_required(
        hanko_user: CurrentUser,  # <- Uses CurrentUser from hotosm_auth
        db: Connection = Depends(database.get_db),
    ) -> AuthUser:  # <- Returns same type as legacy
        """Override that maps Hanko user -> Drone-TM user."""

        # Map Hanko UUID -> Drone-TM user_id
        user_id = await get_mapped_user_id(
            hanko_user=hanko_user,
            db_conn=db,
            app_name="drone-tm",
            auto_create=True,
            email_lookup_fn=lookup_user_by_email,
            user_creator_fn=create_drone_tm_user,
        )

        # Find user in DB
        user = await DbUser.get_user_by_id(db, user_id)

        # Return AuthUser (same as legacy)
        return AuthUser(
            id=user["id"],
            email=user["email_address"],
            name=user.get("name"),
            profile_img=user.get("profile_img"),
            role="MAPPER",
        )
```

#### Routes without changes

Existing routes continue working without modification:

```python
# src/backend/app/users/user_routes.py

@router.get("/me")
async def get_me(user: AuthUser = Depends(login_required)):
    """Works the same with legacy or hanko."""
    return user
```

### 4. User Mapping

The Hanko -> Drone-TM mapping is stored in `hanko_user_mappings`:

| hanko_user_id | app_user_id | app_name |
|---------------|-------------|----------|
| `550e8400-...` | `42` | `drone-tm` |

### 5. Helper Functions

```python
# src/backend/app/users/hanko_helpers.py

async def lookup_user_by_email(db: Connection, email: str) -> Optional[str]:
    """Look up existing user by email."""
    result = await db.execute(
        "SELECT id FROM users WHERE email_address = %s", [email]
    )
    row = await result.fetchone()
    return str(row["id"]) if row else None

async def create_drone_tm_user(db: Connection, hanko_user: HankoUser) -> str:
    """Create new user in Drone-TM from Hanko data."""
    result = await db.execute(
        "INSERT INTO users (email_address, name) VALUES (%s, %s) RETURNING id",
        [hanko_user.email, hanko_user.username or hanko_user.email.split("@")[0]]
    )
    row = await result.fetchone()
    return str(row["id"])
```

### 6. Configuration (.env)

```bash
# src/backend/.env

AUTH_PROVIDER=hanko
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret
COOKIE_DOMAIN=.hotosm.org

OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
OSM_REDIRECT_URI=https://dronetm.hotosm.org/api/auth/osm/callback

ADMIN_EMAILS=admin@hotosm.org
```

---

## Frontend

### 1. Web Component

```tsx
// src/frontend/src/components/Header.tsx

export function Header() {
  return (
    <header>
      <hotosm-auth
        hanko-url={import.meta.env.VITE_HANKO_URL}
        osm-required
        auto-connect
        redirect-after-login="/"
      />
    </header>
  );
}
```

### 2. Configuration (.env)

```bash
# src/frontend/.env

VITE_AUTH_PROVIDER=hanko
VITE_HANKO_URL=https://login.hotosm.org
VITE_FRONTEND_URL=https://dronetm.hotosm.org
```

> **Note:** `VITE_HANKO_URL` is the only URL needed for authentication. It points to the login service that handles both Hanko authentication and OSM OAuth endpoints.

---

## Framework Notes

### Available Dependencies (FastAPI)

| Dependency | Type | Error if missing |
|------------|------|------------------|
| `CurrentUser` | `HankoUser` | 401 Unauthorized |
| `CurrentUserOptional` | `Optional[HankoUser]` | None (no error) |
| `OSMConnectionRequired` | `OSMConnection` | 403 Forbidden |
| `OSMConnectionDep` | `Optional[OSMConnection]` | None (no error) |

---

## Key Changes (vs `dev` branch)

### main.py

```diff
+ from hotosm_auth import AuthConfig
+ from hotosm_auth_fastapi import init_auth, create_admin_mappings_router_psycopg

+ if settings.AUTH_PROVIDER == "hanko":
+     auth_config = AuthConfig.from_env()
+     init_auth(auth_config)

+ admin_router = create_admin_mappings_router_psycopg(...)
+ _app.include_router(admin_router)
```

### user_deps.py

```diff
+ if settings.AUTH_PROVIDER == "hanko":
+     from hotosm_auth_fastapi import CurrentUser, get_mapped_user_id
+     from app.users.hanko_helpers import lookup_user_by_email, create_drone_tm_user
+
+     async def login_required(
+         hanko_user: CurrentUser,
+         db: Connection = Depends(database.get_db),
+     ) -> AuthUser:
+         user_id = await get_mapped_user_id(...)
+         user = await DbUser.get_user_by_id(db, user_id)
+         return AuthUser(...)
```

### New file: hanko_helpers.py

```diff
+ # src/backend/app/users/hanko_helpers.py
+ async def lookup_user_by_email(db, email) -> Optional[str]: ...
+ async def create_drone_tm_user(db, hanko_user) -> str: ...
```

---

## API Endpoints

```
# Auth
GET  /api/auth/osm/login          # Start OSM OAuth
GET  /api/auth/osm/callback       # OSM OAuth callback
GET  /api/auth/osm/status         # Check OSM connection
POST /api/auth/osm/disconnect     # Disconnect OSM

# Admin (requires ADMIN_EMAILS)
GET    /admin/mappings            # List mappings
POST   /admin/mappings            # Create mapping
GET    /admin/mappings/{id}       # Get mapping
PUT    /admin/mappings/{id}       # Update mapping
DELETE /admin/mappings/{id}       # Delete mapping
```
