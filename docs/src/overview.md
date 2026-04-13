# Architecture Overview

## What is auth-libs?

**auth-libs** provides centralized authentication for all HOTOSM applications:

- **Hanko SSO**: Passwordless authentication via passkeys/email
- **OSM OAuth**: OpenStreetMap account linking
- **User Mapping**: Maps Hanko users to app-specific user IDs

| Component | Purpose |
|-----------|---------|
| `hotosm_auth` | Core Python package (JWT, config, crypto) |
| `hotosm_auth_fastapi` | FastAPI integration (dependencies, routes) |
| `hotosm_auth_django` | Django integration (middleware, decorators) |
| `hotosm_auth_litestar` | Litestar integration (dependencies, routes) |
| `<hotosm-auth>` | Web component (Lit-based auth UI) |

---

## Package Structure

```
auth-libs/
│
├── python/src/                       # Python packages
│   │
│   ├── hotosm_auth/                  # Core package (no framework deps)
│   │   ├── config.py                 # AuthConfig (Pydantic)
│   │   ├── models.py                 # HankoUser, OSMConnection
│   │   ├── jwt_validator.py          # JWT validation via JWKS
│   │   ├── crypto.py                 # Cookie encryption (Fernet)
│   │   └── osm_oauth.py              # OSM OAuth client
│   │
│   ├── hotosm_auth_fastapi/          # FastAPI integration
│   │   ├── dependencies.py           # CurrentUser, OSMConnectionRequired
│   │   ├── osm_routes.py             # /auth/osm/* endpoints
│   │   └── admin_routes.py           # User mapping admin API
│   │
│   ├── hotosm_auth_django/           # Django integration
│   │   ├── middleware.py             # HankoAuthMiddleware
│   │   ├── admin_routes.py           # Admin URL patterns
│   │   └── models.py                 # HankoUserMapping model
│   │
│   └── hotosm_auth_litestar/         # Litestar integration
│       ├── dependencies.py           # AuthContext, setup_auth
│       ├── osm_routes.py             # /auth/osm/* endpoints
│       └── admin_routes.py           # User mapping admin API
│
└── web-component/                    # Frontend web component
    ├── src/hanko-auth.ts             # Lit web component
    └── dist/                         # Built bundles (esm, iife)
```

---

## Authentication Flow

```mermaid
flowchart TD
    A[User visits app.hotosm.org] --> B[App redirects to login.hotosm.org]
    B --> C[User authenticates via Hanko]
    C --> D[Hanko sets JWT cookie\ndomain=.hotosm.org]
    D --> E[User redirected back to app]
    E --> F[App backend validates JWT via JWKS]
    F --> G{Token valid?}
    G -->|No| I[401 Unauthorized]
    G -->|Yes| H[HankoUser\nid=UUID, email=...]

    H --> NEEDMAP{App has\nlegacy users?}
    NEEDMAP -->|No| K[Auth complete]
    NEEDMAP -->|Yes| MAP{Mapping\nexists?}
    MAP -->|Yes| APPUSER[app_user_id resolved\ne.g. id=42]
    MAP -->|No| LINK[Auto-create mapping\nor app onboarding]
    LINK --> APPUSER
    APPUSER --> K
```

---

## User Mapping

Apps with existing users need to map Hanko UUIDs to app user IDs.

### Problem

```
Hanko: id="550e8400-..."    ←→    App: id=42
       email=user@x.com            email=user@x.com
```

### Solution

```sql
CREATE TABLE hanko_user_mappings (
    hanko_user_id VARCHAR(255) PRIMARY KEY,
    app_user_id VARCHAR(255) NOT NULL,
    app_name VARCHAR(255) DEFAULT 'default',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Strategies

1. **Auto-link by email** - Find existing user with same email
2. **Create new user** - Create app user from Hanko data
3. **Admin assigns** - Manual mapping via admin API
4. **Onboarding flow** - User completes registration after login

---

## Environment Variables

### Backend

```bash
# Required
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=generate-with-python-secrets-32-bytes

# OSM OAuth (enables OSM linking when both are set)
OSM_CLIENT_ID=your-osm-app-id
OSM_CLIENT_SECRET=your-osm-app-secret
OSM_REDIRECT_URI=https://your-app.hotosm.org/api/auth/osm/callback  # auto-generated if not set
OSM_SCOPES=read_prefs                # space-separated, default: read_prefs
OSM_API_URL=https://www.openstreetmap.org  # use OSM dev server for testing

# Cookie config (auto-detected from HANKO_API_URL when not set)
COOKIE_DOMAIN=.hotosm.org
COOKIE_SECURE=true                   # auto-detected from https scheme
COOKIE_SAMESITE=lax                  # lax | strict | none

# JWT validation
JWT_ISSUER=https://login.hotosm.org  # default: auto (uses HANKO_API_URL)
JWT_AUDIENCE=your-app-audience       # optional

# Admin
ADMIN_EMAILS=admin@hotosm.org        # comma-separated

# Dual-auth apps (legacy + hanko)
AUTH_PROVIDER=hanko                  # "legacy" or "hanko"
```

### Frontend

```bash
# Login service URL (handles Hanko auth and OSM OAuth)
VITE_HANKO_URL=https://login.hotosm.org

# Authentication mode (for dual-auth apps)
VITE_AUTH_PROVIDER=hanko             # "legacy" or "hanko"
```

### Variables by Project

| Variable | Portal | ChatMap | Drone-TM | fAIr | uMap | Login |
|----------|--------|---------|----------|------|------|-------|
| **Backend** |
| `HANKO_API_URL` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `COOKIE_SECRET` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `OSM_CLIENT_ID` | ✅ | - | - | ✅ | - | ✅ |
| `OSM_CLIENT_SECRET` | ✅ | - | - | ✅ | - | ✅ |
| `ADMIN_EMAILS` | ✅ | - | ✅ | ✅ | - | - |
| `AUTH_PROVIDER` | - | - | ✅ | ✅ | - | - |
| **Frontend** |
| `VITE_HANKO_URL` | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| `VITE_AUTH_PROVIDER` | - | - | ✅ | ✅ | - | - |

---

## Installation

### Python (pip)

```bash
# Core only
pip install hotosm-auth==0.2.10

# With FastAPI
pip install "hotosm-auth[fastapi]==0.2.10"

# With Django
pip install "hotosm-auth[django]==0.2.10"

# With Litestar
pip install "hotosm-auth[litestar]==0.2.10"
```

### pyproject.toml

```toml
dependencies = [
    # Pick one:
    "hotosm-auth[fastapi]==0.2.10",
    # "hotosm-auth[django]==0.2.10",
    # "hotosm-auth[litestar]==0.2.10",
]
```

### Web Component

```bash
pnpm add @hotosm/hanko-auth
```

```javascript
import '@hotosm/hanko-auth';

// <hotosm-auth> is now registered
```

For server-rendered apps (no bundler), use CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@hotosm/hanko-auth@0.5.2/dist/hanko-auth.esm.js"></script>
```
