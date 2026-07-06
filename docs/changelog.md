# Changelog

All notable changes to Beacon will be documented in this file.

## [1.4.0] - 2026-07-06

### Added
- **MCP Server** — standard MCP (stdio) server exposing the full Beacon engine. Any MCP client (Claude Desktop/Code, Cursor, Windsurf, Cline, etc.) can list projects/endpoints, create/edit/move items in the tree, import collections, `send_request`, and `run_endpoint`/`run_scenario`.
- **Desktop MCP bundling**: The MCP server is now a standalone PyInstaller binary (`mcp_server.exe`) shipped inside the desktop installer. No Python required on the end-user machine.
- One-click **MCP registration** from inside the desktop app:
  - Register/unregister with **Claude Desktop** (safe merge into `claude_desktop_config.json`, never clobbers other entries or corrupt files).
  - Register/unregister with **Claude Code** via `claude mcp` CLI.
  - Copy ready-to-paste stdio config snippet for any other client.
- **Single Send + Response Inspector**: "Send" button fires one request and shows full structured response (status, time_ms, size, headers, body, parsed JSON). Supports click-to-extract (click JSON field → add extractor path automatically).
- **Assertions**: per-endpoint validation rules (status code, response time, body contains, JSONPath, header value). Evaluated on both single sends and load runs; results visible in logs and scenarios.
- **Scenarios**: ordered multi-step execution (`run_scenario`). Extractors refresh variables between steps so "Login → Authenticated call" just works. Supports `continue_on_error` and per-step retries.
- Content-type support expanded (`json`, `form`, `multipart`, `raw`) with proper header handling.
- Live latency trend / histogram in the Live Monitor.
- Additional MCP tools: `get_tree`, `update_endpoint`, `move_item`, `rename_folder`, `send_request` (with retries), `run_scenario`.

### Changed
- Desktop sidecars (backend + mcp_server) are staged to a stable `%APPDATA%\com.beacon.app` path so MCP registrations survive app updates.
- Backend + MCP clients share the same config store with single-instance protection and atomic writes.
- `send_once` engine path now shared between load runs and the inspector (DRY request building + extraction).

### Fixed
- Multiple desktop/MCP robustness issues (stale backend reaping, atomic Claude config writes, race conditions on `tests.json`).

## [1.3.0] - 2026-07-02

### Added
- Full VitePress documentation site (`docs/`)
- Proper versioning and detailed changelog
- Link to Documentation from the landing page

### Changed
- Improved documentation structure and completeness

## [1.2.0] - 2026-07-02

### Added
- Full nested folder support (Postman-style organization)
- Postman collection import that preserves folder structure
- Collapse All / Expand All for folders
- Statistics panel in the endpoint list
- "Run Folder" (recursively runs all endpoints in a folder + subfolders)
- Two-column responsive layout (endpoint tree + statistics/features)
- Desktop support using **Tauri** + Python backend as sidecar
- Automated desktop build command: `npm run desktop:build`
- Single-EXE experience (backend auto-starts when launching the desktop app)

### Changed
- Endpoint storage migrated from flat `tests[]` to recursive `items[]` structure
- Significantly modernized landing page design

## [1.1.0] - 2026-06

### Added
- Dynamic variable generators (`{{random_email}}`, `{{uuid}}`, `{{timestamp}}`, <code v-pre>{{random_string:12}}</code>, etc.)
- Response extractors for token chaining and dependent requests
- Real-time Live Monitoring dashboard
- Rate limit detection (HTTP 429 + text heuristics)
- Concurrent execution with customizable concurrency, delay, and max requests

## [1.0.0] - 2026-05

### Added
- Project and Environment management
- Endpoint CRUD (JSON, Form, Multipart)
- Basic execution engine
- Web interface (React + Vite + FastAPI)
- Portable project export/import (JSON)
- Initial variable templating support
