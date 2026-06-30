import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Play, Copy, Trash2, Pencil, Search, Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { Endpoint } from '../types'
import { RunStatus } from './LiveMonitor'

const methodColor: Record<string, string> = {
  GET:    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  POST:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  PUT:    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
  PATCH:  'bg-purple-500/15 text-purple-600 dark:text-purple-400',
}

const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface Props {
  tests: Endpoint[]
  selectedId: string | null
  runningTestId: string | null
  runStatus: RunStatus
  onSelect: (id: string) => void
  onNew: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string, name: string) => void
  onRunRow: (id: string) => void
}

export function EndpointTable({
  tests, selectedId, runningTestId, runStatus, onSelect, onNew, onEdit, onDuplicate, onDelete, onRunRow,
}: Props) {
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<string | null>(null)

  const filtered = tests.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.url.toLowerCase().includes(search.toLowerCase())
    const matchesMethod = !methodFilter || t.method === methodFilter
    return matchesSearch && matchesMethod
  })

  // Collect all methods actually used
  const usedMethods = Array.from(new Set(tests.map((t) => t.method))).filter((m) =>
    ALL_METHODS.includes(m)
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-4">
        <CardTitle className="text-sm">
          Endpoints{' '}
          <span className="text-muted-foreground font-normal">
            ({filtered.length}{filtered.length !== tests.length ? `/${tests.length}` : ''})
          </span>
        </CardTitle>
        <Button size="sm" className="h-7" onClick={onNew}>New Endpoint</Button>
      </CardHeader>

      {/* Search + filter bar */}
      {tests.length > 0 && (
        <div className="px-4 pb-2.5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints…"
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {usedMethods.map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(methodFilter === m ? null : m)}
                className={`h-6 px-2 rounded text-[10px] font-mono font-bold transition-all border ${
                  methodFilter === m
                    ? methodColor[m] + ' border-current ring-1 ring-current/30'
                    : 'border-border text-muted-foreground hover:border-current/50 ' + methodColor[m]
                }`}
              >
                {m}
              </button>
            ))}
            {methodFilter && (
              <button
                onClick={() => setMethodFilter(null)}
                className="h-6 px-2 rounded text-[10px] text-muted-foreground hover:text-foreground border border-border transition-colors"
              >
                ✕ clear
              </button>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <Table className="[&_td]:py-2 [&_th]:h-9">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 pl-4"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-20">Method</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right pr-4 w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  {tests.length === 0
                    ? 'No endpoints. Click "New Endpoint" to start.'
                    : 'No endpoints match your search.'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((test) => {
              const selected = test.id === selectedId
              const running = runningTestId === test.id && runStatus === 'running'
              return (
                <TableRow
                  key={test.id}
                  onClick={() => onSelect(test.id)}
                  className={`cursor-pointer ${selected ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                >
                  <TableCell className="pl-4">
                    {running ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    ) : (
                      <span
                        className={`block h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                          selected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40'
                        }`}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {test.name}
                      {running && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse">
                          running
                        </Badge>
                      )}
                      {test.run_config && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
                          override
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`font-mono text-xs ${methodColor[test.method] || 'bg-secondary text-secondary-foreground'}`}>
                      {test.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[260px]">
                    {test.url}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        size="sm"
                        className="gap-1 bg-emerald-600 hover:bg-emerald-600/90 text-white"
                        onClick={() => onRunRow(test.id)}
                        disabled={runStatus === 'running'}
                      >
                        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        {running ? 'Running' : 'Run'}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => onEdit(test.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Duplicate" onClick={() => onDuplicate(test.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => onDelete(test.id, test.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
