#!/bin/bash
#
# Container deployment helper for the backend, Redis, and canonical /space frontend.
# Added in Phase 4 to replace the empty deploy helper with a reproducible Compose flow.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
ACTION="${1:-up}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1"
    exit 1
  fi
}

require_command docker

cd "$ROOT_DIR"

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "[WARN] Created backend/.env from backend/.env.example"
fi

case "$ACTION" in
  up)
    docker compose -f "$COMPOSE_FILE" up --build -d
    ;;
  build)
    docker compose -f "$COMPOSE_FILE" build
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" down
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  restart)
    docker compose -f "$COMPOSE_FILE" down
    docker compose -f "$COMPOSE_FILE" up --build -d
    ;;
  *)
    echo "Usage: $0 [up|build|down|logs|restart]"
    exit 1
    ;;
esac
