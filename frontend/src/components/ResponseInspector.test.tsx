import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ResponseInspector from './ResponseInspector'

const response = {
  ok: true,
  status: 200,
  reason: 'OK',
  time_ms: 24,
  headers: { 'content-type': 'application/json' },
  body: '{"user":{"id":7}}',
  json: { user: { id: 7 } },
}

describe('ResponseInspector JSON tools', () => {
  it('collapses individual object keys and expands the tree again', () => {
    render(<ResponseInspector response={response} loading={false} />)

    fireEvent.click(screen.getByLabelText('Collapse response key user'))
    expect(screen.getByText('Object(1)')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Expand all nested response keys'))
    expect(screen.getByLabelText('Collapse response key user')).toBeInTheDocument()
  })

  it('copies the formatted response body with the keyboard shortcut', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<ResponseInspector response={response} loading={false} />)

    fireEvent.keyDown(window, { key: 'c', metaKey: true, shiftKey: true })
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(JSON.stringify(response.json, null, 2)))
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })
})
