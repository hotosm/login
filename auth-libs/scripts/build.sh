#!/bin/bash
set -e

echo "🔨 Building auth-libs..."
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_LIBS_DIR="$(dirname "$SCRIPT_DIR")"

# Build web component
echo "📦 Building web-component..."
cd "$AUTH_LIBS_DIR/web-component"
pnpm install
pnpm build
echo "✅ Web component built"
echo ""

# Build Python package
echo "📦 Building Python package..."
cd "$AUTH_LIBS_DIR/python"
uv build
echo "✅ Python package built"
echo ""

echo "✅ All builds complete!"
echo ""
echo "Next step: Run ./scripts/distribute.sh to copy dist/ to projects"
