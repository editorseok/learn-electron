import type { LearnAppApi } from '../../preload'

declare global {
  interface Window {
    learnApp: LearnAppApi
  }
}

export {}
