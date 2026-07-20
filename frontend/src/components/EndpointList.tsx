import React from 'react'
import { Endpoint } from '../types'

interface Props {
  tests: Endpoint[]
  onEdit: (id: string) => void
  onRun: (id: string, params: any) => void
}

export default function EndpointList({ tests, onEdit, onRun }: Props) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-5">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">Endpoints</h2>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs text-zinc-400">
            <th className="text-left py-2">Name</th>
            <th>Method</th>
            <th>URL</th>
            <th>Type</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.length === 0 && (
            <tr><td colSpan={5} className="text-center py-8 text-zinc-400">No endpoints yet.</td></tr>
          )}
          {tests.map(test => (
            <tr key={test.id} className="border-b border-zinc-800 hover:bg-zinc-800">
              <td className="py-3">{test.name}</td>
              <td>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  test.method === 'POST' ? 'bg-green-900 text-green-300' : 
                  test.method === 'GET' ? 'bg-blue-900 text-blue-300' : 'bg-zinc-800'
                }`}>
                  {test.method}
                </span>
              </td>
              <td className="text-xs text-zinc-400 font-mono truncate max-w-xs">{test.url}</td>
              <td className="text-xs">{test.target_type === 'web' ? 'web page' : test.payload_type}</td>
              <td className="text-right">
                <button 
                  onClick={() => onRun(test.id, { concurrency: 4, max_requests: 50 })}
                  className="mr-2 px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-600 rounded"
                >
                  RUN
                </button>
                <button 
                  onClick={() => onEdit(test.id)}
                  className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded"
                >
                  EDIT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
