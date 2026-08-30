#!/usr/bin/env bash
# Run Playwright against a demo-mode Linux copy (no Shopify .env.local).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${PAW_PINE_APP_DIR:-$HOME/paw-pine-app}"
mkdir -p "$APP"
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .env.local \
  "$ROOT/" "$APP/"
cd "$APP"
export npm_config_update_notifier=false
export CI=true
export NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100
if [[ ! -x node_modules/.bin/playwright ]]; then
  echo "[e2e] npm ci"
  npm ci --ignore-scripts --no-audit --no-fund
fi
echo "=== build (demo) ==="
npm run build
echo "=== playwright ==="
npx playwright install chromium
npm run test:e2e
if [[ "${SCREENSHOTS:-}" == "1" ]]; then
  echo "=== screenshots ==="
  SCREENSHOTS=1 npx playwright test e2e/screenshots.spec.ts
  DEST="$ROOT/docs/screenshots"
  mkdir -p "$DEST"
  cp -f "$APP/docs/screenshots/"*.png "$DEST/"
fi
echo "[e2e] passed"
