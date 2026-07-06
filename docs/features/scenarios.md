# Scenarios

Scenarios let you run a **sequence of endpoints in order** as a single flow. This is perfect for:

- Login → use the token in the next request
- Multi-step business flows (create → update → verify)
- Chained authentication or setup steps

Each step is executed as a **single send** (not a load run). Variables refreshed by extractors on one step are immediately available to later steps.

## Running a Scenario

### From the UI (Folder or selection)

1. Select a folder (or multiple endpoints).
2. Use **Run as Scenario** (or the equivalent in the tree context menu).
3. Beacon will send the endpoints **in the displayed order**.
4. Results appear in the **Scenario Results** dialog.

You can also trigger scenarios from the MCP tools or the REST API (`POST /scenario`).

### Options

- **continue_on_error**: If true, keep going even if a step fails (default: stop on first failure).
- **retries** + **retry_delay**: Per-step retry configuration (same as single Send).

## Results

Each step reports a compact summary:

- `name`, `status`, `time_ms`
- `ok` (network success)
- `passed` (response received + status < 400 + all assertions passed)
- `extracted` (names of variables that were refreshed)
- `error` (if any)

The overall scenario has:
- `passed`: true only if every step succeeded
- `steps`: array of per-step results
- `completed` / `total`

The Scenario Results dialog shows this structured view.

## How It Differs from "Run Folder"

- **Run Folder** (in load-test mode): fires the endpoints concurrently or with the normal load runner settings (concurrency, count, delay). Good for load.
- **Scenario**: strict sequential execution using single `send_once`. Extractors and variables carry forward automatically. Best for functional flows.

You can use **Run Folder as Scenario** when you want ordered execution with chaining.

## Assertions + Scenarios

Assertions are evaluated on every step. A failing assertion counts as a failed step (see `_step_succeeded` logic).

Example flow:
1. `POST /login` — assertion: `status eq 200`, extractor: `access_token` ← `body.access_token`
2. `GET /profile` — uses `{{access_token}}` in header, assertion: `jsonpath body.id exists`

If step 1 fails an assertion, step 2 is skipped (unless continue_on_error).

## MCP Usage

```json
// Example tool call (via any MCP client)
run_scenario(
  name_or_ids: ["login-endpoint", "get-profile"],
  continue_on_error: false,
  retries: 1,
  retry_delay: 0.5
)
```

Returns the steps + overall `passed` flag.

See the MCP skill documentation for the exact tool signatures.

## Tips

- Order matters — drag to reorder in the tree before running.
- Use folders to group scenario steps.
- Combine with global variables or environment variables for base URLs / secrets.
- For pure load testing of a multi-step flow, you can still use the normal runner with a small folder, but extractors will refresh across the concurrent workers too.

## Related

- [Assertions](./assertions.md)
- [Variables & Extractors](./variables.md)
- [Chaining](./chaining.md)
- [Monitoring](./monitoring.md)
- MCP `run_scenario` tool
