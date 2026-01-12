# HOTOSM Auth Library - Python

FastAPI/Django integration for Hanko authentication with OSM OAuth support.

## Installation

```bash
pip install hotosm-auth
```

## Usage

### FastAPI

```python
from fastapi import FastAPI, Depends
from hotosm_auth.integrations.fastapi import CurrentUser

app = FastAPI()

@app.get("/me")
async def get_me(user: CurrentUser):
    return {"id": user.id, "email": user.email}
```

### Django

```python
from django.http import JsonResponse
from hotosm_auth.integrations.django import require_auth

@require_auth
def my_view(request):
    return JsonResponse({"user_id": request.user.id})
```

## Features

- JWT validation for Hanko tokens
- OSM OAuth 2.0 integration
- User mapping between Hanko and application users
- FastAPI and Django integrations

## Configuration

Set these environment variables:

```bash
HANKO_API_URL=https://login.hotosm.org
OSM_CLIENT_ID=your_osm_client_id
OSM_CLIENT_SECRET=your_osm_secret
COOKIE_SECRET=your_secret_key
```

## License

AGPL-3.0
