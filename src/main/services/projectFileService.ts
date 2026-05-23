import { dialog } from 'electron'
import type { BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import type { LearningProject } from '../../shared/project'
import { normalizeProject, parseProjectJson, serializeProject } from '../../shared/project'
import type { ProjectOpenResult, ProjectSaveResult } from '../../shared/ipc'

let currentProjectPath: string | null = null

const jsonFilters = [
  {
    name: 'LearnApp JSON',
    extensions: ['json']
  }
]

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

export const clearCurrentProjectPath = (): void => {
  currentProjectPath = null
}

export const openProjectFile = async (owner: BrowserWindow | null): Promise<ProjectOpenResult> => {
  try {
    const result = owner
      ? await dialog.showOpenDialog(owner, {
          title: '학습 프로젝트 불러오기',
          filters: jsonFilters,
          properties: ['openFile']
        })
      : await dialog.showOpenDialog({
          title: '학습 프로젝트 불러오기',
          filters: jsonFilters,
          properties: ['openFile']
        })

    if (result.canceled || result.filePaths.length === 0) {
      return {
        ok: false,
        reason: 'cancelled',
        message: '불러오기를 취소했습니다.'
      }
    }

    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    const project = parseProjectJson(content)

    currentProjectPath = filePath

    return {
      ok: true,
      project,
      filePath
    }
  } catch (error) {
    return {
      ok: false,
      reason: 'invalid',
      message: getErrorMessage(error)
    }
  }
}

export const saveProjectFile = async (
  owner: BrowserWindow | null,
  project: LearningProject,
  mode: 'save' | 'saveAs'
): Promise<ProjectSaveResult> => {
  try {
    const normalizedProject = normalizeProject(project)
    let targetPath = mode === 'save' ? currentProjectPath : null

    if (!targetPath) {
      const result = owner
        ? await dialog.showSaveDialog(owner, {
            title: '학습 프로젝트 저장',
            defaultPath: `${normalizedProject.title || 'learnapp-project'}.json`,
            filters: jsonFilters
          })
        : await dialog.showSaveDialog({
            title: '학습 프로젝트 저장',
            defaultPath: `${normalizedProject.title || 'learnapp-project'}.json`,
            filters: jsonFilters
          })

      if (result.canceled || !result.filePath) {
        return {
          ok: false,
          reason: 'cancelled',
          message: '저장을 취소했습니다.'
        }
      }

      targetPath = result.filePath
    }

    await writeFile(targetPath, serializeProject(normalizedProject), 'utf-8')
    currentProjectPath = targetPath

    return {
      ok: true,
      filePath: targetPath,
      savedAt: new Date().toISOString()
    }
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      message: getErrorMessage(error)
    }
  }
}
