// Small, local (per-device) app preferences backed by localStorage. These are
// UI/desktop-shell settings, distinct from project/config data on the backend.
const NOTIFY_RUN_FINISHED = 'beacon.notify.runFinished'
const ANALYTICS_ENABLED = 'beacon.analytics.enabled'

export function getNotifyRunFinished(): boolean {
  try {
    return localStorage.getItem(NOTIFY_RUN_FINISHED) !== 'false' // default: on
  } catch {
    return true
  }
}

export function setNotifyRunFinished(enabled: boolean): void {
  try {
    localStorage.setItem(NOTIFY_RUN_FINISHED, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}

/** Anonymous usage analytics (Aptabase). Default on; fully opt-out. */
export function getAnalyticsEnabled(): boolean {
  try {
    return localStorage.getItem(ANALYTICS_ENABLED) !== 'false'
  } catch {
    return true
  }
}

export function setAnalyticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ANALYTICS_ENABLED, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}
