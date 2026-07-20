import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { useConfirmDialog } from './confirm-dialog'

function Harness() {
  const { confirm, confirmationDialog } = useConfirmDialog()
  const [result, setResult] = useState('idle')

  const request = async () => {
    const accepted = await confirm({
      title: 'Delete endpoint?',
      description: 'The endpoint will be removed.',
      confirmLabel: 'Delete endpoint',
      detail: 'This action cannot be undone.',
    })
    setResult(accepted ? 'confirmed' : 'cancelled')
  }

  return (
    <>
      <button onClick={request}>Open confirmation</button>
      <output>{result}</output>
      {confirmationDialog}
    </>
  )
}

describe('useConfirmDialog', () => {
  it('resolves destructive confirmation without using a native browser prompt', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Open confirmation' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete endpoint' }))
    expect(screen.getByText('confirmed')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('resolves false when cancelled', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Open confirmation' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('cancelled')).toBeInTheDocument()
  })
})
