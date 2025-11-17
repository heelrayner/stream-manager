#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "[Stream Manager] Node.js is required but not found in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[Stream Manager] npm is required but not found in PATH." >&2
  exit 1
fi

echo "[Stream Manager] Installing dependencies (set NPM_CONFIG_REGISTRY if behind a proxy)..."
npm install

echo "[Stream Manager] Building client and server bundles..."
npm run build

echo "[Stream Manager] Installation complete. Run 'npm start' to launch the Electron app (API on http://localhost:4000)."
