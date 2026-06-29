import React from 'react'
import { RunStatus } from '../types'

interface Props {
  runStatus: RunStatus | null
  logs: string[]
  onClear: () => void
}

export default function LiveMonitor({ runStatus, logs, onClear }: Props) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-5">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold">Live Monitor</h3>
        <button onClick={onClear} className="text-xs">Clear</button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 text-sm mb-4">
        <div className="bg-zinc-800 p-2 rounded">Attempts: {runStatus?.stats?.attempts || 0}</div>
        <div className="bg-zinc-800 p-2 rounded text-green-400">Success: {runStatus?.stats?.success || 0}</div>
        <div className="bg-zinc-800 p-2 rounded text-yellow-400">Rate Limited: {runStatus?.stats?.rate_limited || 0}</div>
        <div className="bg-zinc-800 p-2 rounded text-red-400">Errors: {runStatus?.stats?.errors || 0}</div>
      </div>

      <div className="log-container bg-black h-64 overflow-auto p-3 rounded text-xs border border-zinc-800">
        {logs.map((l, i) => <div key={i}>{l}</div>)}
        {logs.length === 0 && <div className="text-zinc-500">No logs yet. Run an endpoint.</div>}
      </div>
    </div>
  )
}