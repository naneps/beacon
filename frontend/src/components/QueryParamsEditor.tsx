import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from './ui/input'
import { parseQueryParams, buildUrlWithQuery, type QueryParam } from '../lib/queryParams'

interface Props {
  url: string
  onChange: (url: string) => void
}

export function QueryParamsEditor({ url, onChange }: Props) {
  const params = parseQueryParams(url)
  const [draft, setDraft] = useState<QueryParam>({ key: '', value: '' })

  const commit = (next: QueryParam[]) => onChange(buildUrlWithQuery(url, next))
  const update = (index: number, field: keyof QueryParam, value: string) => {
    const next = params.map((param, current) => current === index ? { ...param, [field]: value } : param)
    commit(next)
  }
  const addDraft = () => {
    if (!draft.key && !draft.value) return
    commit([...params, draft])
    setDraft({ key: '', value: '' })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_32px] gap-2 px-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>Key</span><span>Value</span><span className="sr-only">Actions</span>
      </div>
      {params.map((param, index) => (
        <div key={index} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_32px] items-center gap-2">
          <Input
            value={param.key}
            onChange={(event) => update(index, 'key', event.target.value)}
            placeholder="page"
            className="h-8 font-mono text-xs"
          />
          <Input
            value={param.value}
            onChange={(event) => update(index, 'value', event.target.value)}
            placeholder="1 or {{variable}}"
            className={`h-8 font-mono text-xs ${param.value.includes('{{') ? 'template-var' : ''}`}
          />
          <button
            type="button"
            onClick={() => commit(params.filter((_, current) => current !== index))}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
            aria-label={`Remove query parameter ${param.key || index + 1}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_32px] items-center gap-2 opacity-70 transition-opacity focus-within:opacity-100">
        <Input
          value={draft.key}
          onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value }))}
          onKeyDown={(event) => { if (event.key === 'Enter') addDraft() }}
          placeholder="Add parameter"
          className="h-8 border-dashed font-mono text-xs"
        />
        <Input
          value={draft.value}
          onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))}
          onKeyDown={(event) => { if (event.key === 'Enter') addDraft() }}
          placeholder="Value"
          className="h-8 border-dashed font-mono text-xs"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={!draft.key && !draft.value}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-cyan-500/10 hover:text-cyan-500 disabled:opacity-40"
          aria-label="Add query parameter"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
