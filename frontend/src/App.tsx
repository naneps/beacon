import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Endpoint, TestConfig } from './types'
import EndpointEditor from './components/EndpointEditor'
import LiveMonitor from './components/LiveMonitor'

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

  if (showEditor) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6">
        <EndpointEditor 
          testId={editingId} 
          config={config} 
          onClose={closeEditor}
          onSave={fetchConfig}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Security Tools</h1>
          <p className="text-sm text-zinc-400">Dynamic API Tester</p>
        </div>

        <Button onClick={openNewEditor} className="mb-4">
          + New Endpoint
        </Button>

        <div className="mt-auto text-xs text-zinc-500">
          React + shadcn/ui + FastAPI
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Dashboard</h2>
          <p className="text-zinc-400">Test endpoints with dynamic payloads and variables</p>
        </div>

        {/* Endpoints Table using shadcn Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.tests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-400">
                      No endpoints yet. Click "New Endpoint".
                    </TableCell>
                  </TableRow>
                ) : (
                  config.tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 text-xs rounded bg-zinc-800">
                          {test.method}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-400">{test.url}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRun(test.id)}
                        >
                          Run
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => openEdit(test.id)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <LiveMonitor logs={runLogs} />

      </div>
    </div>
  )
}

export default App