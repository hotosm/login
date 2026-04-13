# Admin: User Mapping Management

Admins can manage user mappings across all apps from a single dashboard at the login service.

---

## Access Control

Admin access is controlled by the `ADMIN_EMAILS` env var in each app's backend:

```bash
ADMIN_EMAILS=alice@hotosm.org,bob@hotosm.org
```

Any user whose Hanko account email matches one of these addresses is an admin. The check happens at the JWT level — no database role needed.

---

## Dashboard

Navigate to **`https://login.hotosm.org/app/admin`** (or `dev.login.hotosm.org/app/admin` in dev).

The dashboard shows:

- **User stats** — total registered users, new signups by period (today / week / month / year), auth methods (passkey vs Google)
- **Per-app mappings** — the `hanko_user_id → app_user_id` mapping table for each app, enriched with Hanko email and app username
- **User search** — find any user by email across all apps
- **Mapping CRUD** — create, update, delete mappings manually

The login service acts as a **proxy**: it validates admin access once, then forwards requests to each app's `/api/admin/mappings` endpoint with the JWT cookie.

```
Browser → login.hotosm.org/api/admin/{app}/mappings
        → {app_backend}/api/admin/mappings   (proxied with JWT)
        → App validates JWT + admin check → returns data
```

---

## App-Side Setup

Each app must expose admin endpoints so the proxy can reach them.

### FastAPI

```python
from hotosm_auth_fastapi import create_admin_mappings_router

# In lifespan or startup
admin_router = create_admin_mappings_router(get_db, app_name="drone-tm")
app.include_router(admin_router, prefix="/api")
```

This creates:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/mappings` | List mappings (paginated) |
| `POST` | `/api/admin/mappings` | Create a mapping |
| `GET` | `/api/admin/mappings/{hanko_user_id}` | Get one mapping |
| `PUT` | `/api/admin/mappings/{hanko_user_id}` | Update a mapping |
| `DELETE` | `/api/admin/mappings/{hanko_user_id}` | Delete a mapping |

All endpoints require admin access (email in `ADMIN_EMAILS`).

### Django

```python
from hotosm_auth_django.admin_routes import create_admin_urlpatterns

# urls.py
urlpatterns += [
    path("api/admin/", include(create_admin_urlpatterns(
        app_name="fair",
        user_model="users.User",       # optional: enrich with app username/email
        user_id_column="id",
        user_name_column="username",
        user_email_column="email",
    )))
]
```

Same endpoints as FastAPI. With `user_model` set, each mapping in the list response is enriched with the app's username and email alongside the Hanko data.

### Litestar

```python
from hotosm_auth_litestar import create_admin_mappings_router, setup_auth

admin_router = create_admin_mappings_router(get_db, app_name="my-app")
deps, route_handlers = setup_auth()
app = Litestar(route_handlers=[*route_handlers, admin_router], dependencies=deps)
```

Same endpoints as FastAPI.

---

## Custom Admin Endpoints

To protect your own admin endpoints with the same email check:

### FastAPI

```python
from hotosm_auth_fastapi import AdminUser

@router.get("/api/admin/stats")
async def get_stats(admin: AdminUser):
    # admin is a HankoUser — email already verified as admin
    return {"requested_by": admin.email}
```

### Django

```python
from hotosm_auth_django.admin_routes import is_admin_user
from rest_framework.response import Response
from rest_framework.views import APIView

class MyAdminView(APIView):
    def get(self, request):
        if not is_admin_user(request):
            return Response({"detail": "Admin access required"}, status=403)
        return Response({"ok": True})
```

### Litestar

```python
from litestar import get
from hotosm_auth_litestar import AdminUser

@get("/api/admin/stats")
async def get_stats(admin: AdminUser) -> dict:
    # admin is a HankoUser — email already verified as admin
    return {"requested_by": admin.email}
```

---

## Login Backend Config

The login backend needs to know each app's internal URL to proxy requests:

```bash
# docker-compose / k8s env
DRONETM_BACKEND_URL=https://dev.drone.hotosm.org
FAIR_BACKEND_URL=https://fair-dev.hotosm.org
UMAP_BACKEND_URL=https://umap-dev.hotosm.org
```

These map to the app keys used in the proxy: `drone-tm`, `fair`, `umap`.

---

## Proxy Endpoints (Login Backend)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/check` | Check if current user is admin |
| `GET` | `/api/admin/apps` | List configured apps |
| `GET` | `/api/admin/{app}/mappings` | List mappings for an app (enriched with Hanko emails) |
| `GET` | `/api/admin/{app}/mappings/{hanko_user_id}` | Get one mapping |
| `POST` | `/api/admin/{app}/mappings` | Create a mapping |
| `PUT` | `/api/admin/{app}/mappings/{hanko_user_id}` | Update a mapping |
| `DELETE` | `/api/admin/{app}/mappings/{hanko_user_id}` | Delete a mapping |
