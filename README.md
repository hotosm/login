# HOTOSM Login (SSO)

Centralized authentication and user management service for all HOTOSM applications using Hanko + OSM
OAuth.

For context behind this decision, see: [ADR-0011: SSO Authentication](https://docs.hotosm.org/decisions/0011-sso-auth/)

## Architecture

The login service consists of four main components:

- **Hanko**: Core authentication service (JWT sessions, passkeys, passwords)
- **Backend**: FastAPI service for custom auth logic (OSM OAuth, user mapping)
- **Frontend**: React application for login UI and user management
- **OSM-userinfo**: Go service for fetching OpenStreetMap user information

All services run with Docker Compose locally and are deployed to Kubernetes
([hotosm/k8s-infra](https://github.com/hotosm/k8s-infra)).

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/hotosm/login.git
cd login
```

### 2. Set up environment

```bash
# Create .env file (optional, has defaults)
cp .env.example .env
```

### 3. Run with Docker Compose

```bash
# Development mode (with hot-reload)
docker compose --profile dev up --build

# Production mode (optimized builds)
docker compose --profile prod up --build
```

### 4. Access the services

### Development mode

- Hanko API: <https://dev.login.hotosm.org>
- Frontend: <https://app.dev.login.hotosm.org>
- Backend API: <https://dev.login.hotosm.org/api>
- Hanko Elements: <https://elements.login.hotosm.org>
- Demo: <https://demo.login.hotosm.org>

### Production mode

- Hanko API: <https://login.hotosm.org>
- Frontend: <https://app.login.hotosm.org>
- Backend API: <https://login.hotosm.org/api>

All services are behind Traefik reverse proxy with automatic Let's Encrypt SSL.

## Services

### Hanko

JWT-based authentication with support for:

- Passkeys (WebAuthn)
- Email/password
- OAuth providers (configured via config.yaml)

### Backend (FastAPI)

Custom authentication logic:

- OSM OAuth integration
- User ID mapping between Hanko and applications
- Session validation endpoints

Located in `backend/` directory.

### Frontend (React + Vite)

Login UI with:

- Hanko auth component integration
- OSM account linking
- Profile management

Located in `frontend/` directory.

### OSM-userinfo (Go)

Fetches OpenStreetMap user information using OAuth tokens.

Located in `osm-userinfo/` directory.

## Development

### Testing Docker Builds Locally

Before pushing changes, test that all builds work:

```bash
# Backend
docker build --target production -t test-backend ./backend
docker build --target dev -t test-backend-dev ./backend

# Frontend
docker build --target production -t test-frontend ./frontend
docker build --target dev -t test-frontend-dev ./frontend

# OSM-userinfo
docker build -t test-osm-userinfo ./osm-userinfo
```

### Auth-libs Integration

### Python library

- Located in `auth-libs/python/`
- Installed via pip during Docker build

### Web component

- Source: `frontend/auth-libs/web-component/`
- Published to npm as `@hotosm/hanko-auth`
- Other HOT projects install from npm:

  ```bash
  pnpm add @hotosm/hanko-auth
  pnpm add @awesome.me/webawesome  # peer dependency
  ```

### Web Component Development

- Edit source in respective directories
- Build web component: `cd frontend/auth-libs/web-component && pnpm build`
- Frontend imports from `../auth-libs/web-component/dist/hanko-auth.esm.js`

## Deployment

Both environments run in Kubernetes, managed with ArgoCD in
[hotosm/k8s-infra](https://github.com/hotosm/k8s-infra).

| | Production | Dev |
|---|---|---|
| Domain | `login.hotosm.org` | `dev.login.hotosm.org` |
| Branch | `main` | `develop` |
| Workflow | `build-prod.yml` | `build-dev.yml` |
| Image tags | release version | commit SHA |
| Deploy | bump the chart in `apps/login.yaml` | update the image tags in `apps/staging/login` |

## Configuration

### Environment Variables

### Hanko Service

- Configured via `config.yaml` (production) or `config_dev.yaml` (development)
- See [Hanko documentation](https://docs.hanko.io/) for configuration options

### Backend

- `HANKO_URL`: Hanko API URL (default: <http://hanko:8000>)
- `OSM_CLIENT_ID`: OSM OAuth client ID
- `OSM_CLIENT_SECRET`: OSM OAuth client secret

### Frontend

- `VITE_HANKO_URL`: Hanko API URL for frontend
- `VITE_BACKEND_URL`: Backend API URL
- `VITE_PORTAL_URL`: Portal URL (public profiles)

### Database

- `POSTGRES_USER`: Database user (default: hanko)
- `POSTGRES_PASSWORD`: Database password (set in .env)
- `POSTGRES_DB`: Database name (default: hanko)

## Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f hanko
docker compose logs -f backend
docker compose logs -f frontend
```

### Health Checks

- Backend: <https://dev.login.hotosm.org/api/health>
- Frontend: <https://app.dev.login.hotosm.org/> (nginx responds)

## Troubleshooting

### Build Failures

1. **"too many links" error in backend build:**
   - This happens if auth-libs wheel file has hard links
   - Solution: Recopy auth-libs using `cat` to break links (already fixed in Dockerfile)

2. **Frontend TypeScript errors:**
   - Check that `hotosm-auth` component props are boolean, not strings
   - Verify auth-libs web component exists in `frontend/auth-libs/web-component/dist/`

3. **Missing auth-libs in Docker build:**
   - Ensure dist files are committed:
     `git add -f backend/auth-libs/python/dist/*.whl frontend/auth-libs/web-component/dist/*.js`
   - Run distribute script from auth-libs repo

### Deployment Issues

1. **GitHub Actions failing:**
   - Check that all required secrets are configured
   - Verify EC2 server is accessible via SSH
   - Check EC2 has enough disk space: `df -h`

2. **Services not starting:**
   - Check logs: `docker compose logs -f`
   - Verify environment variables in .env
   - Ensure database is healthy: `docker compose ps`

## Architecture Decisions

### Why Hanko?

- Modern, open-source authentication
- Built-in passkey support (WebAuthn)
- JWT-based sessions
- Self-hosted for data sovereignty

### Why Custom Backend?

- OSM OAuth integration (not natively supported by Hanko)
- User ID mapping between Hanko users and application-specific users
- Custom session validation logic

### Why Traefik?

- Automatic Let's Encrypt SSL certificates
- Dynamic service discovery
- Load balancing and routing
- Single entry point for all services

## Integration Example

### Python Backend

```python
from hotosm_auth.integrations.fastapi import CurrentUser

@router.get("/me")
async def get_me(user: CurrentUser):
    """Get current authenticated user."""
    return {
        "id": user.id,
        "email": user.email
    }
```

### React Frontend

```tsx
import '../auth-libs/web-component/dist/hanko-auth.esm.js';

function LoginPage() {
  return (
    <hotosm-auth
      hanko-url="https://login.hotosm.org"
      show-profile={true}
      redirect-after-login="/"
      osm-required={true}
      auto-connect={true}
    />
  );
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and
AI-assisted coding policy.

## License

GNU Affero General Public License v3.0 (AGPL-3.0)

See LICENSE file for complete terms.
