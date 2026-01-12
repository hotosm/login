# HOTOSM Auth Libraries

Librerías de autenticación compartidas para todos los proyectos HOTOSM.

## 📦 Contenido

### 1. Python Library (`python/`)

**Librería Python** para integración con FastAPI y Django.

**Instalación** (en tu `pyproject.toml`):
```python
dependencies = [
    "hotosm-auth @ git+https://github.com/LawalCoop/hot-auth-libs.git@v0.1.11#subdirectory=python",
]
```

**Uso**:
```python
from hotosm_auth.integrations.fastapi import CurrentUser

@router.get("/me")
async def get_me(user: CurrentUser):
    return {"id": user.id, "email": user.email}
```

📚 **Documentación completa**: [python/README.md](./python/README.md)

---

### 2. Web Component (`web-component/`)

**Componente web** para el frontend (HTML/JS).

**Uso**:
```html
<head>
    <meta name="hanko-url" content="https://login.hotosm.org">
    <script src="auth-libs/web-component/dist/hanko-auth.iife.js"></script>
</head>
<body>
    <hotosm-auth show-profile></hotosm-auth>
</body>
```

📚 **Documentación completa**: [web-component/README.md](./web-component/README.md)

---

## 🚀 Distribución

Auth-libs usa dos métodos de distribución diferentes:

### Python (Backend)

**Método**: Git+HTTPS con tags de versión

Los proyectos referencian auth-libs directamente desde GitHub:
```python
"hotosm-auth @ git+https://github.com/LawalCoop/hot-auth-libs.git@v0.1.11#subdirectory=python",
```

- No hay wheels que distribuir ni commitear
- `uv lock` regenera el lockfile con la versión especificada

### Web Component (Frontend)

**Método**: Build y distribute via script

Los bundles JS se copian a cada proyecto:
```bash
./scripts/build.sh      # Compila JS bundles
./scripts/distribute.sh # Copia a todos los proyectos
```

- Los archivos se commitean en cada proyecto
- Necesario para hot-reload local y Docker builds

---

## 🔄 Releasing a New Version

### 1. Hacer cambios

Editar código fuente:
- Python: `python/hotosm_auth/`
- Web component: `web-component/src/`

### 2. Actualizar versión

Editar `python/pyproject.toml`:
```toml
version = "0.1.9"  # bump de 0.1.8
```

### 3. Build y distribute

```bash
./scripts/build.sh      # Compila Python wheel + JS bundles
./scripts/distribute.sh # Copia dist/ a proyectos Y actualiza pyproject.toml
```

El script `distribute.sh` automáticamente:
- Copia web component dist/ a todos los frontends
- Copia Python dist/ a todos los backends
- **Actualiza las referencias en `pyproject.toml` de todos los proyectos** a la versión actual

### 4. Commit y tag

```bash
git add .
git commit -m "Add new feature"
git push
git tag v0.1.9
git push --tags
```

### 5. Commitear en todos los proyectos

En cada proyecto, commitear los cambios generados por `distribute.sh`:
```bash
git add frontend/auth-libs/ backend/pyproject.toml
git commit -m "Update auth-libs to v0.1.9"
git push
```

---

## 📋 Configuración

### Backend (.env)
```bash
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-secret-key-min-32-bytes

# Optional - OSM OAuth
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
```

### Frontend (HTML)
```html
<meta name="hanko-url" content="https://login.hotosm.org">
<script src="auth-libs/web-component/dist/hanko-auth.iife.js"></script>
<hotosm-auth></hotosm-auth>
```

---

## 📚 Proyectos que usan auth-libs

### Backend (Python)

| Proyecto | Archivo |
|----------|---------|
| portal | `backend/pyproject.toml` |
| drone-tm | `src/backend/pyproject.toml` |
| fAIr | `backend/pyproject.toml` |
| openaerialmap | `backend/stac-api/pyproject.toml` |

### Frontend (Web Component)

| Proyecto | Ubicación |
|----------|-----------|
| portal | `frontend/auth-libs/web-component/dist/` |
| drone-tm | `src/frontend/auth-libs/web-component/dist/` |
| fAIr | `frontend/auth-libs/web-component/dist/` |
| openaerialmap | `frontend/auth-libs/web-component/dist/` |
| login | `frontend/auth-libs/web-component/dist/` |

---

## 📄 Licencias

- **Python library** (`python/`): GPL-3.0-or-later
- **Web component** (`web-component/`): AGPL-3.0

Ver archivos LICENSE en cada carpeta.
