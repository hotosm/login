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

```text
Does your app have an existing auth system (legacy)?
│
├─ NO → Simple Integration (Portal, ChatMap)
│       You only need to validate Hanko JWT
│
└─ YES → Integration with Mapping (Drone-TM, fAIr)
         You need to map Hanko users → existing users
```

---

## FastAPI: Simple Integration

For apps **without legacy auth** (e.g.: Portal, ChatMap).

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
from hotosm_auth_django import login_required

# Decorator approach
@login_required
def my_view(request):
    return JsonResponse({"email": request.hotosm.user.email})

# Class-based view — check manually
class ProtectedView(APIView):
    def get(self, request):
        if not request.hotosm.user:
            return Response({"error": "Not authenticated"}, status=401)
        return Response({"email": request.hotosm.user.email})
```

---

## Django: Integration with Mapping

### Steps 1-2: Same as Simple

### Step 3: Settings with dual-mode

```python
# settings.py
AUTH_PROVIDER = env("AUTH_PROVIDER", default="legacy")

if AUTH_PROVIDER == "hanko":
    INSTALLED_APPS.append("hotosm_auth_django")
    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware"),
        "hotosm_auth_django.HankoAuthMiddleware",
    )
```

### Step 4: DRF authentication backend

The middleware populates `request.hotosm.user`. Create a DRF `BaseAuthentication` class that maps that Hanko user to your app user:

```python
# authentication.py
from rest_framework import authentication
from hotosm_auth_django import get_mapped_user_id
from myapp.models import AppUser

class HankoAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        hanko_user = getattr(request, 'hotosm', None) and request.hotosm.user
        if not hanko_user:
            return None, None

        app_user_id = get_mapped_user_id(hanko_user, app_name="my-app")

        if app_user_id:
            user = AppUser.objects.get(id=app_user_id)
            return user, None

        # No mapping yet → send to onboarding
        request.needs_onboarding = True
        return None, None


# Select auth class based on provider
if settings.AUTH_PROVIDER == "hanko":
    MyAuthentication = HankoAuthentication
else:
    MyAuthentication = LegacyAuthentication  # your existing class
```

Register it in settings:

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "myapp.authentication.MyAuthentication",
    ]
}
```

### Step 5: Admin routes

```python
# urls.py
if settings.AUTH_PROVIDER == "hanko":
    from hotosm_auth_django.admin_routes import create_admin_urlpatterns
    admin_patterns = create_admin_urlpatterns(
        app_name="my-app", user_model="myapp.AppUser",
        user_id_column="id", user_name_column="username", user_email_column="email",
    )
    urlpatterns += [path("api/admin/", include(admin_patterns))]
```

---

## Litestar: Simple Integration

For apps **without legacy auth**.

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
# route_handlers includes the OSM OAuth routes — spread alongside your own handlers
deps, route_handlers = setup_auth()

app = Litestar(route_handlers=[*route_handlers, me, ...], dependencies=deps)
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
from app.hanko_helpers import lookup_user_by_email, create_app_user

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

### Step 4: Helper functions

```python
# hanko_helpers.py
async def lookup_user_by_email(db, email: str) -> Optional[str]:
    """Look up user by email. Returns user_id or None."""
    async with db.cursor() as cur:
        await cur.execute("SELECT id FROM users WHERE email = %s", [email])
        row = await cur.fetchone()
    return str(row[0]) if row else None

async def create_app_user(db, hanko_user: HankoUser) -> str:
    """Create new user. Returns user_id."""
    async with db.cursor() as cur:
        await cur.execute(
            "INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id",
            [hanko_user.email, hanko_user.username or hanko_user.email.split("@")[0]]
        )
        row = await cur.fetchone()
    return str(row[0])
```

### Step 5: Admin routes (optional)

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

## Frontend: Downstream Apps

This guide is mainly about integrating `hotosm-auth` into a downstream app that sends users to a centralized login app and then restores authenticated state when they return.

The centralized login app itself is implemented in this repo already. If you need that side of the integration, see:

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/contexts/AuthContext.tsx`

For downstream apps, the implementation is easiest to think about as four steps.

#### Step 1: Make the web component available

Import `@hotosm/hanko-auth` anywhere you render `<hotosm-auth>`.

```tsx
import '@hotosm/hanko-auth';
```

If you use React + TypeScript, add JSX typings for the custom element:

```ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hotosm-auth': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'hanko-url'?: string;
          'base-path'?: string;
          'osm-enabled'?: boolean;
          'osm-required'?: boolean;
          'auto-connect'?: boolean;
          'show-profile'?: boolean;
          'redirect-after-login'?: string;
          'redirect-after-logout'?: string;
          'login-url'?: string;
          lang?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

#### Step 2: Keep one hidden verifier mounted

This is the key downstream-app pattern. The hidden `<hotosm-auth>` instance validates the login session after redirect back from the centralized login app and emits `hanko-login`.

```tsx
import '@hotosm/hanko-auth';

const SessionVerifier = ({ hankoApiUrl }: { hankoApiUrl: string }) => (
  <div style={{ display: 'none' }}>
    <hotosm-auth hanko-url={hankoApiUrl} />
  </div>
);
```

Mount it near the top of your app:

```tsx
{enableAuth && <SessionVerifier hankoApiUrl={config.HANKO_API_URL} />}
```

#### Step 3: Listen for auth events and store auth state

The web component drives auth through document-level events:

- `hanko-login`
- `logout`
- `osm-connected`

```tsx
import { createContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [osmConnection, setOsmConnection] = useState(null);

  useEffect(() => {
    const handleLogin = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUser(customEvent.detail.user);
    };

    const handleLogout = () => {
      setUser(null);
      setOsmConnection(null);
    };

    const handleOsmConnected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setOsmConnection(customEvent.detail.osmData);
    };

    document.addEventListener('hanko-login', handleLogin);
    document.addEventListener('logout', handleLogout);
    document.addEventListener('osm-connected', handleOsmConnected);

    return () => {
      document.removeEventListener('hanko-login', handleLogin);
      document.removeEventListener('logout', handleLogout);
      document.removeEventListener('osm-connected', handleOsmConnected);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, osmConnection, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Step 4: Protect routes and redirect to centralized login

When a protected page is opened by an unauthenticated user:

- if `LOGIN_URL` is external, redirect the browser there with `return_to=<current-url>`
- if `LOGIN_URL` is an internal route, navigate to it locally

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, isAuthenticated, loading, loginUrl }) => {
  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return children;

  if (loginUrl.startsWith('http')) {
    const returnTo = encodeURIComponent(window.location.href);
    window.location.href = `${loginUrl}?return_to=${returnTo}`;
    return null;
  }

  const hashIndex = loginUrl.indexOf('#');
  const relativePath = hashIndex >= 0 ? loginUrl.slice(hashIndex + 1) : loginUrl;
  return <Navigate to={relativePath} replace />;
};

export function AppRoutes({ config, isAuthenticated, loading }) {
  return (
    <>
      {config.ENABLE_AUTH && <SessionVerifier hankoApiUrl={config.HANKO_API_URL} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/linked"
          element={
            <PrivateRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              loginUrl={config.LOGIN_URL}
            >
              <Linked />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}
```

### Optional: visible auth control in a downstream app header

If users should be able to log in or see their profile from any page, render `<hotosm-auth>` visibly in your header as well:

```tsx
<hotosm-auth
  hanko-url={config.HANKO_API_URL}
  login-url={config.LOGIN_URL}
  redirect-after-login={window.location.origin}
  redirect-after-logout={window.location.origin}
  lang={lang}
/>
```

This is optional. The hidden verifier is the required piece for downstream apps with protected routes.

### Dedicated login page in a downstream app

If your downstream app also has its own `/login` or `/app` route, you can render `<hotosm-auth show-profile>` there as a visible login UI instead of only redirecting externally.

```tsx
import { Link } from 'react-router-dom';
import '@hotosm/hanko-auth';

function LoginPage() {
  const { config } = useConfigContext();
  const redirectUrl = config?.FRONTEND_URL || window.location.origin;

  return (
    <div className="login-page">
      <div className="login__panel">
        <hotosm-auth
          hanko-url={config?.HANKO_API_URL}
          show-profile={true}
          redirect-after-login={redirectUrl}
          redirect-after-logout={redirectUrl}
        />
        <Link to="/">Back to home</Link>
      </div>
    </div>
  );
}
```

You can also pass onboarding-specific props such as `osm-required` and `auto-connect` if the downstream app needs to force OSM connection.

### Frontend env/config

```bash
# Hanko API + centralized login
VITE_HANKO_URL=https://login.hotosm.org
VITE_LOGIN_URL=https://login.hotosm.org/app

# Optional app-side config values used by downstream apps
HANKO_API_URL=https://login.hotosm.org
LOGIN_URL=https://login.hotosm.org/app
FRONTEND_URL=https://your-app.example.org
```

---

## Checklist

| Step | FastAPI Simple | FastAPI+Mapping | Django Simple | Django+Mapping | Litestar Simple | Litestar+Mapping |
|------|----------------|-----------------|---------------|----------------|-----------------|------------------|
| Dependency | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Init | init_auth | init_auth | middleware | middleware | setup_auth() | setup_auth() |
| Protect routes | CurrentUser | Override login_required | request.hotosm | BaseAuthentication | AuthContext | Custom dep |
| Helper functions | - | ✓ | - | - | - | ✓ |
| Admin routes | - | Step 5 | - | Step 5 | - | Step 5 |
| AUTH_PROVIDER env | - | ✓ | - | ✓ | - | ✓ |
