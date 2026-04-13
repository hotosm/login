# uMap Implementation

**Stack:** Django (server-rendered) | **Repo:** `umap/`

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | Django (umap-project) |
| Frontend | Django templates (no SPA) + web component via CDN |
| Legacy Auth | OSM OAuth via `django-social-auth` |
| User Model | Django's `auth.User` (default, not custom) |
| Auth Mechanism | Custom `HankoUserMiddleware` sets `request.user` |
| Onboarding | Explicit `/onboarding` endpoint |
| OSM Required | No |

uMap is a server-rendered Django app. The key difference is a **custom `HankoUserMiddleware`** that maps the Hanko user to a Django user and sets `request.user`, making all existing `@login_required` decorators work without changes. The frontend uses Django templates with `<hotosm-auth>` loaded via CDN.

---

## Backend

### 1. Dependency

```toml
# app/pyproject.toml
dependencies = [
    "hotosm-auth[django]==0.2.10",
]
```

### 2. Configuration

```python
# app/settings.py

AUTH_PROVIDER = os.environ.get('AUTH_PROVIDER', 'legacy')

if AUTH_PROVIDER == 'hanko':
    HANKO_API_URL = os.environ.get('HANKO_API_URL')       # Internal URL for JWT validation
    HANKO_PUBLIC_URL = os.environ.get('HANKO_PUBLIC_URL', HANKO_API_URL)  # Public URL for web component
    COOKIE_SECRET = os.environ.get('COOKIE_SECRET')
    COOKIE_DOMAIN = os.environ.get('COOKIE_DOMAIN', None)
    COOKIE_SECURE = os.environ.get('COOKIE_SECURE', 'False').lower() == 'true'

    INSTALLED_APPS.append("hotosm_auth_django")

    # Context processor to expose auth settings to templates
    TEMPLATES[0]['OPTIONS']['context_processors'] += [
        'hotumap.context_processors.auth_settings',
    ]

    MIDDLEWARE = list(MIDDLEWARE)
    idx = MIDDLEWARE.index("django.contrib.auth.middleware.AuthenticationMiddleware")
    MIDDLEWARE.insert(idx, "hotosm_auth_django.HankoAuthMiddleware")
    MIDDLEWARE.append("hotumap.hanko_middleware.HankoUserMiddleware")
    MIDDLEWARE = tuple(MIDDLEWARE)
```

Note: uMap distinguishes `HANKO_API_URL` (internal, backend) from `HANKO_PUBLIC_URL` (public, templates).

Middleware order:

```
1. HankoAuthMiddleware       → sets request.hotosm.user (from JWT cookie)
2. AuthenticationMiddleware   → Django's default (sets request.user from session)
3. HankoUserMiddleware        → maps request.hotosm.user → request.user (Django user)
```

### 3. Auth Mechanism

A custom middleware that sets `request.user` from the Hanko mapping:

```python
# app/hotumap/hanko_middleware.py

class HankoUserMiddleware:
    """Sets request.user to the mapped Django user for Hanko auth."""

    def __call__(self, request):
        self._authenticate_hanko_user(request)
        response = self.get_response(request)
        self._clear_session_if_no_hanko(request, response)
        return response

    def _authenticate_hanko_user(self, request):
        if request.user.is_authenticated:
            return  # Already authenticated via Django session

        if not hasattr(request, 'hotosm') or not request.hotosm.user:
            return

        hanko_user = request.hotosm.user
        mapped_user_id = get_mapped_user_id(hanko_user, app_name="umap")

        if mapped_user_id:
            django_user = User.objects.get(id=int(mapped_user_id))
            request.user = django_user          # Makes @login_required work
            request._hanko_authenticated = True
            self._sync_hanko_user_data(django_user, hanko_user)
        else:
            request.needs_onboarding = True

    def _clear_session_if_no_hanko(self, request, response):
        """If Hanko cookie missing but Django session exists → logout (stale session)."""
        if not (hasattr(request, 'hotosm') and request.hotosm.user):
            if 'sessionid' in request.COOKIES and request.user.is_authenticated:
                logout(request)
                response.delete_cookie('sessionid', ...)

    def _sync_hanko_user_data(self, django_user, hanko_user):
        """Sync email/username from Hanko on each request."""
        if django_user.email != hanko_user.email:
            django_user.email = hanko_user.email
            new_username = hanko_user.email.split('@')[0]
            if not User.objects.filter(username=new_username).exclude(id=django_user.id).exists():
                django_user.username = new_username
            django_user.save(update_fields=['email', 'username'])
```

**Context processor** exposes auth settings to all templates:

```python
# app/hotumap/context_processors.py

def auth_settings(request):
    return {
        'AUTH_PROVIDER': getattr(settings, 'AUTH_PROVIDER', 'legacy'),
        'HANKO_PUBLIC_URL': hanko_public_url,
        'SITE_URL': getattr(settings, 'SITE_URL', '/'),
        'COOKIE_DOMAIN': getattr(settings, 'COOKIE_DOMAIN', ''),
    }
```

### 4. Onboarding

Explicit `/onboarding` endpoint. Uses `ON CONFLICT DO UPDATE` for idempotent mapping creation:

```python
# app/hotumap/views.py

class OnboardingCallback(View):
    def get(self, request):
        hanko_user = request.hotosm.user
        is_new_user = request.GET.get('new_user') == 'true'

        if is_new_user:
            # Check existing mapping (idempotent)
            # Check OSM connection for existing account
            # If truly new → create Django user + mapping
            user = create_umap_user(username=hanko_user.email.split('@')[0], email=hanko_user.email)
            _upsert_user_mapping(hanko_user.id, str(user.id))
            return HttpResponseRedirect(SITE_URL)
        else:
            # Legacy user → needs OSM connection to find existing account
            osm_connection = request.hotosm.osm
            if not osm_connection:
                return HttpResponseRedirect('/api/v1/auth/osm/login/')  # Get OSM ID first

            # Find by: 1) OSM ID (via social_auth), 2) email
            existing_user = find_legacy_user_by_osm_id(osm_id) or find_legacy_user_by_email(hanko_user.email)
            if not existing_user:
                return HttpResponseRedirect(f"{login_url}/app?error=...")

            _upsert_user_mapping(hanko_user.id, str(existing_user.id))
            return HttpResponseRedirect(SITE_URL)
```

```python
def _upsert_user_mapping(hanko_user_id, app_user_id, app_name="umap"):
    """Raw SQL with ON CONFLICT DO UPDATE for idempotent mapping."""
    cursor.execute("""
        INSERT INTO hanko_user_mappings (hanko_user_id, app_user_id, app_name, created_at)
        VALUES (%s, %s, %s, NOW())
        ON CONFLICT (hanko_user_id) DO UPDATE
            SET app_user_id = EXCLUDED.app_user_id, updated_at = NOW()
    """, [hanko_user_id, app_user_id, app_name])
```

**Auth Status** — same pattern as fAIr:

```python
class AuthStatus(APIView):
    def get(self, request):
        # Returns: auth_provider, authenticated, needs_onboarding,
        # user info (id, username, email), hanko_user info (id, email)
```

**Login view override** — redirects to login service with i18n:

```python
# app/hotumap/hanko_views.py

def login_view(request):
    if hasattr(request, 'hotosm') and request.hotosm.user:
        return redirect(next_url or reverse('user_dashboard'))
    lang = request.path.strip('/').split('/')[0]  # /es/login/ → es
    return redirect(f"{hanko_url}/app?return_to={return_to}&lang={lang}")
```

### 5. Helper Functions

```python
# app/hotumap/hanko_helpers.py

def find_legacy_user_by_osm_id(osm_id)  # Find via social_auth (UserSocialAuth table)
def find_legacy_user_by_email(email)     # Fallback: find by email
def create_umap_user(username, email)    # Create Django user, handle username conflicts
```

### 6. URLs

```python
# app/urls.py

path('api/v1/auth/', include('hotumap.auth_urls')),
path('api/v1/maps/', include('hotumap.maps_urls')),

if AUTH_PROVIDER == 'hanko':
    # Admin mapping routes (JSON wrapper)
    urlpatterns += [path('api/admin/', include(hanko_admin_patterns))]
    # Override login with i18n support
    urlpatterns += i18n_patterns(path('login/', hanko_views.login_view, name='login'))

# app/hotumap/auth_urls.py
urlpatterns = [
    path("osm/login/", osm_login),           # OSM OAuth (from hotosm_auth_django)
    path("osm/callback/", osm_callback),       # OSM callback (from hotosm_auth_django)
    path("onboarding/", views.OnboardingCallback.as_view()),
    path("status/", views.AuthStatus.as_view()),
]
```

### 7. Environment Variables

```bash
AUTH_PROVIDER=hanko
HANKO_API_URL=https://login.hotosm.org       # Internal URL for JWT validation
HANKO_PUBLIC_URL=https://login.hotosm.org     # Public URL for web component
COOKIE_SECRET=your-32-byte-secret-key-here
COOKIE_DOMAIN=.hotosm.org
COOKIE_SECURE=true
ADMIN_EMAILS=admin@hotosm.org
```

---

## Frontend (Django Templates)

### 1. Web Component

Loaded via CDN (not npm) in a Django template:

```html
<!-- app/custom/templates/umap/header.html -->

{% if AUTH_PROVIDER == 'hanko' %}
<script type="module" src="https://cdn.jsdelivr.net/npm/@hotosm/hanko-auth@0.5.2/dist/hanko-auth.esm.js"></script>
{% endif %}
```

Two instances for responsive design in the navigation template:

```html
<!-- app/custom/templates/umap/navigation.html -->
{% get_current_language as CURRENT_LANG %}

<!-- Mobile -->
<hotosm-auth
  hanko-url="{{ HANKO_PUBLIC_URL }}"
  base-path="{{ HANKO_PUBLIC_URL }}"
  redirect-after-login="{{ SITE_URL }}"
  redirect-after-logout="{{ SITE_URL }}"
  mapping-check-url="/api/v1/auth/status/"
  app-id="umap"
  button-variant="filled"
  display="bar"
  lang="{{ CURRENT_LANG }}"
/>

<!-- Desktop (same but without display="bar") -->
```

Attributes use Django template variables (`{{ HANKO_PUBLIC_URL }}`, `{{ SITE_URL }}`, `{{ CURRENT_LANG }}`).

### 2. Auth Logic

Inline script in navigation template:

```html
{% if AUTH_PROVIDER == 'hanko' %}
<script>
  customElements.whenDefined('hotosm-auth').then(() => {
    document.querySelectorAll('hotosm-auth').forEach(auth => {
      auth.addEventListener('hanko-login', (e) => {
        localStorage.setItem('hotosm-auth-user', JSON.stringify(e.detail.user));
      });
      auth.addEventListener('logout', () => {
        localStorage.removeItem('hotosm-auth-user');
      });
    });
  });
</script>
{% endif %}
```

Conditional UI in templates:

```html
<!-- Hide legacy login link when using Hanko (web component handles it) -->
{% if AUTH_PROVIDER != 'hanko' and not user.is_authenticated %}
  <a href="{% url 'login' %}">Log in / Sign in</a>
{% endif %}

<!-- Hide "My profile" for Hanko users (profile managed by login service) -->
{% if UMAP_ALLOW_EDIT_PROFILE and request.user.is_authenticated and not hanko_authenticated %}
  <a href="{% url 'user_profile' %}">My profile</a>
{% endif %}
```

### 3. Environment Variables

No frontend-specific env vars — everything comes from Django context processor via template variables.

---

## Auth Flow

| Step | What happens |
|------|-------------|
| 1. Login | Web component redirects to login service (`HANKO_PUBLIC_URL`) |
| 2. Auth | User authenticates at login.hotosm.org, gets JWT cookie |
| 3. Return | Login service redirects to `SITE_URL` |
| 4. Page load | `HankoAuthMiddleware` validates JWT → `HankoUserMiddleware` sets `request.user` |
| 5a. Mapped | `request.user` = Django user → `@login_required` works |
| 5b. Not mapped | Web component checks `/api/v1/auth/status/` → redirects to onboarding |
| 6. Onboarding | `OnboardingCallback` creates user + mapping |
| 7. Done | Page reload, user is mapped → authenticated |

**Legacy user recovery:**

1. User selects "I had an account" in onboarding
2. No OSM cookie → redirects through OSM OAuth (`/api/v1/auth/osm/login/`)
3. After OAuth → looks up `UserSocialAuth` by OSM ID
4. Finds existing Django user → creates mapping → user's maps accessible

---

## API Endpoints

```
# Hanko auth
GET  /api/v1/auth/status/          # Auth status check (web component)
GET  /api/v1/auth/onboarding/      # Onboarding callback (creates mapping)
GET  /api/v1/auth/osm/login/       # OSM OAuth start (for legacy user recovery)
GET  /api/v1/auth/osm/callback/    # OSM OAuth callback

# Maps
GET  /api/v1/maps/                 # User's maps (login_required)

# Admin mappings
GET    /api/admin/mappings/        # List mappings
POST   /api/admin/mappings/        # Create mapping
GET    /api/admin/mappings/{id}/   # Get mapping
PUT    /api/admin/mappings/{id}/   # Update mapping
DELETE /api/admin/mappings/{id}/   # Delete mapping

# Login (i18n, overridden for Hanko)
GET  /{lang}/login/                # Redirects to login service
```
