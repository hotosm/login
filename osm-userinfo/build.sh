#!/bin/bash

docker build . -t ghcr.io/hotosm/login/osm-userinfo:latest
docker push ghcr.io/hotosm/login/osm-userinfo:latest
