# Desktop App

Beacon has full desktop support powered by **Tauri**.

## Why Desktop?

- Works with local/private networks
- Direct filesystem access for projects
- Better performance for large collections
- Can run completely offline

## Current Status

Desktop support is **fully implemented** using:

- Tauri v2 (Rust + Webview)
- Same React frontend
- Python backend as sidecar

## Building the Desktop App

### Prerequisites

- Rust (via rustup)
- Node.js + pnpm
- Python + pip

On macOS, install Apple's command-line developer tools first:

```bash
xcode-select --install
```

Then install the build dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-desktop.txt

cd ../frontend
npm install
```

### Build Steps

```bash
cd frontend
npm run desktop:prepare   # PyInstaller-builds backend + mcp_server, copies both sidecars
npm run tauri:build       # or: npm run desktop:build to run both steps together
```

> **Order matters.** `desktop:prepare` must run — and succeed — *before*
> `tauri:build` (or a raw `cargo build`). Tauri v2 treats a missing
> `externalBin` sidecar (`backend-<triple>.exe` / `mcp_server-<triple>.exe`) as
> a **hard build error**, not a warning, since both are now declared in
> `tauri.conf.json`'s `bundle.externalBin`. On a clean checkout or in CI,
> `desktop:prepare` has never run yet, so skipping it fails the build.

The final executable will be in:
`frontend/src-tauri/target/release/`

### macOS build

Build on the Mac architecture you plan to distribute. An Apple Silicon Mac
produces an arm64 application; an Intel Mac produces an x86_64 application.
PyInstaller sidecars must be built on macOS, so a Windows-built `.exe` cannot
be reused.

```bash
cd frontend
BEACON_PYTHON=../backend/.venv/bin/python npm run desktop:build:mac
```

The distributable files are written to:

- `src-tauri/target/release/bundle/macos/Beacon.app`
- `src-tauri/target/release/bundle/dmg/Beacon_<version>_<arch>.dmg`

The DMG is unsigned by default. It can run locally, but public distribution
should use an Apple Developer ID certificate, hardened runtime, and Apple
notarization so Gatekeeper does not warn users.

## Running in Development

```bash
cd frontend
npm run tauri dev
```

This will open a native window with hot reload.

## Architecture

- **Frontend**: React + Vite (bundled into desktop)
- **Backend**: FastAPI (built with PyInstaller as `backend.exe`)
- **MCP Server**: Also bundled as `mcp_server.exe` sidecar (standard MCP, works with any client)
- The desktop app automatically starts the backend sidecar when launched.
- Open **MCP** in the app for easy registration with Claude or copy config for other clients.

See [MCP Server](/mcp) for full details.

Next: [Changelog](/changelog)
