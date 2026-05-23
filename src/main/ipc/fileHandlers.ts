import { app, ipcMain } from 'electron'
import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { LearningProject } from '../../shared/project'
import { IPC_CHANNELS } from '../../shared/ipc'
import {
  clearCurrentProjectPath,
  openProjectFile,
  saveProjectFile
} from '../services/projectFileService'

type WindowGetter = () => BrowserWindow | null

const assertTrustedSender = (event: IpcMainInvokeEvent): void => {
  const senderUrl = event.senderFrame?.url ?? event.sender.getURL()

  if (process.env.ELECTRON_RENDERER_URL) {
    const expectedOrigin = new URL(process.env.ELECTRON_RENDERER_URL).origin
    const actualOrigin = new URL(senderUrl).origin

    if (actualOrigin === expectedOrigin) {
      return
    }
  }

  if (!process.env.ELECTRON_RENDERER_URL && senderUrl.startsWith('file://')) {
    return
  }

  throw new Error(`Blocked IPC call from ${senderUrl}`)
}

export const registerProjectFileHandlers = (getWindow: WindowGetter): void => {
  ipcMain.handle(IPC_CHANNELS.appInfo, (event) => {
    assertTrustedSender(event)

    return {
      name: app.name,
      version: app.getVersion(),
      platform: process.platform,
      isPackaged: app.isPackaged
    }
  })

  ipcMain.handle(IPC_CHANNELS.projectOpen, (event) => {
    assertTrustedSender(event)
    return openProjectFile(getWindow())
  })

  ipcMain.handle(IPC_CHANNELS.projectSave, (event, project: LearningProject) => {
    assertTrustedSender(event)
    return saveProjectFile(getWindow(), project, 'save')
  })

  ipcMain.handle(IPC_CHANNELS.projectSaveAs, (event, project: LearningProject) => {
    assertTrustedSender(event)
    return saveProjectFile(getWindow(), project, 'saveAs')
  })

  ipcMain.handle(IPC_CHANNELS.projectNewSession, (event) => {
    assertTrustedSender(event)
    clearCurrentProjectPath()
    return { ok: true }
  })
}
