// Anonymous usage analytics via Aptabase's Tauri SDK. trackEvent invokes the
// native Rust plugin (registered in src-tauri/main.rs), which sends events over
// native HTTP — NOT the webview. That avoids the macOS `tauri://` CORS issue
// that silently dropped events from the web SDK, and lets the plugin auto-enrich
// with OS + app version. Privacy-first:
//  - desktop only (the SDK requires the Tauri runtime),
//  - gated on the user's opt-out preference,
//  - only coarse, non-identifying props (mode/status enums) — never URLs,
//    endpoint names, payloads, headers, or tokens,
//  - best-effort: never throws, never blocks.
import { trackEvent } from '@aptabase/tauri'
import { isDesktop } from './platform'
import { getAnalyticsEnabled } from './prefs'

export function track(event: string, props?: Record<string, string | number>): void {
  if (!isDesktop() || !getAnalyticsEnabled()) return
  void trackEvent(event, props).catch(() => {})
}
