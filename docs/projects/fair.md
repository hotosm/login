# fAIr Implementation

**Stack:** Django + React | **Repo:** `fAIr/` | **Branch:** `login_hanko` (vs `develop`)

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | Django |
| Type | With User Mapping |
| OSM Required | Yes (legacy) |

fAIr uses Django with middleware to inject `request.hotosm` into each request.
The `HankoUserFilterMixin` filters querysets by the mapped user.

---

## Backend

### 1. Dependency

```toml
# backend/pyproject.toml
dependencies = [
    "hotosm-auth[django] @ git+https://github.com/hotosm/login.git@auth-libs-v0.2.2#subdirectory=auth-libs/python",
]
```

### 2. Initialization

```python
# backend/fairproject/settings.py

AUTH_PROVIDER = env("AUTH_PROVIDER", default="legacy")

# Hanko SSO Configuration
if AUTH_PROVIDER == "hanko":
    HANKO_API_URL = env("HANKO_API_URL")
    COOKIE_SECRET = env("COOKIE_SECRET")
    COOKIE_DOMAIN = env("COOKIE_DOMAIN", default=None)
    COOKIE_SECURE = env.bool("COOKIE_SECURE", default=not DEBUG)

# INSTALLED_APPS
INSTALLED_APPS = [
    ...
    'rest_framework',  # fAIr ya lo tenía
    ...
]

if AUTH_PROVIDER == "hanko":
    INSTALLED_APPS.append("hotosm_auth_django")

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    ...
]

if AUTH_PROVIDER == "hanko":
    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware"),
        "hotosm_auth_django.HankoAuthMiddleware",
    )
```

### 3. Protected Routes

#### How the Middleware Works

The `HankoAuthMiddleware` adds `request.hotosm` to **every request**:

```python
request.hotosm.user  # HankoUser (or None if not authenticated)
request.hotosm.osm   # OSMConnection (or None if not connected)
```

#### Protect Endpoints

```python
# backend/login/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ProtectedView(APIView):
    def get(self, request):
        # Verify authentication
        if not hasattr(request, 'hotosm') or not request.hotosm.user:
            return Response(
                {"error": "Not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        hanko_user = request.hotosm.user
        return Response({
            "user_id": hanko_user.id,
            "email": hanko_user.email,
        })

class OSMRequiredView(APIView):
    def get(self, request):
        if not request.hotosm.user:
            return Response({"error": "Not authenticated"}, status=401)

        if not request.hotosm.osm:
            return Response({"error": "OSM connection required"}, status=403)

        osm = request.hotosm.osm
        return Response({
            "osm_username": osm.osm_username,
            "osm_user_id": osm.osm_user_id,
        })
```

### 4. User Mapping

#### HankoUserFilterMixin

The mixin filters querysets by the mapped user:

```python
# backend/login/hanko_helpers.py

class HankoUserFilterMixin:
    """Filters querysets by the mapped Hanko user."""

    def get_queryset(self):
        qs = super().get_queryset()

        if hasattr(self.request, 'hotosm') and self.request.hotosm.user:
            from hotosm_auth_django import get_mapped_user_id
            app_user_id = get_mapped_user_id(
                self.request.hotosm.user,
                app_name="fair"
            )
            if app_user_id:
                return qs.filter(created_by_id=app_user_id)

        return qs
```

#### Usage in ViewSets

```python
# backend/core/views.py

from login.hanko_helpers import HankoUserFilterMixin

class DatasetViewSet(HankoUserFilterMixin, BaseSpatialViewSet):
    """ViewSet that filters datasets by the current user."""
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    public_methods = ["GET"]
```

### 5. URLs (Admin Routes)

```python
# backend/fairproject/urls.py

from django.conf import settings
from django.urls import path, include

admin_mapping_patterns = []
if getattr(settings, 'AUTH_PROVIDER', 'legacy') == 'hanko':
    try:
        from hotosm_auth_django.admin_routes import create_admin_urlpatterns
        admin_mapping_patterns = create_admin_urlpatterns(
            app_name="fair",
            user_model="login.OsmUser",
            user_id_column="osm_id",
            user_name_column="username",
            user_email_column="email",
        )
    except ImportError:
        pass

urlpatterns = [
    path("api/v1/auth/", include("login.urls")),
    path("api/v1/", include("core.urls")),
    path("api/admin/", include(admin_mapping_patterns)),
]
```

### 6. Configuration (.env)

```bash
# backend/.env

AUTH_PROVIDER=hanko

# Hanko SSO
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret
COOKIE_DOMAIN=.hotosm.org

# OSM OAuth
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
OSM_LOGIN_REDIRECT_URI=https://fair.hotosm.org/api/v1/auth/callback/
OSM_SECRET_KEY=your-osm-secret-key

# Admin
ADMIN_EMAILS=admin@hotosm.org
```

---

## Frontend

### 1. Web Component

```tsx
// frontend/src/components/ui/navbar/navbar.tsx

export function Navbar() {
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

### 2. Configuration (.env)

```bash
# frontend/.env

VITE_AUTH_PROVIDER=hanko
VITE_HANKO_URL=https://login.hotosm.org
```

> **Note:** `VITE_HANKO_URL` is the only URL needed. It points to the login service that handles both Hanko authentication and OSM OAuth endpoints.

---

## Framework Notes

### Middleware Order

The `HankoAuthMiddleware` must be **before** `AuthenticationMiddleware`:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'hotosm_auth_django.HankoAuthMiddleware',  # <- Before auth
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    ...
]
```

### Import Order

!!! warning "Django App Registry"
    `admin_routes` imports from `rest_framework` which requires apps to be ready.
    Import directly from the module:

    ```python
    # Correct
    from hotosm_auth_django.admin_routes import create_admin_urlpatterns

    # Incorrect (causes AppRegistryNotReady)
    from hotosm_auth_django import create_admin_urlpatterns
    ```

### Middleware vs Mixin

| Component | Purpose |
|-----------|---------|
| **Middleware** | Injects `request.hotosm` in each request |
| **Mixin** | Filters querysets by mapped user |

---

## Key Changes (vs `develop` branch)

### settings.py

```diff
+ AUTH_PROVIDER = env("AUTH_PROVIDER", default="legacy")

+ if AUTH_PROVIDER == "hanko":
+     HANKO_API_URL = env("HANKO_API_URL")
+     COOKIE_SECRET = env("COOKIE_SECRET")
+     INSTALLED_APPS.append("hotosm_auth_django")

+ if AUTH_PROVIDER == "hanko":
+     MIDDLEWARE.insert(
+         MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware"),
+         "hotosm_auth_django.HankoAuthMiddleware",
+     )
```

### urls.py

```diff
+ from hotosm_auth_django.admin_routes import create_admin_urlpatterns

+ admin_mapping_patterns = create_admin_urlpatterns(
+     app_name="fair",
+     user_model="login.OsmUser",
+     ...
+ )

+ path("api/admin/", include(admin_mapping_patterns)),
```

---

## API Endpoints

```
# Auth (legacy OSM login)
POST /api/v1/auth/login/        # Start OSM OAuth
GET  /api/v1/auth/callback/     # OSM callback

# Admin mappings (Hanko)
GET    /api/admin/mappings      # List mappings
POST   /api/admin/mappings      # Create mapping
GET    /api/admin/mappings/{id} # Get mapping
PUT    /api/admin/mappings/{id} # Update mapping
DELETE /api/admin/mappings/{id} # Delete mapping
```
