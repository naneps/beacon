# Assertions

Assertions let you attach **pass/fail rules** to any endpoint. They are evaluated after every single send (`Send` button) and during load runs or scenarios.

When an assertion fails:
- The response is still recorded.
- The step/request is marked as not successful (`passed: false`).
- In scenarios, a failing assertion stops the flow (unless `continue_on_error`).

## Supported Assertion Types

| Type            | What it checks                  | Operators                              | Extra fields       | Example |
|-----------------|---------------------------------|----------------------------------------|--------------------|---------|
| `status`        | HTTP status code                | `eq`, `ne`, `lt`, `gt`, `lte`, `gte`   | -                  | Status == 200 |
| `time_ms`       | Response time in milliseconds   | `eq`, `ne`, `lt`, `gt`, `lte`, `gte`   | -                  | Time < 800 |
| `body_contains` | Substring in response body      | (implicit contains)                    | -                  | Body contains "success" |
| `jsonpath`      | Value at a JSON path            | `eq`, `ne`, `contains`, `exists`       | `path`             | `body.ok` == true |
| `header`        | Response header                 | `exists`, `eq`, `contains`             | `name`             | Header `content-type` contains json |

## Adding Assertions

1. Open an endpoint in the editor.
2. Scroll to the **Assertions** panel (below Cookies).
3. Click **Add assertion**.
4. Choose the type and fill in the expected value / path / header name.
5. Save the endpoint.

Assertions are stored per-endpoint in your project and travel with exports/imports.

## How Results Appear

- **Single Send / Response Inspector**: A new "Assertions" tab (or section) shows each rule with expected vs actual + pass/fail.
- **Live Monitor** (during runs): Failed assertions are logged and affect success counts.
- **Scenarios**: Each step reports `passed` (true only if response OK + status < 400 + no assertion failures).
- **MCP**: `send_request` and `run_scenario` return the evaluated assertions (with `ok` per rule).

## Common Patterns

**Login must succeed**
- `status` `eq` `200`
- `jsonpath` `body.access_token` `exists`

**Performance budget**
- `time_ms` `lt` `1500`

**Specific header**
- `header` name=`content-type` `contains` `application/json`

**Response body signal**
- `body_contains` `created`

## Notes

- Assertions run on the *final* response (after any retries you configured).
- Extractors still run on 2xx responses even if later assertions fail.
- Use **JSON field** for deep/nested values: `data.user.id`, `items.0.name`, etc.
- For list indexing in JSONPath, the engine supports simple `array.0.key` style paths.

See also:
- [Scenarios](./scenarios.md) — run ordered steps and use assertions to validate the flow.
- [Single Send + Response Inspector](./send-inspect.md) (if created) — where you first see assertion results.
- [Variables & Extractors](./variables.md)
