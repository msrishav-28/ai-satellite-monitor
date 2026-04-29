#!/bin/bash
#
# Runs the canonical validation suite for the backend and canonical /space frontend.
# Added in Phase 4 so local verification and CI share the same build expectations.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="python3"
if [ -x "backend/.venv/bin/python" ]; then
  PYTHON_BIN="backend/.venv/bin/python"
fi

echo "[INFO] Linting frontend..."
npm run lint

echo "[INFO] Type-checking frontend..."
npm run typecheck

echo "[INFO] Building frontend..."
npm run build

echo "[INFO] Running backend tests..."
"$PYTHON_BIN" -m pytest backend/tests

echo "[INFO] Compiling backend modules..."
"$PYTHON_BIN" -m compileall backend
echo "[OK] Validation complete."
