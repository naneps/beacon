import { Plus, Trash2 } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export interface Assertion {
  type: string
  op?: string
  value?: any
  name?: string
  path?: string
}

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
  const add = () => onChange([...list, { type: 'status', op: 'eq', value: 200 }])
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i))

  const selectCls = 'h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold'

  return (
    <div className="space-y-2">
      {list.length === 0 && (
        <p className="text-[11px] text-muted-foreground">No assertions. Add pass/fail checks evaluated against the response.</p>
      )}
      {list.map((a, i) => {
        const ops = opsFor(a.type)
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5">
            <select
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
              <select value={a.op || ops[0]} onChange={(e) => update(i, { op: e.target.value })} className={selectCls}>
                {ops.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {a.op !== 'exists' && (
              <Input value={a.value ?? ''} onChange={(e) => update(i, { value: e.target.value })} placeholder="value" className="h-8 w-28 text-xs" />
            )}
            <button onClick={() => remove(i)} className="text-muted-foreground hover:text-red-500" title="Remove">
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
