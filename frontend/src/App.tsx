import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Badge } from './components/ui/badge'
import { Endpoint, TestConfig } from './types'
import EndpointEditor from './components/EndpointEditor'
import LiveMonitor from './components/LiveMonitor'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const [config, setConfig] = useState<TestConfig>({ base_url: '', variables: {}, tests: [] })
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [runLogs, setRunLogs] = useState<string[]>([])

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const res = await fetch('/config')
    const data = await res.json()
    setConfig(data)
  }

  const openNewEditor = () => {
    setEditingId(null)
    setShowEditor(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    fetchConfig()
  }

  const handleRun = async (testId: string) => {
    setRunLogs([`Starting run for ${testId}...`])
    const res = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        test_id: testId, 
        concurrency: 4, 
        max_requests: 50,
        delay: 0.1 
      })
    })
    const { run_id } = await res.json()
    
    // Simple polling for demo
    const interval = setInterval(async () => {
      const statusRes = await fetch(`/status/${run_id}`)
      const status = await statusRes.json()
      
      if (status.logs) {
        setRunLogs(status.logs)
      }
      
      if (status.status !== 'running') {
        clearInterval(interval)
        setRunLogs(prev => [...prev, `Run finished: ${status.status}`])
      }
    }, 800)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600" />
            <h1 className="text-2xl font-bold">Security Tools</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Dynamic API Tester</p>
        </div>

        <Button onClick={openNewEditor} className="w-full mb-4">
          + New Endpoint
        </Button>

        <div className="space-y-1 text-sm">
          <div className="px-3 py-2 text-muted-foreground">Endpoints</div>
          <div className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground text-sm">All ({config.tests.length})</div>
        </div>

        <div className="mt-auto pt-8 text-xs text-muted-foreground border-t border-border">
          React + shadcn/ui + FastAPI
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
          <div>
            <h2 className="font-semibold text-xl">Dashboard</h2>
            <p className="text-xs text-muted-foreground">Test and brute force your APIs with dynamic payloads</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Config: {config.base_url || 'not set'}</Badge>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {showEditor ? (
            <EndpointEditor 
              testId={editingId} 
              config={config} 
              onClose={closeEditor}
              onSave={fetchConfig}
            />
          ) : (
            <>
              {/* Endpoints */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Endpoints</CardTitle>
                  <Button size="sm" onClick={openNewEditor}>New Endpoint</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.tests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            No endpoints. Click "New Endpoint" to start.
                          </TableCell>
                        </TableRow>
                      )}
                      {config.tests.map((test: any) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">{test.method}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[280px]">{test.url}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleRun(test.id)}>
                                Run
                              </Button>
                              <Button size="sm" onClick={() => openEdit(test.id)}>
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <LiveMonitor logs={runLogs} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App