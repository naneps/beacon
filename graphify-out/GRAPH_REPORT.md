# Graph Report - D:\security-tools  (2026-07-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1457 nodes · 2640 edges · 93 communities (89 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5f4c42d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- APITester
- mcp_server.py
- LandingPage.tsx
- mcp_registration.rs
- dependencies
- ModeParamsForm.tsx
- devDependencies
- APITester
- button.tsx
- devDependencies
- App.tsx
- types.ts
- LiveMonitor.tsx
- TestConfig
- SqliteRunHistoryRepository
- toast.tsx
- EndpointTest
- scripts
- CollectionTree.tsx
- compilerOptions
- HistoryPage.tsx
- compilerOptions
- HistoryService
- RunMetrics
- McpSettingsDialog.tsx
- state.py
- projects.py
- prepare-desktop.cjs
- EndpointTable.tsx
- build_jsonplaceholder_project
- compilerOptions
- components.json
- useRun.ts
- definitions
- definitions
- properties
- properties
- Store
- EndpointEditor.tsx
- HistoryCompare.tsx
- compare.py
- RunStart
- history.py
- runs.py
- RecordingRepository
- desktop.json
- ResponseInspector.tsx
- dev.mjs
- useExport.ts
- api.ts
- webviews
- webviews
- compilerOptions
- setup.js
- main.py
- tests.py
- MemoryRepository
- CapabilityRemote
- CapabilityRemote
- runner.py
- permissions
- permissions
- HistoryPage.test.tsx
- Capability
- Capability
- tsconfig.json
- validate-community-files.mjs
- config.py
- desktop-schema.json
- windows-schema.json
- local
- local
- Identifier
- Target
- Target
- __init__.py
- start-dev.sh

## God Nodes (most connected - your core abstractions)
1. `HistoryService` - 45 edges
2. `SqliteRunHistoryRepository` - 39 edges
3. `RunStart` - 33 edges
4. `APITester` - 31 edges
5. `RunStepStart` - 30 edges
6. `APITester` - 26 edges
7. `EndpointTest` - 25 edges
8. `Button` - 20 edges
9. `RunMetrics` - 19 edges
10. `_reload()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `load_config()` --calls--> `EndpointTest`  [EXTRACTED]
  app.py → core/tester.py
- `load_config()` --calls--> `TestConfig`  [EXTRACTED]
  app.py → core/tester.py
- `run_test()` --calls--> `APITester`  [EXTRACTED]
  app.py → core/tester.py
- `duplicate_test()` --calls--> `EndpointTest`  [EXTRACTED]
  app.py → core/tester.py
- `HistoryPrivacyRecoveryTests` --uses--> `EndpointTest`  [INFERRED]
  backend/tests/test_history_privacy_recovery.py → backend/app/core/tester.py

## Import Cycles
- None detected.

## Communities (93 total, 4 thin omitted)

### Community 0 - "APITester"
Cohesion: 0.05
Nodes (37): add_test(), delete_test(), duplicate_test(), load_config(), log_message(), run_test(), save_config(), save_config_route() (+29 more)

### Community 1 - "mcp_server.py"
Cohesion: 0.06
Nodes (63): _active_project(), add_endpoint_from_curl(), create_endpoint(), create_folder(), delete_endpoint(), delete_folder(), _detect_and_normalize(), duplicate_endpoint() (+55 more)

### Community 2 - "LandingPage.tsx"
Cohesion: 0.05
Nodes (37): BrandMark(), BrandMarkProps, sizeClass, ContributorWall(), ContributorWallState, ContributorWallView(), ContributorWallViewProps, NetworkBackground() (+29 more)

### Community 3 - "mcp_registration.rs"
Cohesion: 0.08
Nodes (46): AppHandle, Command, CommandChild, Duration, F, backend_port(), BackendChild, BackendPort (+38 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (44): dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-dialog, @radix-ui/react-label, @radix-ui/react-select, @radix-ui/react-slot (+36 more)

### Community 5 - "ModeParamsForm.tsx"
Cohesion: 0.09
Nodes (26): DEFAULT_SETTINGS, ExecutionControls(), Props, estimateModeDuration(), FUZZ_TYPES, GRID_COLUMNS, ModeParamsForm(), Props (+18 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (43): dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-slot, react, react-dom, tailwind-merge (+35 more)

### Community 7 - "APITester"
Cohesion: 0.09
Nodes (20): APITester, Any, Linear-interpolated percentile over an already-sorted list., Build a stats snapshot (counters + latency + status mix + throughput)., Support special generators like {{random_phone}}, {{random_email}}, {{uuid}} etc, Extract values from response body or headers and update variables (fresh token s, Issue one HTTP request honoring payload_type. Shared by the load run         an, Fire a single request and return the full response for inspection         (stat (+12 more)

### Community 8 - "button.tsx"
Cohesion: 0.16
Nodes (23): Assertion, TYPES, Props, Props, KVEditor(), KVEditorProps, parseJsonVars(), toStringRecord() (+15 more)

### Community 9 - "devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @tauri-apps/api, @tauri-apps/cli, @testing-library/jest-dom (+23 more)

### Community 10 - "App.tsx"
Cohesion: 0.11
Nodes (22): BrandMark(), BrandMarkProps, sizeClass, EnvironmentsDialog(), GlobalVarsDialog(), ProjectDialog(), ProjectSettingsDialog(), Props (+14 more)

### Community 11 - "types.ts"
Cohesion: 0.10
Nodes (21): Props, Props, Props, Props, Props, Sidebar(), SelectContent, SelectItem (+13 more)

### Community 12 - "LiveMonitor.tsx"
Cohesion: 0.13
Nodes (21): ImportDialog(), Props, classifyLogLine(), codeColor(), formatBody(), lineColor(), LiveMonitor(), LogFilter (+13 more)

### Community 13 - "TestConfig"
Cohesion: 0.13
Nodes (7): TestConfig, FailingHistoryRepository, FakeTester, HistoryRunnerIntegrationTests, ImmediateThread, RecordingHistory, target_store()

### Community 14 - "SqliteRunHistoryRepository"
Cohesion: 0.14
Nodes (9): RunStepStart, _decode_cursor(), _encode_cursor(), Any, Preserve the old database and create a fresh schema., SqliteRunHistoryRepository, _utc_now(), Connection (+1 more)

### Community 15 - "toast.tsx"
Cohesion: 0.11
Nodes (22): highlightJson(), isKeyToken(), JsonCodeEditor(), JsonCodeEditorProps, Token, tokenize(), FileVal, isFile() (+14 more)

### Community 16 - "EndpointTest"
Cohesion: 0.13
Nodes (18): _assert_cmp(), _dig(), EndpointTest, evaluate_assertions(), Walk a dot-path (leading 'body.' optional) through dicts and list indices., Check each rule against a send_once result dict. Returns a list of     {type, o, _error_category(), Any (+10 more)

### Community 17 - "scripts"
Cohesion: 0.07
Nodes (26): concurrently, description, devDependencies, concurrently, picocolors, vitepress, yaml, name (+18 more)

### Community 18 - "CollectionTree.tsx"
Cohesion: 0.16
Nodes (23): App(), loadGlobalSettings(), CollectionTree(), DropTarget, methodColor, Props, Props, configToSettings() (+15 more)

### Community 19 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+16 more)

### Community 20 - "HistoryPage.tsx"
Cohesion: 0.14
Nodes (19): HistoryDetail(), Props, HistoryList(), Props, statusTone, HistoryClient, Props, HistoryCompareResult (+11 more)

### Community 21 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+15 more)

### Community 22 - "HistoryService"
Cohesion: 0.20
Nodes (4): _append_downsampled(), HistoryService, _RunBuffer, _StepBuffer

### Community 23 - "RunMetrics"
Cohesion: 0.23
Nodes (8): Privacy-safe local run history., Sanitized immutable records accepted by the history repository., RunEvent, RunMetrics, RunSample, SQLite persistence for sanitized run history records., HistoryRepositoryTests, make_run()

### Community 24 - "McpSettingsDialog.tsx"
Cohesion: 0.20
Nodes (17): McpSettingsDialog(), Props, STATE_LABEL, DialogDescription, ClientState, getMcpServerPath(), getMcpSkillPath(), getMcpStatus() (+9 more)

### Community 25 - "state.py"
Cohesion: 0.14
Nodes (11): ABC, JsonRepository, Persistence boundary.  The rest of the app talks to a `Repository` and never t, Return the persisted dict, or None if nothing is stored yet., Persist the given dict., Stores everything in a single JSON file (rewritten on each save)., Write atomically: dump to a sibling temp file, flush to disk, then         rena, Repository (+3 more)

### Community 26 - "projects.py"
Cohesion: 0.12
Nodes (13): add_jsonplaceholder_sample(), _blank_template(), _convert_postman_to_our_items(), ensure_jsonplaceholder_project(), export_project(), import_project(), project_template(), A ready-to-edit project envelope so importing is fill-in-the-blanks.     Uses P (+5 more)

### Community 27 - "prepare-desktop.cjs"
Cohesion: 0.10
Nodes (17): backendBuild, backendDir, destBinary, distDir, { execSync, spawnSync }, fs, mcpDestBinary, mcpSrcBinary (+9 more)

### Community 28 - "EndpointTable.tsx"
Cohesion: 0.16
Nodes (17): ALL_METHODS, EndpointTable(), methodColor, Card, CardContent, CardDescription, CardFooter, CardHeader (+9 more)

### Community 29 - "build_jsonplaceholder_project"
Cohesion: 0.21
Nodes (12): Built-in project catalogs., _assertions(), build_jsonplaceholder_project(), _folder(), Deterministic, safe-to-run JSONPlaceholder sample project., Build a fresh project shell around the stable catalog tree., Return a stable UUIDv5 for a catalog logical path., _request() (+4 more)

### Community 30 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 31 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 32 - "useRun.ts"
Cohesion: 0.18
Nodes (14): buildLoadRunPayload(), AppView, parseAppView(), useAppView(), withHistoryStep(), EMPTY_STATS, formatStartLine(), mergeStats() (+6 more)

### Community 33 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, PermissionEntry, ShellScopeEntryAllowedArg, ShellScopeEntryAllowedArgs, Value, anyOf, description (+8 more)

### Community 34 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, Number, PermissionEntry, ShellScopeEntryAllowedArg, ShellScopeEntryAllowedArgs, Value, anyOf, description (+8 more)

### Community 35 - "properties"
Cohesion: 0.13
Nodes (15): properties, default, description, type, type, array, null, description (+7 more)

### Community 36 - "properties"
Cohesion: 0.15
Nodes (13): properties, Identifier, default, description, type, description, oneOf, type (+5 more)

### Community 37 - "Store"
Cohesion: 0.23
Nodes (6): Write current_config back into the active project., Merge a flat list of endpoint dicts (the result of /tests CRUD) back         in, A ready-to-run sample used only when no storage exists yet., Recursively collect only request nodes from a Postman-like items tree., Make current_config reflect active project + environment + global., Store

### Community 38 - "EndpointEditor.tsx"
Cohesion: 0.15
Nodes (9): AssertionsEditor(), opsFor(), AuthType, BODY_TYPES, DYNAMIC_TOKENS, EndpointEditor(), getDefaultForm(), METHOD_STYLES (+1 more)

### Community 39 - "HistoryCompare.tsx"
Cohesion: 0.29
Nodes (10): HistoryChart(), Props, Series, HistoryCompare(), toneClass, buildSvgPoints(), formatMetricDelta(), HIGHER_IS_BETTER (+2 more)

### Community 40 - "compare.py"
Cohesion: 0.28
Nodes (8): _align_series(), compare_details(), _delta(), _nearest_value(), percentile(), Pure metric and time-series comparison helpers., detail(), HistoryCompareTests

### Community 41 - "RunStart"
Cohesion: 0.19
Nodes (3): RunStart, HistoryPrivacyRecoveryTests, HistoryRouteTests

### Community 42 - "history.py"
Cohesion: 0.27
Nodes (10): compare_history(), create_history_group(), delete_history(), export_history(), finish_history_group(), get_history(), list_history(), Privacy-safe Run History REST API. (+2 more)

### Community 43 - "runs.py"
Cohesion: 0.20
Nodes (9): # NOTE: extractor-refreshed variables live in current_config in, Compact per-step summary for a scenario run (no full bodies)., A scenario step passes when it got a response, no assertion failed, and     the, Run a sequence of endpoints in order as one flow (login -> use token ->     ..., run_scenario(), _scenario_step(), _step_succeeded(), websocket_logs() (+1 more)

### Community 44 - "RecordingRepository"
Cohesion: 0.23
Nodes (3): HistoryServiceTests, RecordingRepository, run_start()

### Community 45 - "desktop.json"
Cohesion: 0.17
Nodes (11): description, identifier, local, permissions, $schema, windows, main, shell:allow-execute (+3 more)

### Community 46 - "ResponseInspector.tsx"
Cohesion: 0.27
Nodes (8): bodyKind(), fmtSize(), prettyXml(), Props, ResponseInspector(), statusTone(), Tab, SendResponse

### Community 47 - "dev.mjs"
Cohesion: 0.18
Nodes (8): childEnv, commands, env, requested, { result }, ROOT, SERVICES, unknown

### Community 48 - "useExport.ts"
Cohesion: 0.26
Nodes (13): Props, RunStats, downloadBlob(), escapeCsv(), exportCsv(), ExportFormat, exportJson(), exportLogs() (+5 more)

### Community 49 - "api.ts"
Cohesion: 0.27
Nodes (8): AssertionResult, getBase(), getWsUrl(), ProjectsResponse, req(), resolveBase(), ScenarioStep, HistoryHealth

### Community 50 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 51 - "webviews"
Cohesion: 0.20
Nodes (10): type, webviews, windows, items, description, items, type, description (+2 more)

### Community 52 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include (+1 more)

### Community 53 - "setup.js"
Cohesion: 0.31
Nodes (9): { execSync }, fs, log(), main(), path, pc, rootDir, run() (+1 more)

### Community 55 - "tests.py"
Cohesion: 0.31
Nodes (6): add_test(), duplicate_test(), _parse_endpoint(), EndpointTest, Build an EndpointTest from a request body, turning bad input into a     clear HT, update_test()

### Community 57 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 58 - "CapabilityRemote"
Cohesion: 0.22
Nodes (9): description, properties, required, type, CapabilityRemote, urls, urls, description (+1 more)

### Community 59 - "runner.py"
Cohesion: 0.29
Nodes (3): dispatch(), Run orchestration helpers: thread-safe dispatch + WebSocket broadcasts., Run a coroutine on the main loop from any thread, safely.

### Community 60 - "permissions"
Cohesion: 0.29
Nodes (7): $ref, description, items, type, uniqueItems, items, permissions

### Community 61 - "permissions"
Cohesion: 0.17
Nodes (12): $ref, array, null, description, items, type, uniqueItems, description (+4 more)

### Community 62 - "HistoryPage.test.tsx"
Cohesion: 0.40
Nodes (5): detail(), fakeClient(), metrics, runs, HistoryPage()

### Community 64 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 65 - "Capability"
Cohesion: 0.33
Nodes (6): description, required, type, Capability, identifier, permissions

### Community 66 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 67 - "validate-community-files.mjs"
Cohesion: 0.33
Nodes (4): config, configDocument, issueForms, markdownFiles

### Community 68 - "config.py"
Cohesion: 0.40
Nodes (3): cors_origins(), Runtime configuration derived from the single root `.env`.  Ports live in ONE pl, Allowed browser origins — the frontend port is read from the same .env.

### Community 69 - "desktop-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 70 - "windows-schema.json"
Cohesion: 0.40
Nodes (4): anyOf, description, $schema, title

### Community 71 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 72 - "local"
Cohesion: 0.50
Nodes (4): default, description, type, local

### Community 73 - "Identifier"
Cohesion: 0.67
Nodes (3): Identifier, description, oneOf

### Community 74 - "Target"
Cohesion: 0.67
Nodes (3): Target, description, oneOf

### Community 76 - "Target"
Cohesion: 0.67
Nodes (3): Target, description, oneOf

## Knowledge Gaps
- **395 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+390 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `APITester` connect `APITester` to `EndpointTest`, `mcp_server.py`, `runs.py`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `SqliteRunHistoryRepository` connect `SqliteRunHistoryRepository` to `EndpointTest`, `RunStart`, `state.py`, `RunMetrics`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `HistoryService` (e.g. with `RunEvent` and `RunMetrics`) actually correct?**
  _`HistoryService` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `SqliteRunHistoryRepository` (e.g. with `RunEvent` and `RunMetrics`) actually correct?**
  _`SqliteRunHistoryRepository` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `RunStart` (e.g. with `HistoryService` and `_RunBuffer`) actually correct?**
  _`RunStart` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `RunStepStart` (e.g. with `HistoryService` and `_RunBuffer`) actually correct?**
  _`RunStepStart` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _395 weakly-connected nodes found - possible documentation gaps or missing edges._