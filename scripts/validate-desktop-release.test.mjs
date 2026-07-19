import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cargoToml = await readFile(
  new URL("../frontend/src-tauri/Cargo.toml", import.meta.url),
  "utf8",
);
const mainRs = await readFile(
  new URL("../frontend/src-tauri/src/main.rs", import.meta.url),
  "utf8",
);

test("desktop release does not compile with the Tauri devtools feature", () => {
  assert.doesNotMatch(
    cargoToml,
    /tauri\s*=\s*\{[^}]*features\s*=\s*\[[^\]]*"devtools"/s,
  );
});

test("automatic DevTools opening is limited to debug builds", () => {
  assert.match(
    mainRs,
    /#\[cfg\(debug_assertions\)\]\s*\{\s*if let Some\(window\) = app\.get_webview_window\("main"\) \{\s*window\.open_devtools\(\);\s*\}\s*\}/s,
  );
});
