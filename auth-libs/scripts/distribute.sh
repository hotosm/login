#!/bin/bash
set -e

echo "📤 Distributing auth-libs to projects..."
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_LIBS_DIR="$(dirname "$SCRIPT_DIR")"
LOGIN_DIR="$(dirname "$AUTH_LIBS_DIR")"
HOT_DIR="$(dirname "$LOGIN_DIR")"

# Get current version from pyproject.toml
VERSION=$(grep '^version = ' "$AUTH_LIBS_DIR/python/pyproject.toml" | sed 's/version = "\(.*\)"/\1/')
echo "📌 Current auth-libs version: v$VERSION"
echo ""

# =============================================================================
# Helper functions
# =============================================================================

distribute_web_component() {
    local target_dir="$1"
    local project_name="$2"

    echo "📦 Distributing web-component (source + dist) to $project_name..."
    mkdir -p "$target_dir"
    rm -rf "$target_dir/dist" "$target_dir/src"
    cp -r "$AUTH_LIBS_DIR/web-component/dist" "$target_dir/"
    cp -r "$AUTH_LIBS_DIR/web-component/src" "$target_dir/"
    cp "$AUTH_LIBS_DIR/web-component/package.json" "$target_dir/"
    cp "$AUTH_LIBS_DIR/web-component/vite.config.js" "$target_dir/"
    echo "✅ Web component (source + dist) → $project_name"
    echo ""
}

distribute_python() {
    local target_dir="$1"
    local project_name="$2"
    local wheel_dir="${3:-}"  # Optional: directory to copy wheel file

    echo "📦 Distributing Python dist/ to $project_name..."
    mkdir -p "$target_dir"
    rm -rf "$target_dir/dist"
    cp -r "$AUTH_LIBS_DIR/python/dist" "$target_dir/"

    # Copy wheel to additional directory if specified
    if [ -n "$wheel_dir" ] && [ -d "$wheel_dir" ]; then
        rm -f "$wheel_dir/"hotosm_auth-*.whl
        cp "$AUTH_LIBS_DIR/python/dist/"*.whl "$wheel_dir/"
    fi

    echo "✅ Python package → $project_name"
    echo ""
}

update_pyproject() {
    local file="$1"
    if [ -f "$file" ]; then
        # Replace old repo URL (LawalCoop/hot-auth-libs) with new (hotosm/login)
        # and update subdirectory path from python to auth-libs/python
        sed -i "s|LawalCoop/hot-auth-libs.git@[^#]*#subdirectory=python|hotosm/login.git@auth-libs-v$VERSION#subdirectory=auth-libs/python|g" "$file"
        # Also handle if already using hotosm/login
        sed -i "s|hotosm/login.git@[^#]*#subdirectory=auth-libs/python|hotosm/login.git@auth-libs-v$VERSION#subdirectory=auth-libs/python|g" "$file"
        echo "  ✅ Updated: $file"
    fi
}

update_docker_compose() {
    local file="$1"
    if [ -f "$file" ]; then
        # Replace any hotosm_auth-X.X.X-py3-none-any.whl with the current version
        sed -i "s|hotosm_auth-[0-9.]*-py3-none-any.whl|hotosm_auth-$VERSION-py3-none-any.whl|g" "$file"
        echo "  ✅ Updated: $file"
    fi
}

# =============================================================================
# Distribute to projects
# =============================================================================

# Portal
distribute_web_component "$HOT_DIR/portal/frontend/auth-libs/web-component" "portal"
distribute_python "$HOT_DIR/portal/backend/auth-libs/python" "portal"

# Drone-TM
distribute_web_component "$HOT_DIR/drone-tm/src/frontend/auth-libs/web-component" "drone-tm"
distribute_python "$HOT_DIR/drone-tm/src/backend/auth-libs" "drone-tm" "$HOT_DIR/drone-tm/src/backend/libs"

# Login (local - uses source directly, but still distribute for frontend)
distribute_web_component "$LOGIN_DIR/frontend/auth-libs/web-component" "login"

# OpenAerialMap
distribute_web_component "$HOT_DIR/openaerialmap/frontend/auth-libs/web-component" "openaerialmap"
distribute_python "$HOT_DIR/openaerialmap/backend/stac-api/auth-libs" "openaerialmap"

# fAIr
distribute_web_component "$HOT_DIR/fAIr/frontend/auth-libs/web-component" "fAIr"
distribute_python "$HOT_DIR/fAIr/backend/auth-libs" "fAIr"

echo "✅ Distribution complete!"
echo ""

# =============================================================================
# Update pyproject.toml references
# =============================================================================

echo "📝 Updating pyproject.toml references to v$VERSION..."

update_pyproject "$HOT_DIR/portal/backend/pyproject.toml"
update_pyproject "$HOT_DIR/drone-tm/src/backend/pyproject.toml"
update_pyproject "$HOT_DIR/fAIr/backend/pyproject.toml"
update_pyproject "$HOT_DIR/openaerialmap/backend/stac-api/pyproject.toml"

echo ""
echo "✅ All pyproject.toml references updated to v$VERSION"
echo ""

# =============================================================================
# Update hot-dev-env docker-compose.yml
# =============================================================================

echo "🐳 Updating hot-dev-env docker-compose.yml to v$VERSION..."

update_docker_compose "$HOT_DIR/hot-dev-env/docker-compose.yml"

echo ""
echo "✅ hot-dev-env docker-compose.yml updated to v$VERSION"
echo ""
echo "Don't forget to commit changes in each project!"
echo ""
echo "Projects updated:"
echo "  - portal/frontend/auth-libs/web-component/dist/"
echo "  - portal/backend/auth-libs/python/dist/"
echo "  - portal/backend/pyproject.toml → v$VERSION"
echo "  - drone-tm/src/frontend/auth-libs/web-component/dist/"
echo "  - drone-tm/src/backend/auth-libs/dist/"
echo "  - drone-tm/src/backend/pyproject.toml → v$VERSION"
echo "  - login/frontend/auth-libs/web-component/dist/"
echo "  - openaerialmap/frontend/auth-libs/web-component/dist/"
echo "  - openaerialmap/backend/stac-api/auth-libs/dist/"
echo "  - openaerialmap/backend/stac-api/pyproject.toml → v$VERSION"
echo "  - fAIr/frontend/auth-libs/web-component/dist/"
echo "  - fAIr/backend/auth-libs/dist/"
echo "  - fAIr/backend/pyproject.toml → v$VERSION"
echo "  - hot-dev-env/docker-compose.yml → v$VERSION"
echo ""
echo "Note: login/backend uses local reference to auth-libs (no version update needed)"
