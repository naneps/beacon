// Single source of truth for "are we running inside the desktop shell?".
// Used to switch the API base, the WebSocket base, and the initial view so the
// detection can't drift between call sites.
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as any
  return !!w.__TAURI_INTERNALS__ || !!w.__TAURI__ || !!w.process?.versions?.electron
}
