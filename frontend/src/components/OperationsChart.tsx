import { Expand, Minimize2 } from 'lucide-react'

import { Button } from './ui/button'
import type { ChartPoint } from './liveMonitorMetrics'

interface Props {
  points: ChartPoint[]
  p95: number | null
  expanded: boolean
  onToggleExpanded: () => void
}

const WIDTH = 600
const HEIGHT = 160
const TOP = 10
const BOTTOM = 18

export function OperationsChart({ points, p95, expanded, onToggleExpanded }: Props) {
  const visible = points.slice(-90)
  const maxLatency = Math.max(p95 ?? 0, ...visible.map((point) => point.latency), 1)
  const maxRps = Math.max(...visible.map((point) => point.rps), 1)
  const plotHeight = HEIGHT - TOP - BOTTOM
  const step = visible.length > 1 ? WIDTH / (visible.length - 1) : WIDTH
  const barWidth = Math.max(2, Math.min(12, WIDTH / Math.max(visible.length, 1) - 2))
  const latencyPoints = visible
    .map((point, index) => {
      const x = visible.length === 1 ? WIDTH / 2 : index * step
      const y = TOP + plotHeight - (point.latency / maxLatency) * plotHeight
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const p95Y = p95 == null ? null : TOP + plotHeight - (p95 / maxLatency) * plotHeight
  const lastPoint = visible[visible.length - 1]
  const peakLatency = Math.max(0, ...visible.map((point) => point.latency))
  const peakRps = Math.max(0, ...visible.map((point) => point.rps))

  return (
    <section className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border/70">
        <div className="min-w-0">
          <div className="text-[11px] font-medium">Latency + throughput</div>
          <div className="text-[10px] text-muted-foreground">
            {visible.length > 0 ? `${visible.length} live samples` : 'Waiting for live samples'}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={onToggleExpanded}
          aria-label={expanded ? 'Collapse chart' : 'Expand chart'}
          aria-expanded={expanded}
          title={expanded ? 'Collapse chart' : 'Expand chart'}
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className={`relative px-3 py-2 transition-[height] duration-200 ${
        expanded ? 'h-[260px] md:h-[336px]' : 'h-[168px] md:h-[184px]'
      }`}>
        {visible.length < 2 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Waiting for live samples
          </div>
        ) : (
          <div className="relative h-full w-full">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label={`Latency and throughput trend from ${visible.length} samples`}
          >
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                y1={TOP + plotHeight * fraction}
                x2={WIDTH}
                y2={TOP + plotHeight * fraction}
                className="stroke-border/70"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {visible.map((point, index) => {
              const x = visible.length === 1 ? WIDTH / 2 : index * step
              const height = Math.max(2, (point.rps / maxRps) * plotHeight)
              return (
                <rect
                  key={`${point.attempt}-${index}`}
                  x={Math.max(0, x - barWidth / 2)}
                  y={TOP + plotHeight - height}
                  width={barWidth}
                  height={height}
                  rx="1"
                  className="fill-emerald-500/20"
                />
              )
            })}

            {p95Y != null && (
              <line
                x1="0"
                y1={p95Y}
                x2={WIDTH}
                y2={p95Y}
                className="stroke-amber-500/70"
                strokeWidth="1"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            )}

            <polyline
              points={latencyPoints}
              fill="none"
              className="stroke-cyan-500"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Numeric axis labels — HTML overlay (SVG text would be distorted by
              the non-uniform scaling). Positioned by mapping viewBox y to %. */}
          <div className="pointer-events-none absolute inset-0 text-[9px] font-mono tabular-nums">
            <span style={{ top: `${(TOP / HEIGHT) * 100}%` }} className="absolute left-0 -translate-y-1/2 rounded bg-background/70 px-1 text-cyan-600 dark:text-cyan-400">{Math.round(maxLatency)}ms</span>
            <span style={{ top: `${((TOP + plotHeight / 2) / HEIGHT) * 100}%` }} className="absolute left-0 -translate-y-1/2 rounded bg-background/70 px-1 text-cyan-600/70 dark:text-cyan-400/70">{Math.round(maxLatency / 2)}</span>
            <span style={{ top: `${((TOP + plotHeight) / HEIGHT) * 100}%` }} className="absolute left-0 -translate-y-1/2 rounded bg-background/70 px-1 text-muted-foreground">0</span>
            <span style={{ top: `${(TOP / HEIGHT) * 100}%` }} className="absolute right-0 -translate-y-1/2 rounded bg-background/70 px-1 text-emerald-600 dark:text-emerald-400">{Math.round(maxRps)}/s</span>
            {p95Y != null && p95 != null && (
              <span style={{ top: `${(p95Y / HEIGHT) * 100}%` }} className="absolute right-9 -translate-y-1/2 rounded bg-amber-500/15 px-1 text-amber-600 dark:text-amber-400">p95 {Math.round(p95)}ms</span>
            )}
          </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/70 px-3 py-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 bg-cyan-500" />Latency</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-3 rounded-sm bg-emerald-500/30" />Req/s</span>
        <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 border-t border-dashed border-amber-500" />P95</span>
        {lastPoint && (
          <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono tabular-nums">
            <span>now <b className="font-semibold text-foreground">{Math.round(lastPoint.latency)}</b>ms</span>
            <span>peak <b className="font-semibold text-foreground">{Math.round(peakLatency)}</b>ms</span>
            {p95 != null && <span>p95 <b className="font-semibold text-amber-600 dark:text-amber-400">{Math.round(p95)}</b>ms</span>}
            <span><b className="font-semibold text-emerald-600 dark:text-emerald-400">{lastPoint.rps.toFixed(1)}</b>/s (peak {peakRps.toFixed(1)})</span>
          </span>
        )}
      </div>
    </section>
  )
}
