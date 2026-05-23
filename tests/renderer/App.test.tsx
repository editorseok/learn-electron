import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/renderer/src/App'

describe('App', () => {
  it('renders the learning workspace', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'LearnApp Studio' })).toBeInTheDocument()
    expect(await screen.findByText(/v0.1.0/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /새 노트/ })).toBeInTheDocument()
  })

  it('creates a note from the sidebar action', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /새 노트/ }))

    expect(screen.getByDisplayValue('제목 없는 노트')).toBeInTheDocument()
  })
})
