FROM golang:1.24 AS base


# Build statically compiled binary
FROM base AS build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/osm-userinfo


# Add a non-root user to passwd file
FROM base AS useradd
RUN groupadd -g 1000 nonroot
RUN useradd -u 1000 nonroot -g 1000


# Add ca-certs required for calling remote signed APIs
FROM base AS certs
RUN apt-get update --quiet \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --quiet --no-install-recommends \
        "ca-certificates" \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates


# Deploy the application binary into sratch image
FROM scratch AS release
WORKDIR /app
COPY --from=build /app/osm-userinfo /app/osm-userinfo
COPY --from=useradd /etc/group /etc/group
COPY --from=useradd /etc/passwd /etc/passwd
COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
USER nonroot:nonroot
ENTRYPOINT ["/app/osm-userinfo"]
