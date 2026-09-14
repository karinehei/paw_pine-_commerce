.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help ci dev lint typecheck test test-e2e build format check linux-check e2e-demo screenshots seed seed-archive

help:
	@echo "Paw & Pine"
	@echo
	@echo "  make ci             Install deps (npm ci)"
	@echo "  make dev            Next.js dev server"
	@echo "  make lint           ESLint"
	@echo "  make typecheck      TypeScript"
	@echo "  make test           Vitest"
	@echo "  make test-e2e       Playwright"
	@echo "  make build          Production build"
	@echo "  make format         Prettier write"
	@echo "  make check          lint + typecheck + test"
	@echo "  make linux-check    Same as check+build from a Linux filesystem copy"
	@echo "  make e2e-demo       Playwright in demo mode from a Linux copy"
	@echo "  make screenshots    Recapture docs/screenshots from a demo production build"
	@echo "  make seed           Push demo catalogue to Shopify"
	@echo "  make seed-archive    Seed, then archive sample snowboards"
	@echo
	@echo "From WSL on /mnt/d, use make seed (not npm run seed:shopify)."

ci:
	npm ci

dev:
	npm run dev

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

test-e2e:
	npm run test:e2e

build:
	npm run build

format:
	npm run format

check: lint typecheck test

linux-check:
	bash scripts/linux-check.sh

e2e-demo:
	bash scripts/e2e-demo.sh

screenshots:
	bash scripts/capture-screenshots.sh

seed:
	bash scripts/seed-from-linuxfs.sh

seed-archive:
	bash scripts/seed-from-linuxfs.sh --archive-samples
