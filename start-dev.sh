#!/bin/bash
# Thin wrapper — the real launcher is `pnpm dev` (scripts/dev.mjs), which
# starts the backend, frontend, AND docs using ports from the root .env.
echo "Starting Beacon (backend + frontend + docs) via pnpm dev..."
exec pnpm dev
