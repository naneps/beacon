import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Play, Square, Turtle, Zap, Flame, Bomb } from 'lucide-react'
import { RunConfig } from '../types'
import { RunStatus } from './LiveMonitor'

export interface ExecSettings {
  rate: number       // requests / second (derived view of delay)
  delayMs: number
  maxRequests: number
  concurrency: number
  noDelay: boolean
}

export const DEFAULT_SETTINGS: ExecSettings = {
  rate: 5,
  delayMs: 200,
  maxRequests: 200,
  concurrency: 4,
  noDelay: false,
}

export function settingsToConfig(s: ExecSettings): RunConfig {
  return {
    concurrency: Math.max(1, s.concurrency),
    max_requests: Math.max(1, s.maxRequests),
    delay: s.noDelay ? 0 : Math.max(0, s.delayMs) / 1000,
    use_min_delay: s.noDelay,
  }
}

export function configToSettings(c: RunConfig): ExecSettings {
  const delayMs = Math.round((c.delay ?? 0) * 1000)
  return {
    rate: delayMs > 0 ? Math.round(1000 / delayMs) : 0,
    delayMs,
    maxRequests: c.max_requests,
    concurrency: c.concurrency,
    noDelay: c.use_min_delay,
  }
}

interface Preset {
  key: string
  label: string
  icon: React.ReactNode
  s: ExecSettings
  burst?: boolean
}

const PRESETS: Preset[] = [
  {
    key: 'slow',
    label: 'Slow',
    icon: <Turtle className="h-3 w-3" />,
    s: { rate: 2, delayMs: 500, maxRequests: 50, concurrency: 1, noDelay: false },
  },
  {
    key: 'normal',
    label: 'Normal',
    icon: <Zap className="h-3 w-3" />,
    s: { rate: 5, delayMs: 200, maxRequests: 200, concurrency: 4, noDelay: false },
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    icon: <Flame className="h-3 w-3" />,
    s: { rate: 20, delayMs: 50, maxRequests: 500, concurrency: 16, noDelay: false },
  },
  {
    key: 'burst',
    label: 'BURST',
    icon: <Bomb className="h-3 w-3" />,
    s: { rate: 0, delayMs: 0, maxRequests: 1000, concurrency: 32, noDelay: true },
    burst: true,
  },
]

function sameSettings(a: ExecSettings, b: ExecSettings) {
  return (
    a.delayMs === b.delayMs &&
    a.maxRequests === b.maxRequests &&
    a.concurrency === b.concurrency &&
    a.noDelay === b.noDelay
  )
}

/** Estimate run duration in human-readable form. */
function estimateDuration(s: ExecSettings): string {
  if (s.noDelay) {
    // burst: limited by concurrency throughput — rough ~1000 req/s per worker
    const estSec = Math.ceil(s.maxRequests / (s.concurrency * 50))
    return estSec < 2 ? '< 1s' : `~${estSec}s`
  }
  if (s.delayMs === 0) return '< 1s'
  // effective throughput: concurrency / (delayMs / 1000)
  const rps = (s.concurrency * 1000) / s.delayMs
  const estSec = Math.ceil(s.maxRequests / rps)
  if (estSec < 60) return `~${estSec}s`
  return `~${Math.ceil(estSec / 60)}m`
}

interface Props {
  settings: ExecSettings
  onChange: (s: ExecSettings) => void
  status: RunStatus
  selectedName?: string
  hasSelection: boolean
  overrideEnabled: boolean
  onToggleOverride: (on: boolean) => void
  onRun: () => void
  onStop: () => void
}

function NumField({ label, value, onChange, disabled, mono, width = 'w-20' }: {
  label: string; value: number; onChange: (n: number) => void; disabled?: boolean; mono?: boolean; width?: string
}) {
  return (
    <div className={width}>
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`h-8 mt-0.5 px-2 ${mono ? 'font-mono' : ''} disabled:opacity-50`}
      />
    </div>
  )
}

export function ExecutionControls({
  settings, onChange, status, selectedName, hasSelection, overrideEnabled, onToggleOverride, onRun, onStop,
}: Props) {
  const running = status === 'running'

  const setRate = (rate: number) => {
    const r = Math.max(0, rate)
    onChange({ ...settings, rate: r, delayMs: r > 0 ? Math.round(1000 / r) : 0 })
  }
  const setDelay = (delayMs: number) => {
    const d = Math.max(0, delayMs)
    onChange({ ...settings, delayMs: d, rate: d > 0 ? Math.round(1000 / d) : 0 })
  }

  const estimated = estimateDuration(settings)
  const activePreset = PRESETS.find((p) => sameSettings(settings, p.s))

  return (
    <Card>
      <CardContent className="p-3 space-y-2.5">
        {/* Title + presets */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="mr-1">
            <div className="text-sm font-semibold leading-none">Execution Controls</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {hasSelection
                ? <><span>Target: </span><span className="text-foreground font-medium">{selectedName}</span></>
                : 'Select an endpoint'}
              {overrideEnabled && <span className="text-amber-500"> · override</span>}
            </div>
          </div>

          {/* Preset buttons with icons */}
          <div className="flex flex-wrap items-center gap-1 ml-auto">
            {PRESETS.map((p) => {
              const active = activePreset?.key === p.key
              return (
                <Button
                  key={p.key}
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  className={`h-7 text-xs gap-1.5 ${
                    p.burst
                      ? active
                        ? 'bg-amber-600 hover:bg-amber-600/90 text-white border-amber-600'
                        : 'border-amber-600/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                      : ''
                  }`}
                  onClick={() => onChange({ ...p.s })}
                >
                  {p.icon}
                  {p.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Fields + estimated duration + actions */}
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <NumField label="Rate /s"  value={settings.rate}        onChange={setRate}  disabled={settings.noDelay} mono />
          <NumField label="Delay ms" value={settings.delayMs}     onChange={setDelay} disabled={settings.noDelay} mono />
          <NumField label="Max Req"  value={settings.maxRequests} onChange={(n) => onChange({ ...settings, maxRequests: Math.max(1, n) })} mono width="w-24" />
          <NumField label="Workers"  value={settings.concurrency} onChange={(n) => onChange({ ...settings, concurrency: Math.max(1, n) })} mono />

          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none h-8 px-1">
            <input
              type="checkbox"
              checked={settings.noDelay}
              onChange={(e) => onChange({ ...settings, noDelay: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-input accent-primary"
            />
            No delay
          </label>

          {hasSelection && (
            <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none h-8 px-1">
              <input
                type="checkbox"
                checked={overrideEnabled}
                onChange={(e) => onToggleOverride(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input accent-amber-500"
              />
              Override
            </label>
          )}

          {/* Estimated duration pill */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 border border-border px-2 py-1 rounded-md h-8 font-mono select-none">
            <span className="opacity-60">est.</span>
            <span className="font-semibold text-foreground">{estimated}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={onRun}
              disabled={!hasSelection || running}
              size="sm"
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white"
            >
              <Play className="h-3.5 w-3.5" /> Run Selected
            </Button>
            <Button onClick={onStop} disabled={!running} size="sm" variant="destructive" className="h-8 gap-1.5">
              <Square className="h-3 w-3" /> Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
