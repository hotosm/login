# Frontend Dockerfile with multi-stage build

# Development stage
FROM node:20-alpine AS dev

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5174

# Run development server
CMD ["pnpm", "dev"]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_HANKO_URL=https://login.hotosm.org
ARG VITE_BACKEND_URL=https://login.hotosm.org/api
ENV VITE_HANKO_URL=$VITE_HANKO_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
