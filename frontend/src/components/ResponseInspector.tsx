import { useState } from 'react'
import { Clock, HardDrive, Plus, AlertTriangle, Braces, FileJson, ListTree, BadgeCheck } from 'lucide-react'
import type { SendResponse } from '../lib/api'

type Tab = 'body' | 'headers' | 'extracted' | 'assertions'

interface Props {
  response: SendResponse | null
  loading: boolean
  /** Add an extractor to the endpoint: varName <- body.<path>. Only offered
   *  when editing a saved endpoint. */
  onExtract?: (varName: string, path: string) => void
}

const fmtSize = (n?: number) => {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

/** Classify the response body by content-type so the Body tab can render it
 *  appropriately (JSON tree, indented XML/HTML, or plain text). */
function bodyKind(ctype?: string, hasJson?: boolean): 'json' | 'xml' | 'html' | 'text' {
  const c = (ctype || '').toLowerCase()
  if (hasJson || c.includes('json')) return 'json'
  if (c.includes('xml')) return 'xml'
  if (c.includes('html')) return 'html'
  return 'text'
}

/** Minimal, dependency-free XML/HTML indenter for readability. */
function prettyXml(src: string): string {
  const s = src.replace(/>\s*</g, '><').trim()
  let out = ''
  let depth = 0
  s.split(/(<[^>]+>)/g).forEach((tok) => {
    if (!tok) return
    if (/^<\/.+>/.test(tok)) {
      depth = Math.max(0, depth - 1)
      out += '  '.repeat(depth) + tok + '\n'
    } else if (/^<[^!?][^>]*[^/]>$/.test(tok) && !/^<.*<\/.*>$/.test(tok)) {
      out += '  '.repeat(depth) + tok + '\n'
      depth += 1
    } else {
      out += '  '.repeat(depth) + tok + '\n'
    }
  })
  return out.trim() || src
}

function statusTone(status?: number): string {
  if (!status) return 'bg-muted text-muted-foreground'
  if (status >= 200 && status < 300) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
  if (status >= 300 && status < 400) return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/30'
  if (status >= 400 && status < 500) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
  return 'bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/30'
}

export default function ResponseInspector({ response, loading, onExtract }: Props) {
  const [tab, setTab] = useState<Tab>('body')
  const [raw, setRaw] = useState(false)

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
          <span className="text-cyan-500"><ListTree className="h-4 w-4" /></span>
          <h2 className="text-sm font-bold">Response</h2>
        </div>
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" /> Sending request…
        </div>
      </section>
    )
  }

  if (!response) return null

  if (!response.ok) {
    return (
      <section className="rounded-xl border border-red-500/30 bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-red-500/10 px-4 py-3">
          <span className="text-red-500"><AlertTriangle className="h-4 w-4" /></span>
          <h2 className="text-sm font-bold">Request failed</h2>
          {response.time_ms != null && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {response.time_ms} ms
            </span>
          )}
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs text-red-600 dark:text-red-400">{response.error}</pre>
      </section>
    )
  }

  const headers = response.headers || {}
  const kind = bodyKind(response.content_type, response.json != null)
  const canToggleRaw = kind === 'json' || kind === 'xml' || kind === 'html'

  return (
    <section className="rounded-xl border border-border bg-card">
      {/* status bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/25 px-4 py-3">
        <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-extrabold ${statusTone(response.status)}`}>
          {response.status} {response.reason}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {response.time_ms} ms
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <HardDrive className="h-3 w-3" /> {fmtSize(response.size_bytes)}{response.truncated ? ' (truncated)' : ''}
        </span>
        {response.content_type && (
          <span className="truncate font-mono text-[11px] text-muted-foreground">{response.content_type}</span>
        )}
        {response.attempts && response.attempts > 1 && (
          <span className="text-[11px] text-muted-foreground">{response.attempts} tries</span>
        )}
        {response.passed != null && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${response.passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
            {response.passed ? '✓ assertions passed' : '✗ assertions failed'}
          </span>
        )}
        {response.extracted && response.extracted.length > 0 && (
          <span className="ml-auto rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            saved: {response.extracted.join(', ')}
          </span>
        )}
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        <TabBtn active={tab === 'body'} onClick={() => setTab('body')} icon={<FileJson className="h-3.5 w-3.5" />}>Body</TabBtn>
        <TabBtn active={tab === 'headers'} onClick={() => setTab('headers')} icon={<Braces className="h-3.5 w-3.5" />}>
          Headers <span className="text-muted-foreground">({Object.keys(headers).length})</span>
        </TabBtn>
        {response.extracted && response.extracted.length > 0 && (
          <TabBtn active={tab === 'extracted'} onClick={() => setTab('extracted')} icon={<Plus className="h-3.5 w-3.5" />}>Extracted</TabBtn>
        )}
        {response.assertions && response.assertions.length > 0 && (
          <TabBtn active={tab === 'assertions'} onClick={() => setTab('assertions')} icon={<BadgeCheck className="h-3.5 w-3.5" />}>
            Assertions <span className="text-muted-foreground">({response.assertions.filter((a) => a.ok).length}/{response.assertions.length})</span>
          </TabBtn>
        )}
        {tab === 'body' && (
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">{kind}</span>
            {canToggleRaw && (
              <button
                onClick={() => setRaw((r) => !r)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                {raw ? 'Pretty' : 'Raw'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-h-[460px] overflow-auto p-4">
        {tab === 'body' && (() => {
          if (kind === 'json' && response.json != null && !raw)
            return <JsonView value={response.json} path={[]} onExtract={onExtract} />
          if ((kind === 'xml' || kind === 'html') && !raw)
            return <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">{prettyXml(response.body || '')}</pre>
          return <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">{response.body}</pre>
        })()}
        {tab === 'headers' && (
          <table className="w-full text-left font-mono text-xs">
            <tbody>
              {Object.entries(headers).map(([k, v]) => (
                <tr key={k} className="border-b border-border/50">
                  <td className="py-1 pr-3 align-top font-semibold text-muted-foreground">{k}</td>
                  <td className="py-1 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'extracted' && (
          <ul className="space-y-1 text-xs">
            {(response.extracted || []).map((name) => (
              <li key={name} className="font-mono text-emerald-700 dark:text-emerald-300">{`{{${name}}}`} refreshed</li>
            ))}
          </ul>
        )}
        {tab === 'assertions' && (
          <ul className="space-y-1.5 text-xs">
            {(response.assertions || []).map((a, i) => (
              <li key={i} className="flex items-start gap-2 font-mono">
                <span className={a.ok ? 'text-emerald-500' : 'text-red-500'}>{a.ok ? '✓' : '✗'}</span>
                <span className="break-all">
                  <span className="font-semibold">{a.type}</span>{' '}
                  <span className="text-muted-foreground">{a.op}</span>{' '}
                  <span>{JSON.stringify(a.expected)}</span>
                  {!a.ok && a.actual !== undefined && (
                    <span className="text-red-500"> — got {JSON.stringify(a.actual)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon} {children}
    </button>
  )
}

/** Recursive JSON tree. Leaf values expose a "save as variable" action that
 *  builds the extractor path (body.<a>.<b>.<index>) from the node's location. */
function JsonView({ value, path, onExtract }: { value: unknown; path: (string | number)[]; onExtract?: (v: string, p: string) => void }) {
  const indent = { paddingLeft: path.length ? 12 : 0 }

  if (value !== null && typeof value === 'object') {
    const entries: [string | number, unknown][] = Array.isArray(value)
      ? value.map((v, i) => [i, v])
      : Object.entries(value as Record<string, unknown>)
    const open = Array.isArray(value) ? '[' : '{'
    const close = Array.isArray(value) ? ']' : '}'
    if (entries.length === 0) {
      return <span className="font-mono text-xs text-muted-foreground">{open}{close}</span>
    }
    return (
      <div style={indent} className="font-mono text-xs">
        <span className="text-muted-foreground">{open}</span>
        {entries.map(([k, v]) => (
          <div key={String(k)} className="pl-3">
            <span className="text-sky-600 dark:text-sky-400">{Array.isArray(value) ? k : `"${k}"`}</span>
            <span className="text-muted-foreground">: </span>
            <JsonView value={v} path={[...path, k]} onExtract={onExtract} />
          </div>
        ))}
        <span className="text-muted-foreground">{close}</span>
      </div>
    )
  }

  // leaf
  const display =
    typeof value === 'string' ? `"${value}"`
      : value === null ? 'null'
      : String(value)
  const tone =
    typeof value === 'string' ? 'text-emerald-600 dark:text-emerald-400'
      : typeof value === 'number' ? 'text-amber-600 dark:text-amber-400'
      : 'text-purple-600 dark:text-purple-400'

  const pathStr = 'body.' + path.join('.')
  const canExtract = !!onExtract && path.length > 0

  return (
    <span className="group inline-flex items-center gap-1">
      <span className={`break-all ${tone}`}>{display}</span>
      {canExtract && (
        <button
          title={`Save as variable (from ${pathStr})`}
          onClick={() => {
            const def = String(path[path.length - 1])
            const name = window.prompt(`Variable name for ${pathStr}`, def)
            if (name && name.trim()) onExtract!(name.trim(), pathStr)
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Plus className="h-3 w-3 text-cyan-500 hover:text-cyan-400" />
        </button>
      )}
    </span>
  )
}
