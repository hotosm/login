# Portal Implementation

**Stack:** FastAPI + React | **Repo:** `portal/`

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | FastAPI |
| Type | Simple (no mapping) |
| OSM Required | Optional |

Portal is an aggregator app that shows data from other HOTOSM projects.
It doesn't need user mapping - it only validates Hanko JWT.

---

## Backend

### 1. Dependency

```toml
# backend/pyproject.toml
dependencies = [
    "hotosm-auth[fastapi] @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
]
```

### 2. Initialization

```python
# backend/app/main.py

from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, osm_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    auth_config = AuthConfig.from_env()
    init_auth(auth_config)
    yield

app = FastAPI(lifespan=lifespan)

# Mount OSM OAuth routes
app.include_router(osm_router, prefix="/api/auth/osm")
```

### 3. Protected Routes

```python
# backend/app/api/routes/test.py

from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional, OSMConnectionRequired

@router.get("/me")
async def get_me(user: CurrentUser):
    """Requires valid Hanko JWT."""
    return {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
    }

@router.get("/public")
async def public(user: CurrentUserOptional):
    """Optional auth."""
    return {"user": user.email if user else "anonymous"}

@router.post("/edit-osm")
async def edit_osm(user: CurrentUser, osm: OSMConnectionRequired):
    """Requires Hanko JWT + OSM connection."""
    return {"osm_username": osm.osm_username}
```

### 4. Configuration (.env)

```bash
# backend/.env

# Hanko SSO
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret-min-32-chars

# OSM OAuth
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
OSM_REDIRECT_URI=https://portal.hotosm.org/api/auth/osm/callback

# Admin
ADMIN_EMAILS=admin@hotosm.org
```

---

## Frontend

### 1. Web Component

```tsx
// frontend/src/main.tsx
import '/auth-libs/web-component/dist/hanko-auth.esm.js';
```

```tsx
// frontend/src/components/Header.tsx

export function Header() {
  const hankoUrl = import.meta.env.VITE_HANKO_URL || 'https://login.hotosm.org';

  return (
    <header>
      <nav>
        <a href="/">Portal</a>
      </nav>

      <hotosm-auth
        hanko-url={hankoUrl}
        redirect-after-login="/"
      />
    </header>
  );
}
```

### 2. Configuración (.env)

```bash
# frontend/.env
VITE_HANKO_URL=https://login.hotosm.org
```

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

## API Endpoints

```
GET /api/docs                    # Swagger UI
GET /api/auth/osm/login          # Start OSM OAuth
GET /api/auth/osm/callback       # OSM OAuth callback
GET /api/auth/osm/status         # Check OSM connection
POST /api/auth/osm/disconnect    # Disconnect OSM
```
