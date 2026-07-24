import { Plus, Trash2 } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export interface Assertion {
  type: string
  op?: string
  value?: any
  name?: string
  path?: string
  value_type?: 'string' | 'number' | 'boolean' | 'null'
}

const PRESETS: Array<{ label: string; assertions: Assertion[] }> = [
  { label: '2xx success', assertions: [{ type: 'status', op: 'gte', value: 200, value_type: 'number' }, { type: 'status', op: 'lt', value: 300, value_type: 'number' }] },
  { label: 'JSON response', assertions: [{ type: 'header', name: 'content-type', op: 'contains', value: 'application/json', value_type: 'string' }] },
  { label: 'Under 1 second', assertions: [{ type: 'time_ms', op: 'lt', value: 1000, value_type: 'number' }] },
]

const TYPES = [
  { value: 'status', label: 'Status code' },
  { value: 'time_ms', label: 'Time (ms)' },
  { value: 'body_contains', label: 'Body contains' },
  { value: 'jsonpath', label: 'JSON field' },
  { value: 'header', label: 'Header' },
]

const opsFor = (t: string): string[] =>
  t === 'status' || t === 'time_ms' ? ['eq', 'ne', 'lt', 'gt', 'lte', 'gte']
    : t === 'jsonpath' ? ['eq', 'ne', 'contains', 'exists']
    : t === 'header' ? ['exists', 'eq', 'contains']
    : [] // body_contains has no operator (implicit substring)

/** Pass/fail rules checked against the response after a Send / run. */
export function AssertionsEditor({ value, onChange }: { value: Assertion[]; onChange: (v: Assertion[]) => void }) {
  const list = value || []
  const update = (i: number, patch: Partial<Assertion>) =>
    onChange(list.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))
  const add = () => onChange([...list, { type: 'status', op: 'eq', value: 200, value_type: 'number' }])
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i))

  const selectCls = 'h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold'
  const coerce = (raw: string, type: Assertion['value_type']): unknown => {
    if (type === 'number') return raw === '' ? '' : Number(raw)
    if (type === 'boolean') return raw === 'true'
    if (type === 'null') return null
    return raw
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Presets</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange([...list, ...preset.assertions.map((a) => ({ ...a }))])}
            className="rounded-full border border-border bg-muted/30 px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-cyan-500/40 hover:text-foreground"
          >
            + {preset.label}
          </button>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-[11px] text-muted-foreground">No assertions. Add pass/fail checks evaluated against the response.</p>
      )}
      {list.map((a, i) => {
        const ops = opsFor(a.type)
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5">
            <select
              aria-label={`Assertion ${i + 1} target`}
              value={a.type}
              onChange={(e) => update(i, { type: e.target.value, op: opsFor(e.target.value)[0] })}
              className={selectCls}
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {a.type === 'header' && (
              <Input value={a.name || ''} onChange={(e) => update(i, { name: e.target.value })} placeholder="header name" className="h-8 w-32 text-xs" />
            )}
            {a.type === 'jsonpath' && (
              <Input value={a.path || ''} onChange={(e) => update(i, { path: e.target.value })} placeholder="body.data.id" className="h-8 w-40 font-mono text-xs" />
            )}
            {ops.length > 0 && (
              <select aria-label={`Assertion ${i + 1} operator`} value={a.op || ops[0]} onChange={(e) => update(i, { op: e.target.value })} className={selectCls}>
                {ops.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {a.op !== 'exists' && (
              <>
                <select
                  value={a.value_type || (a.type === 'status' || a.type === 'time_ms' ? 'number' : 'string')}
                  onChange={(e) => {
                    const valueType = e.target.value as Assertion['value_type']
                    update(i, { value_type: valueType, value: coerce(String(a.value ?? ''), valueType) })
                  }}
                  className={selectCls}
                  aria-label="Expected value type"
                >
                  <option value="string">text</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="null">null</option>
                </select>
                {(a.value_type || 'string') === 'boolean' ? (
                  <select aria-label={`Assertion ${i + 1} expected boolean`} value={String(a.value ?? false)} onChange={(e) => update(i, { value: e.target.value === 'true' })} className={selectCls}>
                    <option value="true">true</option><option value="false">false</option>
                  </select>
                ) : a.value_type === 'null' ? (
                  <Input value="null" disabled className="h-8 w-28 font-mono text-xs" />
                ) : (
                  <Input
                    type={a.value_type === 'number' || (!a.value_type && (a.type === 'status' || a.type === 'time_ms')) ? 'number' : 'text'}
                    value={a.value ?? ''}
                    onChange={(e) => {
                      const valueType = a.value_type || (a.type === 'status' || a.type === 'time_ms' ? 'number' : 'string')
                      update(i, { value: coerce(e.target.value, valueType) })
                    }}
                    placeholder="value"
                    className="h-8 w-28 text-xs"
                  />
                )}
              </>
            )}
            <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500" title="Remove" aria-label={`Remove assertion ${i + 1}`}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
      <Button variant="outline" size="sm" onClick={add} className="h-7 gap-1.5">
        <Plus className="h-3 w-3" /> Add assertion
      </Button>
    </div>
  )
}
