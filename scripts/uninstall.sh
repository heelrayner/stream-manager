#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

TARGETS=("node_modules" "dist" "stream_manager.db")

for path in "${TARGETS[@]}"; do
  if [ -e "$path" ]; then
    echo "[Stream Manager] Removing $path"
    rm -rf "$path"
  else
    echo "[Stream Manager] Skipping $path (not found)"
  fi
done

echo "[Stream Manager] Uninstall complete. To remove cached npm artifacts, delete package-lock.json manually if desired."
