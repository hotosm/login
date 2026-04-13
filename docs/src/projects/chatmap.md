# ChatMap Implementation

**Stack:** FastAPI + React | **Repo:** `chatmap/`

## Overview

| Aspect | Detail |
|--------|--------|
| Framework | FastAPI |
| Type | Simple (no mapping) |
| OSM | Not used |
| Admin routes | No |

ChatMap uses Hanko JWT directly — the Hanko `user.id` is stored as `owner_id` in the database. No legacy users, no mapping.

---

## Backend

### 1. Dependency

```toml
# chatmap-api/pyproject.toml
dependencies = [
    "hotosm-auth[fastapi]==0.2.10",
]
```

### 2. Initialization

```python
# chatmap-api/main.py
from hotosm_auth_fastapi import setup_auth, CurrentUser, CurrentUserOptional

app = FastAPI()
setup_auth(app)  # Loads from env, adds CORS, registers OSM routes
```

`setup_auth(app)` is the single-line variant — equivalent to calling `init_auth(AuthConfig.from_env())` manually.

### 3. Protected Routes

```python
@api_router.get("/qr")
async def qr(user: CurrentUser):
    """Requires authentication."""
    return {"owner_id": user.id}

@api_router.get("/map/{map_id}")
async def get_map(map_id: str, user: CurrentUserOptional):
    """Public endpoint, optional auth."""
    if user:
        # show private maps owned by user
        ...
```

### 4. Configuration (.env)

```bash
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-32-byte-secret

# JWT (set when running locally against dev Hanko)
JWT_ISSUER=https://login.hotosm.org
```

---

## Frontend

### 1. Web Component

```jsx
// Dynamic import to avoid SSR issues
import('@hotosm/hanko-auth');
```

```jsx
<hotosm-auth
  hanko-url={config.HANKO_API_URL}
  redirect-after-login="/"
  show-profile
/>
```

Auth state is managed via web component events:

```js
document.addEventListener('hanko-login', (e) => { /* user logged in */ });
document.addEventListener('logout', () => { /* user logged out */ });
```

### 2. Configuration

ChatMap frontend uses a `config.json` file injected at deploy time (via `envsubst`):

```json
{
  "HANKO_API_URL": "https://login.hotosm.org",
  "ENABLE_AUTH": true
}
```
