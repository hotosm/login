# fAIr Implementation

**Stack:** Django + React | **Repo:** `fAIr/`

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | Django (DRF) |
| Frontend | React SPA (Vite) |
| Legacy Auth | OSM OAuth (`osm-login-python`) |
| User Model | Custom `OsmUser` (with `osm_id`) |
| Auth Mechanism | DRF `HankoAuthentication` class (dynamic switch) |
| Onboarding | Explicit `/onboarding` endpoint |
| OSM Required | Optional (synthetic IDs for Hanko-only users) |

fAIr uses a DRF authentication class that dynamically switches between `LegacyOsmAuthentication` and `HankoAuthentication` based on `AUTH_PROVIDER`. The Hanko class maps Hanko users to existing `OsmUser` records. Users without an OSM account get a synthetic negative `osm_id`.

---

## Backend

### 1. Dependency

```toml
# backend/pyproject.toml
dependencies = [
    "hotosm-auth[django]==0.2.10",
]
```

### 2. Configuration

```python
# backend/fairproject/settings.py

class AuthProvider:
    LEGACY = "legacy"
    HANKO = "hanko"

AUTH_PROVIDER = env("AUTH_PROVIDER", default=AuthProvider.LEGACY)

if AUTH_PROVIDER == AuthProvider.HANKO:
    HANKO_API_URL = env("HANKO_API_URL")
    COOKIE_SECRET = env("COOKIE_SECRET")
    COOKIE_DOMAIN = env("COOKIE_DOMAIN", default=None)
    COOKIE_SECURE = env.bool("COOKIE_SECURE", default=not DEBUG)
    JWT_AUDIENCE = env("JWT_AUDIENCE", default=None)
    LOGIN_URL = env("LOGIN_URL", default="https://login.hotosm.org")
    OSM_REDIRECT_URI = env("OSM_REDIRECT_URI", default=...)

    INSTALLED_APPS.append("hotosm_auth_django")

    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware"),
        "hotosm_auth_django.HankoAuthMiddleware",
    )
```

Middleware order: `HankoAuthMiddleware` → `AuthenticationMiddleware` (must be before).

!!! warning "Django App Registry"
    Import `create_admin_urlpatterns` directly from the module, not from the package root:
    ```python
    from hotosm_auth_django.admin_routes import create_admin_urlpatterns  # Correct
    ```

### 3. Auth Mechanism

A DRF authentication class dynamically selected at module load:

```python
# backend/login/authentication.py

class HankoAuthentication(authentication.BaseAuthentication):
    """Hanko SSO authentication using user mappings."""
    def authenticate(self, request):
        from hotosm_auth_django import get_mapped_user_id

        hanko_user = request.hotosm.user
        if not hanko_user:
            return (None, None)

        mapped_osm_id = get_mapped_user_id(hanko_user, app_name="fair")
        if mapped_osm_id is not None:
            user = OsmUser.objects.get(osm_id=int(mapped_osm_id))
            return (user, None)

        request.needs_onboarding = True
        return (None, None)

# Dynamic selection
if settings.AUTH_PROVIDER == AuthProvider.HANKO:
    OsmAuthentication = HankoAuthentication
else:
    OsmAuthentication = LegacyOsmAuthentication
```

All views use `OsmAuthentication` — the switch is transparent.

**Synthetic OSM IDs:** Users without an OSM account get a negative `osm_id`:

```python
# backend/login/hanko_helpers.py

def generate_synthetic_osm_id(hanko_id: str) -> int:
    synthetic_id = -(abs(hash(hanko_id)) % 10**9)
    return synthetic_id if synthetic_id != 0 else -1

def is_real_osm_user(osm_id: int) -> bool:
    return osm_id > 0
```

**HankoUserFilterMixin:** Filters querysets when `?mine=true` is passed:

```python
class HankoUserFilterMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('mine', '').lower() == 'true':
            if self.request.user and self.request.user.is_authenticated:
                return queryset.filter(user=self.request.user)
            return queryset.none()
        return queryset
```

### 4. Onboarding

Explicit `/onboarding` endpoint. The login service redirects here after the user chooses new/legacy:

```python
# backend/login/views.py

class OnboardingCallback(APIView):
    def get(self, request):
        hanko_user = request.hotosm.user
        is_new_user = request.query_params.get('new_user') == 'true'

        if is_new_user:
            # Generate synthetic osm_id, create OsmUser + mapping
            osm_id = generate_synthetic_osm_id(hanko_user.id)
            username = hanko_user.email.split('@')[0]
            create_osm_user(osm_id=osm_id, username=username, email=hanko_user.email)
            create_user_mapping(hanko_user.id, str(osm_id), "fair")
            return HttpResponseRedirect(settings.FRONTEND_URL)
        else:
            # Legacy: find existing OsmUser by OSM ID, update email, create mapping
            osm_id = request.hotosm.osm.osm_user_id
            existing_user = find_legacy_user_by_osm_id(osm_id)
            existing_user.email = hanko_user.email
            existing_user.email_verified = True
            existing_user.save(update_fields=["email", "email_verified"])
            create_user_mapping(hanko_user.id, str(osm_id), "fair")
            return HttpResponseRedirect(settings.FRONTEND_URL)
```

**Auth Status** — the web component calls this to check if the user is mapped:

```python
class AuthStatus(APIView):
    def get(self, request):
        # Returns: auth_provider, authenticated, needs_onboarding,
        # user info (osm_id, username, is_real_osm), hanko_user info (id, email)
```

### 5. Helper Functions

```python
# backend/login/hanko_helpers.py

def find_legacy_user_by_osm_id(osm_id)     # Find OsmUser by osm_id
def create_osm_user(osm_id, username, ...)  # Create OsmUser, handle username conflicts
def generate_synthetic_osm_id(hanko_id)     # Negative osm_id for Hanko-only users
def is_real_osm_user(osm_id)                # Positive = real, negative = synthetic
```

### 6. URLs

```python
# backend/login/urls.py
urlpatterns = [
    path("login/", ...),                             # Legacy
    path("callback/", ...),                          # Legacy
    path("me/", ...),                                # Legacy (used by both)
    path("me/request-email-verification/", ...),     # Legacy
    path("me/verify-email/", ...),                   # Legacy
    path("status/", views.AuthStatus.as_view()),     # Hanko status check
]
if settings.AUTH_PROVIDER == AuthProvider.HANKO:
    urlpatterns.append(path("onboarding/", views.OnboardingCallback.as_view()))

# backend/fairproject/urls.py
if settings.AUTH_PROVIDER == AuthProvider.HANKO:
    admin_mapping_patterns = create_admin_urlpatterns(
        app_name="fair", user_model="login.OsmUser",
        user_id_column="osm_id", user_name_column="username", user_email_column="email",
    )
urlpatterns = [
    path("api/v1/auth/", include("login.urls")),
    path("api/admin/", include(admin_mapping_patterns)),
    path("django-admin/", admin.site.urls),
]
```

### 7. Environment Variables

```bash
# backend/.env
AUTH_PROVIDER=hanko
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret
COOKIE_DOMAIN=.hotosm.org
COOKIE_SECURE=true
JWT_AUDIENCE=
LOGIN_URL=https://login.hotosm.org
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
OSM_LOGIN_REDIRECT_URI=https://fair.hotosm.org/api/v1/auth/callback/
OSM_SECRET_KEY=your-osm-secret-key
OSM_REDIRECT_URI=https://fair.hotosm.org/api/v1/auth/osm/callback/
ADMIN_EMAILS=admin@hotosm.org
FRONTEND_URL=https://fair.hotosm.org
```

---

## Frontend

### 1. Web Component

```tsx
// frontend/src/components/layouts/navbar/navbar.tsx

if (AUTH_PROVIDER === "hanko") {
  import("@hotosm/hanko-auth");
}

<hotosm-auth
  hanko-url={HANKO_URL}
  base-path={HANKO_URL}
  redirect-after-login={FRONTEND_URL}
  redirect-after-logout={FRONTEND_URL}
  mapping-check-url={`${BASE_API_URL}auth/status/`}
  app-id="fair"
  button-variant="filled"
  button-color="danger"
  display={displayBar ? "bar" : "default"}
/>
```

### 2. Auth Logic

The `AuthProvider` context handles dual mode:

- **Hanko**: `withCredentials: true` (cookie-based), listens to `hanko-login`/`logout` events
- **Legacy**: `access-token` header from localStorage

```tsx
// frontend/src/app/providers/auth-provider.tsx

// API client: cookies for Hanko, header for legacy
if (AUTH_PROVIDER === "hanko") {
  apiClient.defaults.withCredentials = true;
} else {
  apiClient.defaults.headers.common["access-token"] = token;
}

// isAuthenticated: user-based for Hanko, user+token for legacy
const isAuthenticated =
  AUTH_PROVIDER === "hanko" ? user !== undefined : user !== undefined && token !== undefined;

// Event listeners
document.addEventListener("hanko-login", handleLogin);
document.addEventListener("logout", handleLogout);

// Polls /api/v1/auth/me/ every 15 seconds to keep user data in sync
```

### 3. Environment Variables

```bash
# frontend/.env
VITE_AUTH_PROVIDER=hanko
VITE_HANKO_URL=https://login.hotosm.org
VITE_BASE_API_URL=https://fair.hotosm.org/api/v1/
```

---

## Auth Flow

| Step | What happens |
|------|-------------|
| 1. Login | Web component redirects to login service |
| 2. Auth | User authenticates, gets session cookie |
| 3. Return | Web component fires `hanko-login` event |
| 4. Status check | Web component calls `/auth/status/` |
| 5a. Mapped | `HankoAuthentication` resolves to `OsmUser` → authenticated |
| 5b. Not mapped | Redirected to onboarding at login service |
| 6. Onboarding | `OnboardingCallback` creates user + mapping |
| 7. Done | Redirect to frontend, user is authenticated |

---

## API Endpoints

```
# Hanko auth
GET  /api/v1/auth/status/       # Auth status check (web component)
GET  /api/v1/auth/onboarding/   # Onboarding callback (creates mapping)

# Admin mappings
GET    /api/admin/mappings      # List mappings
POST   /api/admin/mappings      # Create mapping
GET    /api/admin/mappings/{id} # Get mapping
PUT    /api/admin/mappings/{id} # Update mapping
DELETE /api/admin/mappings/{id} # Delete mapping

# Legacy (pre-existing)
GET  /api/v1/auth/login/        # Start OSM OAuth (returns login_url)
GET  /api/v1/auth/callback/     # OSM callback
GET  /api/v1/auth/me/           # User profile (used by both)
```
