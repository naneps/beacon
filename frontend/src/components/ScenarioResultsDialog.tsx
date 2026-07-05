import { X } from 'lucide-react'
import type { ScenarioResult } from '../lib/api'

/** Modal summary of a scenario (chained) run — one line per step. */
export function ScenarioResultsDialog({ result, onClose }: { result: ScenarioResult | null; onClose: () => void }) {
  if (!result) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Scenario result</h2>
            <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${result.passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </span>
            <span className="text-xs text-muted-foreground">{result.completed}/{result.total} steps</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <ol className="max-h-[60vh] space-y-1.5 overflow-auto p-3">
          {result.steps.map((s, i) => {
            const ok = s.success ?? (s.ok && s.passed !== false)
            return (
              <li key={i} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <span className={ok ? 'text-emerald-500' : 'text-red-500'}>{ok ? '✓' : '✗'}</span>
                <span className="flex-1 truncate font-semibold">{i + 1}. {s.name || s.test_id}</span>
                {s.status != null && <span className="font-mono">{s.status}</span>}
                {s.time_ms != null && <span className="text-muted-foreground">{s.time_ms}ms</span>}
                {s.extracted && s.extracted.length > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400" title="variables refreshed">+{s.extracted.join(', ')}</span>
                )}
                {s.error && <span className="truncate text-red-500" title={s.error}>{s.error}</span>}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
