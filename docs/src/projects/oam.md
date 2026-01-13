# OpenAerialMap Implementation

**Stack:** FastAPI (STAC API) | **Repo:** `openaerialmap/` | **Branch:** `login_hanko` (vs `main`)

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | FastAPI |
| Type | Simple (no mapping) |
| OSM Required | No |

OpenAerialMap is a **read-only** image catalog based on STAC.
It doesn't need OSM or user mapping - only auth for uploading/managing images.

---

## Backend

### 1. Dependency

```toml
# backend/stac-api/pyproject.toml
[project]
name = "hotosm-stac-api"
version = "0.1.0"
dependencies = [
    "stac-fastapi-pgstac[server]~=5.0.2",
    "hotosm-auth @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
]
```

### 2. Initialization

```python
# backend/stac-api/hotosm_stac_api/app.py

from fastapi import FastAPI
from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, osm_router

app = FastAPI(title="HOTOSM STAC API")

@app.on_event("startup")
async def startup():
    config = AuthConfig.from_env()
    init_auth(config)

# Mount OSM routes (optional)
app.include_router(osm_router, prefix="/api/auth/osm")
```

### 3. Protected Routes

```python
# backend/stac-api/hotosm_stac_api/routes.py

from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional

@router.get("/collections")
async def list_collections(user: CurrentUserOptional):
    """List collections (public, shows ownership if authenticated)."""
    return await stac_service.list_collections(user_id=user.id if user else None)

@router.post("/collections")
async def create_collection(collection: CollectionCreate, user: CurrentUser):
    """Create collection (requires authentication)."""
    return await stac_service.create_collection(collection, user.id)

@router.post("/collections/{id}/items")
async def create_item(id: str, item: ItemCreate, user: CurrentUser):
    """Add item (requires authentication)."""
    return await stac_service.create_item(id, item, user.id)
```

### 4. Configuration (.env)

```bash
# backend/stac-api/.env

HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret
COOKIE_DOMAIN=.hotosm.org

# OSM not required for OAM
# OSM_CLIENT_ID=...
# OSM_CLIENT_SECRET=...
```

---

## Frontend

### 1. Web Component

```tsx
// frontend/src/components/Header.tsx

export function Header() {
  return (
    <header>
      <hotosm-auth
        hanko-url={import.meta.env.VITE_HANKO_URL}
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
VITE_STAC_API_URL=https://api.imagery.hotosm.org
VITE_STAC_API_PATHNAME=stac
VITE_STAC_TILER_PATHNAME=raster
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

## Architecture Notes

OpenAerialMap uses a **public read / authenticated write** pattern:

```python
# Public - no auth
@router.get("/items")
async def search_items():
    return await stac.search()

# Authenticated - requires JWT
@router.post("/items")
async def create_item(user: CurrentUser):
    return await stac.create(owner=user.id)
```

**Features:**
- **Public endpoints**: Search/browse images (no auth)
- **Protected endpoints**: Upload/manage images (with auth)
- **No OSM**: Users don't need an OSM account to view images
- **STAC-based**: Uses stac-fastapi-pgstac for catalog management

---

## Key Changes (vs `main` branch)

### pyproject.toml

```diff
dependencies = [
    "stac-fastapi-pgstac[server]~=5.0.2",
+   "hotosm-auth @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
]
```

### app.py

```diff
+ from hotosm_auth import AuthConfig
+ from hotosm_auth_fastapi import init_auth

+ @app.on_event("startup")
+ async def startup():
+     config = AuthConfig.from_env()
+     init_auth(config)
```

---

## API Endpoints

```
# STAC (public)
GET /collections                  # List collections
GET /collections/{id}             # Get collection
GET /collections/{id}/items       # List items
GET /search                       # Search items

# STAC (authenticated)
POST /collections                 # Create collection
PUT  /collections/{id}            # Update collection
POST /collections/{id}/items      # Add item

# Auth
GET  /api/auth/osm/status         # Check connection
```
