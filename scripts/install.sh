#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[Stream Manager] Installing dependencies..."
npm install

echo "[Stream Manager] Building client and server bundles..."
npm run build

echo "[Stream Manager] Installation complete. Run 'npm start' to launch the server on http://localhost:4000."
