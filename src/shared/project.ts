export const PROJECT_SCHEMA_VERSION = 1

export type ThemePreference = 'system' | 'light' | 'dark'

export interface LearningNote {
  id: string
  title: string
  content: string
  tags: string[]
  completed: boolean
  reviewDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectSettings {
  theme: ThemePreference
  lastOpenedNoteId: string | null
}

export interface LearningProject {
  schemaVersion: typeof PROJECT_SCHEMA_VERSION
  title: string
  notes: LearningNote[]
  settings: ProjectSettings
  updatedAt: string
}

export type NoteUpdate = Partial<Omit<LearningNote, 'id' | 'createdAt' | 'updatedAt'>>

export interface ProjectProgress {
  total: number
  completed: number
  pending: number
  percent: number
}

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const asTrimmedString = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

const asNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return []
  }

  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  )
}

const createId = (prefix: string): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const createNote = (
  draft: Partial<Omit<LearningNote, 'id' | 'createdAt' | 'updatedAt'>> = {},
  now = new Date().toISOString()
): LearningNote => {
  return {
    id: createId('note'),
    title: draft.title?.trim() || '제목 없는 노트',
    content: draft.content ?? '',
    tags: normalizeTags(draft.tags ?? []),
    completed: draft.completed ?? false,
    reviewDate: draft.reviewDate ?? null,
    createdAt: now,
    updatedAt: now
  }
}

export const createEmptyProject = (
  title = '새 학습 프로젝트',
  now = new Date().toISOString()
): LearningProject => {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    title,
    notes: [],
    settings: {
      theme: 'system',
      lastOpenedNoteId: null
    },
    updatedAt: now
  }
}

export const createStarterProject = (now = new Date().toISOString()): LearningProject => {
  const notes = [
    createNote(
      {
        title: 'Electron 구조 이해하기',
        content:
          'main process는 창과 파일 시스템을 담당하고, renderer는 React 화면을 담당합니다.\npreload는 두 영역 사이에 안전한 API만 연결합니다.',
        tags: ['electron', 'architecture'],
        reviewDate: null
      },
      now
    ),
    createNote(
      {
        title: 'JSON 저장 흐름 정리',
        content:
          'React 화면에서 저장 버튼을 누르면 preload API를 거쳐 main process의 파일 서비스가 JSON 파일을 저장합니다.',
        tags: ['json', 'ipc'],
        reviewDate: null
      },
      now
    )
  ]

  return {
    ...createEmptyProject('LearnApp 학습 노트', now),
    notes,
    settings: {
      theme: 'system',
      lastOpenedNoteId: notes[0]?.id ?? null
    }
  }
}

export const updateNote = (
  notes: LearningNote[],
  noteId: string,
  patch: NoteUpdate,
  now = new Date().toISOString()
): LearningNote[] => {
  return notes.map((note) => {
    if (note.id !== noteId) {
      return note
    }

    return {
      ...note,
      ...patch,
      title: patch.title?.trim() || note.title,
      tags: Object.prototype.hasOwnProperty.call(patch, 'tags') ? normalizeTags(patch.tags) : note.tags,
      updatedAt: now
    }
  })
}

export const removeNote = (notes: LearningNote[], noteId: string): LearningNote[] => {
  return notes.filter((note) => note.id !== noteId)
}

export const getAllTags = (notes: LearningNote[]): string[] => {
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort((a, b) => a.localeCompare(b))
}

export const calculateProgress = (notes: LearningNote[]): ProjectProgress => {
  const total = notes.length
  const completed = notes.filter((note) => note.completed).length
  const pending = total - completed

  return {
    total,
    completed,
    pending,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100)
  }
}

const normalizeNote = (value: unknown, index: number, now: string): LearningNote => {
  if (!isRecord(value)) {
    throw new Error(`notes[${index}] 항목이 올바른 객체가 아닙니다.`)
  }

  return {
    id: asTrimmedString(value.id, `note-${index}`),
    title: asTrimmedString(value.title, '제목 없는 노트'),
    content: typeof value.content === 'string' ? value.content : '',
    tags: normalizeTags(value.tags),
    completed: typeof value.completed === 'boolean' ? value.completed : false,
    reviewDate: asNullableString(value.reviewDate),
    createdAt: asTrimmedString(value.createdAt, now),
    updatedAt: asTrimmedString(value.updatedAt, now)
  }
}

const normalizeSettings = (value: unknown): ProjectSettings => {
  const settings = isRecord(value) ? value : {}
  const theme = settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'system'
    ? settings.theme
    : 'system'

  return {
    theme,
    lastOpenedNoteId: asNullableString(settings.lastOpenedNoteId)
  }
}

export const normalizeProject = (value: unknown): LearningProject => {
  if (!isRecord(value)) {
    throw new Error('프로젝트 파일은 JSON 객체여야 합니다.')
  }

  const schemaVersion = Number(value.schemaVersion ?? value.version)
  if (schemaVersion !== PROJECT_SCHEMA_VERSION) {
    throw new Error(`지원하지 않는 프로젝트 버전입니다. 현재 지원 버전: ${PROJECT_SCHEMA_VERSION}`)
  }

  if (!Array.isArray(value.notes)) {
    throw new Error('프로젝트 파일에는 notes 배열이 필요합니다.')
  }

  const now = new Date().toISOString()
  const notes = value.notes.map((note, index) => normalizeNote(note, index, now))

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    title: asTrimmedString(value.title, '불러온 학습 프로젝트'),
    notes,
    settings: normalizeSettings(value.settings),
    updatedAt: asTrimmedString(value.updatedAt, now)
  }
}

export const serializeProject = (project: LearningProject): string => {
  return `${JSON.stringify(normalizeProject(project), null, 2)}\n`
}

export const parseProjectJson = (json: string): LearningProject => {
  try {
    return normalizeProject(JSON.parse(json))
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON 문법을 확인해 주세요.', { cause: error })
    }

    throw error
  }
}
