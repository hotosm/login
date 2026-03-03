# HOTOSM Auth Library - Python

FastAPI/Django integration for Hanko SSO authentication with OSM OAuth support.

## Installation

```bash
# Core only
pip install hotosm-auth

# With FastAPI support
pip install hotosm-auth[fastapi]

# With Django support
pip install hotosm-auth[django]
```

## Usage

### FastAPI

```python
from fastapi import FastAPI
from hotosm_auth_fastapi import setup_auth, Auth

app = FastAPI()
setup_auth(app)

@app.get("/me")
async def get_me(auth: Auth):
    return {"id": auth.user.id, "email": auth.user.email}
```

### Django

```python
# settings.py
INSTALLED_APPS = [..., 'hotosm_auth_django']
MIDDLEWARE = [..., 'hotosm_auth_django.HankoAuthMiddleware']

# views.py
from hotosm_auth_django import login_required

@login_required
def my_view(request):
    return JsonResponse({"user_id": request.hotosm.user.id})
```

## Configuration

Set these environment variables:

```bash
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret
COOKIE_DOMAIN=.hotosm.org

# Optional: OSM OAuth
OSM_CLIENT_ID=your_osm_client_id
OSM_CLIENT_SECRET=your_osm_secret
```

## Development

### Running Tests

```bash
# Install dev dependencies
uv sync --extra dev

# Run core tests (no framework dependencies)
uv run pytest

# Run with FastAPI tests
uv run --extra fastapi pytest

# Run with Django tests
uv run --extra django pytest

# Run all tests (FastAPI + Django)
uv run --extra fastapi --extra django pytest

# Run with coverage
uv run --extra fastapi --extra django pytest --cov=src --cov-report=term-missing
```

### Test Structure

**Core tests** (no framework dependencies):
- `tests/test_config.py` - Configuration loading and validation
- `tests/test_crypto.py` - Cookie encryption/decryption
- `tests/test_exceptions.py` - Exception hierarchy
- `tests/test_models.py` - HankoUser and OSMConnection models
- `tests/test_jwt_validator.py` - JWT payload parsing
- `tests/test_jwt_validation.py` - Full JWT validation with mocked JWKS
- `tests/test_osm_cookie.py` - OSM connection cookie round-trip
- `tests/test_osm_oauth.py` - OSM OAuth client with mocked HTTP

**FastAPI tests** (require `[fastapi]` extra):
- `tests/test_fastapi_setup.py` - Auth dependency setup
- `tests/test_fastapi_dependencies.py` - Dependency injection with mocked requests
- `tests/test_fastapi_osm_routes.py` - OSM OAuth routes (login, callback, status, disconnect)
- `tests/test_admin_routes.py` - Admin CRUD routes with mocked database

**Django tests** (require `[django]` extra):
- `tests/test_django_middleware.py` - Middleware and decorators
- `tests/test_django_osm_views.py` - OSM OAuth views
- `tests/test_django_admin_routes.py` - Admin CRUD routes with mocked database

### Test Coverage

Run with coverage report:
```bash
uv run --extra fastapi --extra django pytest --cov=src --cov-report=term-missing
```

Current coverage: **72%** (127 tests)

## Features

- JWT validation for Hanko tokens (RS256 with JWKS)
- OSM OAuth 2.0 integration
- Encrypted httpOnly cookies for OSM connection
- User mapping between Hanko and application users
- FastAPI and Django integrations

## License

AGPL-3.0
