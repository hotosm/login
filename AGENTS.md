<!-- markdownlint-disable MD013 MD025 -->

# AGENTS.md

Machine-readable operating guidance for AI coding agents in **hotosm/login**.

Project: **HOTOSM Login (SSO)**  
Accountability: human maintainers are responsible for all merged changes.

---

# 1) Current Architecture (Authoritative)

This repository is a multi-service login platform, not a single backend app.

Primary components:

- `backend/`: FastAPI service (auth endpoints, profile endpoints, admin proxy routes)
- `frontend/`: React + Vite SPA for login/profile UX
- `auth-libs/`: shared auth libraries
  - `auth-libs/python/`: `hotosm_auth` core + integrations for FastAPI, Django, and **Litestar** (`hotosm_auth_litestar`)
  - `auth-libs/web-component/`: `@hotosm/hanko-auth` web component source + dist bundles
- `osm-userinfo/`: Go microservice to adapt OSM user info into OIDC-like claims for Hanko
- `docker-compose.yml`: service orchestration (Traefik, Hanko, Postgres, backend, frontend, osm-userinfo)

Backend structure to follow:

- Routes in `backend/app/api/routes/`
- Config in `backend/app/core/`
- Database models/session in `backend/app/db/`
- Request/response schemas in `backend/app/schemas/`

---

# 2) Required Reading Order

Before non-trivial changes, read:

1. `README.md`
2. Relevant docs under `docs/src/` (especially `overview.md`, `integration-guide.md`)
3. Component-level docs:
   - `auth-libs/README.md`
   - `auth-libs/python/README.md`
   - `auth-libs/web-component/README.md`
   - `osm-userinfo/README.md`

Notes:

- There is no local `docs/decisions/` tree in this repo.
- High-level ADR context is linked from `README.md` (external docs).

---

# 3) Agent Workflow Contract

Use this execution loop:

1. Discover
   - Inspect existing code paths first.
   - Preserve established patterns per component (FastAPI in backend, React in frontend).
2. Plan
   - Keep edits minimal and task-scoped.
   - Identify tests/checks to run before coding.
3. Implement
   - Keep FastAPI route handlers thin where possible.
   - Prefer shared logic in reusable modules/services when adding cross-route behavior.
   - For auth-libs, keep framework integrations aligned (FastAPI/Django/Litestar).
4. Verify
   - Run focused checks first, then broader checks if needed.
   - Report what was run and what could not be run.
5. Summarize
   - List changed files and behavior impact.
   - List risks/follow-ups.

For larger changes, prefer incremental, reviewable patches.

---

# 4) Commands (Use These)

Root-level Docker/dev stack:

```bash
cp .env.example .env
docker compose --profile dev up --build
```

Production-like local stack:

```bash
docker compose --profile prod up --build
```

Backend local development:

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend checks:

```bash
cd backend
uv run ruff check app
uv run ruff format app
uv run pytest -v
```

Frontend local development:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend checks:

```bash
cd frontend
pnpm lint
pnpm build
pnpm test
```

Auth-libs Python local checks:

```bash
cd auth-libs/python
uv sync
uv run pytest -v
```

Pre-commit hooks (repo root):

```bash
pre-commit install
pre-commit run --all-files
```

Hook config is in `.pre-commit-config.yaml` and includes commitizen, ruff/ruff-format, uv-lock, pyupgrade, complexipy, typos, bashate, shellcheck, actionlint, and markdownlint.

---

# 5) Coding Standards

- Prefer explicit, readable code over clever abstractions.
- Keep functions and endpoints focused.
- Reuse existing schemas/models/config patterns.
- Avoid comments unless intent is non-obvious.
- Keep framework boundaries clear:
  - FastAPI-specific logic in `backend/`
  - reusable auth primitives in `auth-libs/python/src/hotosm_auth`
  - framework adapters in `hotosm_auth_fastapi`, `hotosm_auth_django`, `hotosm_auth_litestar`

Frontend standards:

- Keep React components predictable and typed.
- Prefer existing styling and state-management patterns already used in `frontend/src/`.

---

# 6) Testing Standards

All new behavior should include verification.

- Backend API behavior: add/update pytest tests (expected location: `backend/app/tests/` per backend pytest config).
- Frontend behavior: add/update Vitest tests when logic/UI behavior changes.
- Auth-libs behavior: add/update tests under `auth-libs/python/tests/`.
- Cover both success and failure paths where practical.
- Do not delete/disable tests just to make checks pass.

If test execution is blocked by environment constraints, report exact blockers.

---

# 7) Security and Safety Boundaries

Never:

- Commit `.env` values, secrets, or credentials
- Hardcode tokens/client secrets
- Bypass auth checks or admin guards
- Introduce unsafe SQL construction

Ask first before:

- Introducing new dependencies
- Changing auth/session/security behavior
- DB schema changes and migrations
- Deployment workflow changes (`.github/workflows/`, infra behavior)

---

# 8) Database and Migration Policy

Backend uses Alembic:

- Migration config: `backend/alembic.ini`
- Migration scripts: `backend/alembic/versions/`

When schema changes are required:

- Add/adjust Alembic migration(s) in `backend/alembic/versions/`
- Keep SQLAlchemy models in sync (`backend/app/db/models.py`)
- Verify migration upgrade path locally when feasible

---

# 9) Repo Change Boundaries

Default edit scope (unless task requires otherwise):

- `backend/**`
- `frontend/**`
- `auth-libs/**`
- `docs/**`
- `osm-userinfo/**`
- `AGENTS.md`

Treat as sensitive; modify only when explicitly requested:

- `.env`
- `.github/workflows/**`
- `chart/**`
- deployment scripts under `scripts/`

Avoid editing generated/local artifacts unless the task is specifically about them:

- `**/__pycache__/`
- `**/.pytest_cache/`
- `**/.ruff_cache/`
- compiled/built outputs in `dist/` directories (except when task is to update distributable artifacts)

---

# 10) Dependency and Versioning Policy

- Use Conventional Commits.
- Keep dependency/version diffs minimal and justified.
- Do not perform opportunistic upgrades unrelated to the task.

For auth-libs Python changes:

- Keep `auth-libs/python/pyproject.toml` and lockfile consistent.
- Ensure new integrations stay compatible with declared optional extras (`fastapi`, `django`, `litestar`).

If commits are requested, include a model/tool trailer, e.g.:

```text
Assisted-by: Codex (GPT-5)
```

---

# 11) Anti-Patterns

- Mixing framework concerns (e.g., app-specific logic leaking into core auth-lib modules)
- Reimplementing logic already available in `hotosm_auth` core
- Large cross-directory refactors without staged validation
- Making deployment/workflow changes as part of unrelated feature work
- Adding auth bypasses for convenience in production paths

---

# 12) Done Criteria

A change is done when all are true:

1. Behavior is implemented in code.
2. Relevant tests/checks were run, or blockers are explicitly reported.
3. Lint/format hooks for changed scope are satisfied.
4. Summary includes changed files, impact, and known risks/follow-up.

<!-- markdownlint-enable MD013 MD025 -->
