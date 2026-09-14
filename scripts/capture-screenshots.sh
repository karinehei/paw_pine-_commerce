#!/usr/bin/env bash
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
rm -f .env.local
export npm_config_update_notifier=false
export CI=true
export SCREENSHOTS=1
export NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100
fuser -k 3100/tcp 2>/dev/null || true
if [[ ! -x node_modules/.bin/playwright ]]; then
  npm ci --ignore-scripts --no-audit --no-fund
fi
if [[ ! -d .next ]]; then
  npm run build
fi
npx playwright install chromium
npx playwright test e2e/screenshots.spec.ts --retries=0 --workers=1
mkdir -p "$ROOT/docs/screenshots"
cp -f "$APP/docs/screenshots/"*.png "$ROOT/docs/screenshots/"
echo "[screenshots] wrote $(ls "$ROOT/docs/screenshots"/*.png | wc -l) files"
