ARG PYTHON_IMG_TAG=3.12
ARG UV_IMG_TAG=0.10.6
FROM ghcr.io/astral-sh/uv:${UV_IMG_TAG} AS uv


# Base stage with shared config
FROM docker.io/python:${PYTHON_IMG_TAG}-slim-bookworm AS base
ARG APP_VERSION
ARG COMMIT_REF
ARG PYTHON_IMG_TAG
LABEL org.hotosm.login.app-name="backend" \
      org.hotosm.login.app-version="${APP_VERSION}" \
      org.hotosm.login.git-commit-ref="${COMMIT_REF:-none}" \
      org.hotosm.login.python-img-tag="${PYTHON_IMG_TAG}" \
      org.hotosm.login.maintainer="sysadmin@hotosm.org" \
      org.hotosm.login.api-port="8000"
RUN apt-get update --quiet \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --quiet --no-install-recommends \
        "locales" "ca-certificates" "curl" \
    && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates
# Set locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_PYTHON_DOWNLOADS=never \
    UV_PYTHON="python${PYTHON_IMG_TAG}" \
    UV_PROJECT_ENVIRONMENT=/opt/python
STOPSIGNAL SIGINT


# Build stage with compilation dependencies
FROM base AS build
RUN apt-get update --quiet \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --quiet --no-install-recommends \
        "build-essential" \
        "gcc" \
    && rm -rf /var/lib/apt/lists/*
COPY --from=uv /uv /usr/local/bin/uv
RUN mkdir -p /_lock
# Install third-party deps first for better cache hits
RUN --mount=type=cache,id=uv-cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=/_lock/pyproject.toml \
    --mount=type=bind,source=uv.lock,target=/_lock/uv.lock \
    UV_CACHE_DIR=/root/.cache/uv uv sync \
        --project /_lock \
        --frozen \
        --no-editable \
        --no-dev \
        --no-install-project


# Runtime stage with shared dependencies and entrypoints
FROM base AS runtime-base
ARG PYTHON_IMG_TAG
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PATH="/opt/python/bin:$PATH" \
    PYTHONPATH="/opt" \
    PYTHON_LIB="/opt/python/lib/python${PYTHON_IMG_TAG}/site-packages" \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt \
    REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
RUN apt-get update --quiet \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --quiet --no-install-recommends \
        "curl" \
        "postgresql-client" \
    && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
# Copy Python deps from build stage
COPY --from=build /opt/python /opt/python
WORKDIR /opt
# Add non-root user
RUN useradd -u 1001 -m -c "login service account" -d /home/appuser -s /bin/false appuser \
    && mkdir -p /opt/app \
    && chown -R appuser:appuser /opt /home/appuser \
    && chmod +x /entrypoint.sh
USER appuser


# Development stage
FROM runtime-base AS dev
USER root
COPY --from=uv /uv /usr/local/bin/uv
RUN apt-get update --quiet \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --quiet --no-install-recommends \
        "git" \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml uv.lock /_lock/
RUN --mount=type=cache,id=uv-cache,target=/root/.cache/uv \
    UV_CACHE_DIR=/root/.cache/uv uv sync \
        --project /_lock \
        --locked \
        --no-editable \
        --no-install-project \
        --dev
COPY --chown=appuser:appuser app/ /opt/app/
COPY --chown=appuser:appuser alembic.ini /opt/alembic.ini
USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
    "--workers", "1", "--reload", "--reload-dir", "app", \
    "--log-level", "info"]


# CI stage
FROM dev AS ci
USER root
ENTRYPOINT []
CMD ["sleep", "infinity"]


# Production stage
FROM runtime-base AS prod
COPY --chown=appuser:appuser app/ /opt/app/
COPY --chown=appuser:appuser alembic.ini /opt/alembic.ini
# Note: 1 worker (process) per container, behind load balancer
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
    "--workers", "1", "--log-level", "critical", "--no-access-log"]
# Sanity check
RUN python -V \
    && python -Im site \
    && python -c 'import app'
