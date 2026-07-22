// Anonymous usage analytics via Aptabase's web SDK (runs in the webview over
// fetch — no native plugin / Tokio runtime, so no startup panics). Privacy-first:
//  - desktop only,
//  - gated on the user's opt-out preference,
//  - only ever coarse, non-identifying props (mode/status enums) — NEVER URLs,
//    endpoint names, payloads, headers, or tokens,
//  - best-effort: never throws, never blocks.
import { init, trackEvent } from '@aptabase/web'
import { isDesktop } from './platform'
import { getAnalyticsEnabled } from './prefs'

// Aptabase app key. Client/ingest key (safe to ship) — override per env via
// VITE_APTABASE_KEY in the root .env; set it empty to disable analytics.
const APP_KEY = (import.meta as any).env?.VITE_APTABASE_KEY ?? 'A-US-7075915871'
let started = false

function ready(): boolean {
  if (!APP_KEY || !isDesktop() || !getAnalyticsEnabled()) return false
  if (!started) {
    try {
      // The web SDK can't infer the desktop app version (the native plugin
      // would) — feed it the build-time baked version so the Aptabase dashboard
      // groups by app version correctly.
      const appVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : undefined
      init(APP_KEY, appVersion ? { appVersion } : undefined)
      started = true
    } catch {
      return false
    }
  }
  return true
}

export function track(event: string, props?: Record<string, string | number>): void {
  if (!ready()) return
  void trackEvent(event, props).catch(() => {})
}
