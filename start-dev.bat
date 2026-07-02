@echo off
REM Thin wrapper — the real launcher is `pnpm dev` (scripts/dev.mjs), which
REM starts the backend, frontend, AND docs using ports from the root .env.
echo.
echo [94m=======================================[0m
echo [94m  Beacon - Starting Services[0m
echo [94m=======================================[0m
echo.
echo Starting backend + frontend + docs via pnpm dev...
echo (Ports come from the root .env. Ctrl+C stops everything.)
echo.
call pnpm dev
