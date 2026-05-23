import { contextBridge, ipcRenderer } from 'electron'
import type { LearningProject } from '@shared/project'
import type { AppInfo, ProjectOpenResult, ProjectSaveResult } from '@shared/ipc'
import { IPC_CHANNELS } from '@shared/ipc'

const api = {
  app: {
    getInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IPC_CHANNELS.appInfo)
  },
  files: {
    openProject: (): Promise<ProjectOpenResult> => ipcRenderer.invoke(IPC_CHANNELS.projectOpen),
    saveProject: (project: LearningProject): Promise<ProjectSaveResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.projectSave, project),
    saveProjectAs: (project: LearningProject): Promise<ProjectSaveResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.projectSaveAs, project)
  },
  project: {
    startNewSession: (): Promise<{ ok: true }> => ipcRenderer.invoke(IPC_CHANNELS.projectNewSession)
  }
}

contextBridge.exposeInMainWorld('learnApp', api)

export type LearnAppApi = typeof api
