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

| Step | FastAPI Simple | FastAPI+Mapping | Django Simple | Django+Mapping |
|------|----------------|-----------------|---------------|----------------|
| Dependency | ✓ | ✓ | ✓ | ✓ |
| init_auth / middleware | ✓ | ✓ | ✓ | ✓ |
| Protect routes | CurrentUser | Override login_required | request.hotosm | request.hotosm |
| Helper functions | - | ✓ | - | ✓ |
| Admin routes | - | Optional | - | Optional |
| AUTH_PROVIDER env | - | ✓ | - | ✓ |
