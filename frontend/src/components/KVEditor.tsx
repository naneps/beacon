import React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface KVEditorProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  label?: string
}

export function KVEditor({ data, onChange, label }: KVEditorProps) {
  const entries = Object.entries(data || {})

  const updateEntry = (index: number, key: string, value: any) => {
    const newEntries = [...entries]
    newEntries[index] = [key, value]
    onChange(Object.fromEntries(newEntries))
  }

  const addEntry = () => {
    onChange({ ...data, '': '' })
  }

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index)
    onChange(Object.fromEntries(newEntries))
  }

  return (
    <div className="space-y-3">
      {label && <div className="text-sm font-medium">{label}</div>}
      {entries.map(([key, value], index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            value={key}
            onChange={(e) => updateEntry(index, e.target.value, value)}
            placeholder="Key"
            className="flex-1"
          />
          <Input
            value={String(value)}
            onChange={(e) => updateEntry(index, key, e.target.value)}
            placeholder="Value (use {{var}} for dynamic)"
            className={`flex-1 font-mono ${String(value).includes('{{') ? 'template-var' : ''}`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeEntry(index)}
            className="text-red-400 hover:text-red-500"
          >
            ×
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry}>
        + Add
      </Button>
    </div>
  )
}