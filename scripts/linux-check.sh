#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${PAW_PINE_APP_DIR:-$HOME/paw-pine-app}"
mkdir -p "$APP"
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  "$ROOT/" "$APP/"
cd "$APP"
export npm_config_update_notifier=false
if [[ ! -x node_modules/.bin/vitest ]]; then
  echo "[check] npm ci"
  npm ci --ignore-scripts --no-audit --no-fund
fi
echo "=== lint ==="
npm run lint
echo "=== typecheck ==="
npm run typecheck
echo "=== test ==="
npm run test
echo "=== build ==="
npm run build
echo "[check] all passed"
