import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'learnApp', {
  configurable: true,
  value: {
    app: {
      getInfo: vi.fn().mockResolvedValue({
        name: 'LearnApp Studio',
        version: '0.1.0',
        platform: 'win32',
        isPackaged: false
      })
    },
    files: {
      openProject: vi.fn(),
      saveProject: vi.fn(),
      saveProjectAs: vi.fn()
    },
    project: {
      startNewSession: vi.fn().mockResolvedValue({ ok: true })
    }
  }
})
