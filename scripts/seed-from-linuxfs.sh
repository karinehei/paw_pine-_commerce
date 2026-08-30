#!/usr/bin/env bash
# Run the Shopify seed from a Linux filesystem copy.
# npm/npx hang when the repo lives on /mnt/d (WSL + Windows drive).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="${PAW_PINE_SEED_DIR:-$HOME/paw-pine-seed}"

run_seed() {
  local dir=$1
  shift
  cd "$dir"
  export npm_config_update_notifier=false
  if [[ ! -x node_modules/.bin/tsx ]]; then
    echo "[seed] installing deps in $dir"
    npm ci --ignore-scripts --no-audit --no-fund
  fi
  echo "[seed] running from $dir"
  exec ./node_modules/.bin/tsx --tsconfig tsconfig.json scripts/seed-shopify.ts "$@"
}

if [[ "$ROOT" != /mnt/* ]]; then
  run_seed "$ROOT" "$@"
fi

mkdir -p "$APP"
rsync -a \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  "$ROOT/" "$APP/"

run_seed "$APP" "$@"
