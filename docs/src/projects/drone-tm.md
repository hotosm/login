# Drone-TM Implementation

**Stack:** FastAPI + React | **Repo:** `drone-tm/`

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | FastAPI |
| Frontend | React SPA (Vite) |
| Legacy Auth | Google OAuth |
| User Model | Custom `AuthUser` / `DbUser` (with `id`, `email_address`) |
| Auth Mechanism | Override `login_required` FastAPI dependency |
| Onboarding | Automatic (via `get_mapped_user_id` with `auto_create=True`) |
| OSM Required | No |

Drone-TM has legacy auth (Google OAuth). Instead of changing all routes, **we override `login_required`** to use Hanko internally but return the same `AuthUser`. Onboarding is automatic — no explicit endpoint needed.

---

## Backend

### 1. Dependency

```toml
# src/backend/pyproject.toml
dependencies = [
    "hotosm-auth[fastapi]==0.2.10",
]
```

### 2. Configuration

```python
# src/backend/app/config.py

class Settings(BaseSettings):
    AUTH_PROVIDER: str = "legacy"

    # Legacy Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Hanko SSO
    HANKO_API_URL: Optional[str] = None
    COOKIE_SECRET: Optional[str] = None
    COOKIE_DOMAIN: Optional[str] = None
```

Initialization in `main.py`:

```python
# src/backend/app/main.py

from hotosm_auth import AuthConfig
from hotosm_auth_fastapi import init_auth, create_admin_mappings_router_psycopg, osm_router

def get_application() -> FastAPI:
    _app = FastAPI(...)

    if settings.AUTH_PROVIDER == "hanko":
        admin_router = create_admin_mappings_router_psycopg(
            get_db, app_name="drone-tm",
            user_table="users", user_id_column="id",
            user_name_column="name", user_email_column="email_address",
        )
        _app.include_router(admin_router, prefix="/api")
        _app.include_router(osm_router, prefix="/api")
    return _app

@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AUTH_PROVIDER == "hanko":
        auth_config = AuthConfig.from_env()
        init_auth(auth_config)
    yield
```

### 3. Auth Mechanism

Override the existing `login_required` dependency to map Hanko users to `AuthUser`, keeping all routes untouched:

```python
# src/backend/app/users/user_deps.py

# Legacy (already existed)
async def login_required(
    request: Request,
    user_dict: dict = Depends(verify_access_token),
) -> AuthUser:
    return AuthUser(**user_dict)

# Override when using Hanko SSO
if settings.AUTH_PROVIDER == "hanko":
    from hotosm_auth_fastapi import CurrentUser, get_mapped_user_id

    async def login_required(
        hanko_user: CurrentUser,
        db: Annotated[Connection, Depends(database.get_db)],
    ) -> AuthUser:
        user_id = await get_mapped_user_id(
            hanko_user=hanko_user, db_conn=db, app_name="drone-tm",
            auto_create=True,
            email_lookup_fn=lookup_user_by_email,
            user_creator_fn=create_drone_tm_user,
        )
        user = await DbUser.get_user_by_id(db, user_id)
        return AuthUser(
            id=user["id"], email=user["email_address"],
            name=user.get("name"), profile_img=user.get("profile_img"),
            role="MAPPER",
        )

    async def login_dependency(hanko_user: CurrentUser, db) -> DbUser:
        """Also overridden for permission checks."""
        ...same pattern...
```

Routes work without changes:

```python
@router.get("/my-info/")
async def my_data(user_data: AuthUser = Depends(login_required)):
    ...  # Works the same with legacy or hanko
```

**Schema changes:** Password made optional for SSO users:

```python
class UserProfileCreate(BaseUserProfile):
    password: Optional[str] = None  # Was required

    @model_validator(mode="after")
    def validate_password_required(self):
        if settings.AUTH_PROVIDER == "legacy" and not self.password:
            raise ValueError("Password is required for legacy authentication")
        return self
```

### 4. Onboarding

**Automatic** — no explicit endpoint. Handled inside `login_required` via `get_mapped_user_id` with `auto_create=True`.

When a Hanko user hits any protected route for the first time:

1. `get_mapped_user_id` checks `hanko_user_mappings` table
2. **No mapping** → calls `email_lookup_fn` (`lookup_user_by_email`)
3. **Email match** → existing user found → creates mapping (legacy user linked)
4. **No match** → calls `user_creator_fn` (`create_drone_tm_user`) → creates new user + mapping

No onboarding UI or redirect — the user is transparently created/linked on first request.

### 5. Helper Functions

```python
# src/backend/app/users/hanko_helpers.py

async def lookup_user_by_email(db_conn, email) -> Optional[str]:
    """Find existing user by email. Returns user ID or None."""
    user = await DbUser.get_user_by_email(db_conn, email)
    return user["id"] if user else None

async def create_drone_tm_user(db_conn, hanko_user) -> str:
    """Create new Drone-TM user. Returns new user ID."""
    auth_user = AuthUser(
        id=str(uuid.uuid4().int),
        email=hanko_user.email,
        name=hanko_user.email.split("@")[0],
        profile_img=None, role="MAPPER",
    )
    created_user = await DbUser.create(db_conn, auth_user)
    return created_user.id
```

### 6. URLs

Routers are mounted conditionally in `main.py` (see Configuration above):

- `admin_router` → `/api/admin/mappings`
- `osm_router` → `/api/auth/osm/...`

No changes to existing route files.

### 7. Environment Variables

```bash
# .env
AUTH_PROVIDER=hanko
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-secret-key-min-32-bytes-long
COOKIE_DOMAIN=.hotosm.org
EXTRA_CORS_ORIGINS=http://localhost:3040   # Required for Hanko cookies cross-origin
```

---

## Frontend

### 1. Web Component

```tsx
// src/frontend/src/components/common/Navbar/index.tsx

const AUTH_PROVIDER = getRuntimeConfig('VITE_AUTH_PROVIDER', 'legacy');
const HANKO_URL = getRuntimeConfig('VITE_HANKO_URL', 'https://dev.login.hotosm.org');
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

if (AUTH_PROVIDER === 'hanko') {
  import('@hotosm/hanko-auth');
}

// Return URL goes through /hanko-auth callback with role
const hankoReturnUrl = `${FRONTEND_URL}/hanko-auth?role=${signedInAs}`;

// Desktop
<hotosm-auth
  hanko-url={HANKO_URL}
  base-path={HANKO_URL}
  redirect-after-login={hankoReturnUrl}
  redirect-after-logout={FRONTEND_URL}
  button-variant="filled"
  button-color="danger"
/>

// Mobile (inside Drawer)
<hotosm-auth
  ...same attributes...
  display="bar"
/>
```

Note: no `mapping-check-url` or `app-id` — Drone-TM doesn't use the web component for onboarding status (it's automatic).

**Landing page (SignInOverlay):** Redirects directly to the login service:

```tsx
if (AUTH_PROVIDER === 'hanko') {
  document.cookie = 'hanko=; path=/; max-age=0';  // Clear existing session
  const returnUrl = `${FRONTEND_URL}/hanko-auth?role=PROJECT_CREATOR`;
  window.location.href = `${HANKO_URL}/app?return_to=${encodeURIComponent(returnUrl)}`;
}
```

**Hidden session check** on landing page navbar (checks for existing SSO session):

```tsx
{AUTH_PROVIDER === 'hanko' && (
  <div style={{ display: 'none' }}>
    <hotosm-auth hanko-url={HANKO_URL} redirect-after-login={hankoReturnUrl} ... />
  </div>
)}
```

### 2. Auth Logic

**`/hanko-auth` callback component** — handles return from login service:

```tsx
// src/frontend/src/components/HankoAuth/index.tsx

// 1. Calls /users/my-info/ with credentials (cookie)
// 2. Stores user profile in localStorage
// 3. Navigates to /projects or /complete-profile
const response = await fetch(`${BASE_URL}/users/my-info/`, { credentials: 'include' });
const userDetails = await response.json();
localStorage.setItem('userprofile', JSON.stringify(userDetails));
```

**Event listeners** in `App.tsx`:

```tsx
// hanko-login → fetch user profile
authComponent.addEventListener('hanko-login', async () => { ... });
// logout → clean localStorage
document.addEventListener('logout', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userprofile');  // signedInAs is kept for next login
});
```

**Auth hook** (`useAuth.ts`): checks legacy token, Hanko cookie, or localStorage profile.

**API client**: `withCredentials = true` always; handles 401 for expired Hanko sessions.

**Complete Profile**: password tab hidden for SSO users.

### 3. Environment Variables

```bash
# src/frontend/.env
VITE_AUTH_PROVIDER=hanko
VITE_HANKO_URL=https://login.hotosm.org
VITE_FRONTEND_URL=https://dronetm.hotosm.org
```

---

## Auth Flow

| Step | What happens |
|------|-------------|
| 1. Sign In | User clicks role button (Project Creator / Drone Pilot) |
| 2. Redirect | `window.location.href` to `{HANKO_URL}/app?return_to={returnUrl}` |
| 3. Login service | User authenticates at login.hotosm.org, gets JWT cookie |
| 4. Return | Login service redirects to `/hanko-auth?role=PROJECT_CREATOR` |
| 5. HankoAuth | Calls `/users/my-info/` with credentials (cookie) |
| 6. Backend | `login_required` validates JWT → `get_mapped_user_id` → auto-creates if needed → `AuthUser` |
| 7. Navigate | `/projects` if profile complete, `/complete-profile` if new |

---

## API Endpoints

```
# Hanko (mounted conditionally)
GET  /api/auth/osm/login          # Start OSM OAuth (from osm_router)
GET  /api/auth/osm/callback       # OSM OAuth callback (from osm_router)
GET  /api/auth/osm/status         # Check OSM connection (from osm_router)
POST /api/auth/osm/disconnect     # Disconnect OSM (from osm_router)

# Admin mappings
GET    /api/admin/mappings        # List mappings
POST   /api/admin/mappings        # Create mapping
GET    /api/admin/mappings/{id}   # Get mapping
PUT    /api/admin/mappings/{id}   # Update mapping
DELETE /api/admin/mappings/{id}   # Delete mapping

# Existing (unchanged, used by both)
GET  /api/users/my-info/          # User profile (used by HankoAuth callback)
```
