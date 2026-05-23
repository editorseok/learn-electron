import type { LearningProject } from './project'

export const IPC_CHANNELS = {
  appInfo: 'app:info',
  projectOpen: 'project:open',
  projectSave: 'project:save',
  projectSaveAs: 'project:save-as',
  projectNewSession: 'project:new-session'
} as const

export interface AppInfo {
  name: string
  version: string
  platform: NodeJS.Platform
  isPackaged: boolean
}

export type FileFailureReason = 'cancelled' | 'invalid' | 'error'

export interface FileFailure {
  ok: false
  reason: FileFailureReason
  message: string
}

export interface ProjectOpenSuccess {
  ok: true
  project: LearningProject
  filePath: string
}

export interface ProjectSaveSuccess {
  ok: true
  filePath: string
  savedAt: string
}

export type ProjectOpenResult = ProjectOpenSuccess | FileFailure
export type ProjectSaveResult = ProjectSaveSuccess | FileFailure
