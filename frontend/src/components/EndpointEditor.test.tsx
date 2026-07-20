import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import EndpointEditor from './EndpointEditor'
import type { TestConfig } from '../types'


const config: TestConfig = {
  base_url: '',
  variables: {},
  tests: [],
}


describe('EndpointEditor Web Page target', () => {
  it('applies a safe document-load preset and explains the browser boundary', async () => {
    const user = userEvent.setup()
    render(
      <EndpointEditor
        testId={null}
        config={config}
        currentProjectName="Demo"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Web Page HTML document load/i }))

    expect(screen.getByPlaceholderText('Endpoint name')).toHaveValue('Website homepage')
    expect(screen.getByPlaceholderText('https://example.com/')).toHaveValue('https://example.com/')
    expect(screen.getByRole('button', { name: 'POST' })).toBeDisabled()
    expect(screen.queryByDisplayValue('Content-Type')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Accept')).toBeInTheDocument()
    expect(screen.getByText(/does not execute JavaScript or download page assets/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Web Page HTML document load/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
