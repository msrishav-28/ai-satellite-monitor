#!/bin/bash
#
# Bootstraps local development for the FastAPI backend and canonical /space frontend.
# Added in Phase 4 to replace the previously empty setup helper with a working flow.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN="${PYTHON_BIN:-python3}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1"
    exit 1
  fi
}

echo "[INFO] Validating local toolchain..."
require_command node
require_command npm
require_command "$PYTHON_BIN"

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "[WARN] Created backend/.env from backend/.env.example"
fi

if [ ! -f "space/.env.local" ]; then
  cp space/.env.example space/.env.local
  echo "[WARN] Created space/.env.local from space/.env.example"
fi

echo "[INFO] Installing root dependencies..."
npm install

echo "[INFO] Installing frontend dependencies..."
npm run install:frontend

if [ ! -d "backend/.venv" ]; then
  echo "[INFO] Creating backend virtual environment..."
  "$PYTHON_BIN" -m venv backend/.venv
fi

source backend/.venv/bin/activate

echo "[INFO] Installing backend dependencies..."
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r backend/requirements.txt
echo "[OK] Local development environment is ready."
echo "[OK] Start both services with: npm run dev:full"
