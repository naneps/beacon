// Desktop auto-update banner. Renders bottom-left (the toast stack owns
// bottom-right) whenever an update is available, downloading, ready, or errored.
// Purely presentational over useUpdater(); it no-ops in the browser build
// because the hook only ever leaves 'idle' on desktop.
import { useUpdater } from '@/hooks/useUpdater'
import { cn } from '@/lib/utils'
import { AlertTriangle, ArrowUpCircle, Download, RotateCw, X } from 'lucide-react'

export function UpdatePrompt() {
  const u = useUpdater()

  const upToDate = u.error === 'up-to-date'
  const visible =
    u.status === 'available' ||
    u.status === 'downloading' ||
    u.status === 'ready' ||
    (u.status === 'error' && !upToDate) ||
    upToDate

  if (!visible) return null

  const pct = Math.round(u.progress * 100)

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-[360px] max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur animate-in slide-in-from-bottom-2 fade-in">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {u.status === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : upToDate ? (
              <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowUpCircle className="h-5 w-5 text-sky-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {u.status === 'available' && (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Update available — v{u.version}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You're on v{u.currentVersion}. Download the latest Beacon.
                </p>
                {u.notes && (
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground/80 whitespace-pre-line">
                    {u.notes}
                  </p>
                )}
              </>
            )}

            {u.status === 'downloading' && (
              <>
                <p className="text-sm font-semibold text-foreground">Downloading update…</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{pct}%</p>
              </>
            )}

            {u.status === 'ready' && (
              <>
                <p className="text-sm font-semibold text-foreground">Update ready</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Restart Beacon to finish updating to v{u.version}.
                </p>
              </>
            )}

            {u.status === 'error' && !upToDate && (
              <>
                <p className="text-sm font-semibold text-foreground">Update failed</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{u.error}</p>
              </>
            )}

            {upToDate && (
              <p className="text-sm font-semibold text-foreground">You're up to date 🎉</p>
            )}

            {/* actions */}
            {(u.status === 'available' || u.status === 'ready' || u.status === 'error') && (
              <div className="mt-3 flex items-center gap-2">
                {u.status === 'available' && (
                  <button
                    onClick={() => void u.downloadAndInstall()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background transition-all hover:-translate-y-px active:scale-[0.98]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download &amp; install
                  </button>
                )}
                {u.status === 'ready' && (
                  <button
                    onClick={() => void u.restart()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background transition-all hover:-translate-y-px active:scale-[0.98]"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Restart now
                  </button>
                )}
                {u.status === 'error' && !upToDate && (
                  <button
                    onClick={() => void u.check()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* dismiss — hidden mid-download so the user can't lose the progress UI */}
          {u.status !== 'downloading' && (
            <button
              onClick={u.dismiss}
              aria-label="Dismiss"
              className={cn(
                'shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
