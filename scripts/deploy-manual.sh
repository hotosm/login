#!/bin/bash
set -e

# Manual Deployment Script for Login Service
# Usage: ./scripts/deploy-manual.sh [dev|prod]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
SSH_HOST="dev.login.hotosm.org"
SSH_USER="admin"
DEPLOY_PATH="/opt/login"

if [ "$ENVIRONMENT" = "prod" ]; then
    SSH_HOST="login.hotosm.org"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Manual Deployment - Login Service${NC}"
echo -e "${BLUE}   Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}   Target: ${SSH_USER}@${SSH_HOST}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check we're in the right directory
if [ ! -f "compose.yaml" ]; then
    echo -e "${RED}✗ Error: Must run from login repository root${NC}"
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠  Warning: You have uncommitted changes${NC}"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: ${BRANCH}${NC}"

if [ "$ENVIRONMENT" = "dev" ] && [ "$BRANCH" != "develop" ]; then
    echo -e "${YELLOW}⚠  Warning: You're on branch '${BRANCH}' but deploying to dev (usually uses 'develop')${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [ "$ENVIRONMENT" = "prod" ] && [ "$BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠  Warning: You're on branch '${BRANCH}' but deploying to production (should be 'main')${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Step 1: Push code to GitHub${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Pushing ${BRANCH} to GitHub..."
git push origin ${BRANCH}
echo -e "${GREEN}✓ Code pushed${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Step 2: Deploy to server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Determine profile
PROFILE="dev"
if [ "$ENVIRONMENT" = "prod" ]; then
    PROFILE="prod"
fi

echo "Connecting to ${SSH_USER}@${SSH_HOST}..."
echo ""

ssh ${SSH_USER}@${SSH_HOST} << EOF
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  On server: ${SSH_HOST}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to deploy directory
if [ ! -d "${DEPLOY_PATH}" ]; then
    echo "Creating deploy directory..."
    sudo mkdir -p ${DEPLOY_PATH}
    sudo chown ${SSH_USER}:${SSH_USER} ${DEPLOY_PATH}
fi

cd ${DEPLOY_PATH}

# Clone or pull repository
if [ ! -d ".git" ]; then
    echo "→ Cloning repository..."
    git clone https://github.com/hotosm/login.git .
else
    echo "→ Pulling latest changes..."
    git fetch origin
    git checkout ${BRANCH}
    git pull origin ${BRANCH}
fi

echo "✓ Code updated"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠  .env file not found. Creating default..."
    cat > .env << 'ENVEOF'
POSTGRES_PASSWORD=hanko
PASSWORD_ENABLED=true
ENVEOF
    echo "✓ Created .env file (you may need to update it)"
else
    echo "✓ .env file exists"
fi

echo ""
echo "→ Building and deploying with Docker Compose..."
echo "  Profile: ${PROFILE}"
echo ""

# Stop services
docker compose --profile ${PROFILE} down

# Build and start
docker compose --profile ${PROFILE} up -d --build

# Wait a bit for services to start
echo ""
echo "→ Waiting for services to start..."
sleep 5

# Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps

# Clean up old images
echo ""
echo "→ Cleaning up old images..."
docker image prune -af --filter "until=24h"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Deployment Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services are running at:"
if [ "${PROFILE}" = "dev" ]; then
    echo "  • Hanko:    https://dev.login.hotosm.org"
    echo "  • Backend:  https://dev.login.hotosm.org/api"
    echo "  • Frontend: https://app.dev.login.hotosm.org"
else
    echo "  • Hanko:    https://login.hotosm.org"
    echo "  • Backend:  https://login.hotosm.org/api"
    echo "  • Frontend: https://app.login.hotosm.org"
fi
echo ""
echo "View logs:"
echo "  docker compose logs -f"
echo ""

EOF

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ Deployment Successful!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$ENVIRONMENT" = "dev" ]; then
    echo "Services deployed to:"
    echo -e "  ${GREEN}https://dev.login.hotosm.org${NC}"
    echo -e "  ${GREEN}https://app.dev.login.hotosm.org${NC}"
else
    echo "Services deployed to:"
    echo -e "  ${GREEN}https://login.hotosm.org${NC}"
    echo -e "  ${GREEN}https://app.login.hotosm.org${NC}"
fi

echo ""
echo "To view logs:"
echo -e "  ${BLUE}ssh ${SSH_USER}@${SSH_HOST} 'cd ${DEPLOY_PATH} && docker compose logs -f'${NC}"
echo ""
