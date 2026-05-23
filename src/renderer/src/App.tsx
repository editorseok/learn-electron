import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import {
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Circle,
  FilePlus2,
  FolderOpen,
  Plus,
  Save,
  SaveAll,
  Search,
  Trash2
} from 'lucide-react'
import type { AppInfo } from '@shared/ipc'
import type { LearningNote, LearningProject, NoteUpdate } from '@shared/project'
import {
  calculateProgress,
  createEmptyProject,
  createNote,
  createStarterProject,
  getAllTags,
  removeNote,
  updateNote
} from '@shared/project'

const formatDateTime = (value: string): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const formatDate = (value: string | null): string => {
  if (!value) {
    return '미정'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium'
  }).format(new Date(value))
}

const parseTagInput = (value: string): string[] => {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  )
}

const getNotePreview = (note: LearningNote): string => {
  const firstLine = note.content.split('\n').find((line) => line.trim().length > 0)
  return firstLine ?? '내용 없음'
}

export default function App(): ReactElement {
  const [project, setProject] = useState<LearningProject>(() => createStarterProject())
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => project.settings.lastOpenedNoteId)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)
  const [status, setStatus] = useState('새 파일')
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  const activeNote = useMemo(() => {
    return project.notes.find((note) => note.id === selectedNoteId) ?? project.notes[0] ?? null
  }, [project.notes, selectedNoteId])

  const allTags = useMemo(() => getAllTags(project.notes), [project.notes])
  const progress = useMemo(() => calculateProgress(project.notes), [project.notes])

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return project.notes
      .filter((note) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          note.title.toLowerCase().includes(normalizedQuery) ||
          note.content.toLowerCase().includes(normalizedQuery) ||
          note.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true

        return matchesQuery && matchesTag
      })
      .sort((first, second) => {
        if (first.completed !== second.completed) {
          return Number(first.completed) - Number(second.completed)
        }

        return second.updatedAt.localeCompare(first.updatedAt)
      })
  }, [project.notes, query, selectedTag])

  useEffect(() => {
    window.learnApp.app
      .getInfo()
      .then(setAppInfo)
      .catch(() => setAppInfo(null))
  }, [])

  const commitProject = (updater: (current: LearningProject) => LearningProject): void => {
    setProject((current) => ({
      ...updater(current),
      updatedAt: new Date().toISOString()
    }))
    setStatus('수정됨')
  }

  const selectNote = (noteId: string): void => {
    setSelectedNoteId(noteId)
    setProject((current) => ({
      ...current,
      settings: {
        ...current.settings,
        lastOpenedNoteId: noteId
      }
    }))
  }

  const updateActiveNote = (patch: NoteUpdate): void => {
    if (!activeNote) {
      return
    }

    commitProject((current) => ({
      ...current,
      notes: updateNote(current.notes, activeNote.id, patch),
      settings: {
        ...current.settings,
        lastOpenedNoteId: activeNote.id
      }
    }))
  }

  const addNote = (): void => {
    const now = new Date().toISOString()
    const note = createNote(
      {
        title: '제목 없는 노트',
        tags: selectedTag ? [selectedTag] : []
      },
      now
    )

    commitProject((current) => ({
      ...current,
      notes: [note, ...current.notes],
      settings: {
        ...current.settings,
        lastOpenedNoteId: note.id
      }
    }))
    setSelectedNoteId(note.id)
  }

  const deleteActiveNote = (): void => {
    if (!activeNote) {
      return
    }

    const activeIndex = project.notes.findIndex((note) => note.id === activeNote.id)
    const nextNotes = removeNote(project.notes, activeNote.id)
    const nextSelection = nextNotes[Math.max(0, activeIndex - 1)]?.id ?? nextNotes[0]?.id ?? null

    commitProject((current) => ({
      ...current,
      notes: nextNotes,
      settings: {
        ...current.settings,
        lastOpenedNoteId: nextSelection
      }
    }))
    setSelectedNoteId(nextSelection)
  }

  const createNewProject = async (): Promise<void> => {
    await window.learnApp.project.startNewSession()
    const nextProject = createEmptyProject()
    setProject(nextProject)
    setSelectedNoteId(null)
    setFilePath(null)
    setQuery('')
    setSelectedTag(null)
    setStatus('새 파일')
  }

  const openProject = async (): Promise<void> => {
    setStatus('불러오는 중')
    const result = await window.learnApp.files.openProject()

    if (!result.ok) {
      setStatus(result.reason === 'cancelled' ? '불러오기 취소' : `불러오기 실패: ${result.message}`)
      return
    }

    setProject(result.project)
    setSelectedNoteId(result.project.settings.lastOpenedNoteId ?? result.project.notes[0]?.id ?? null)
    setFilePath(result.filePath)
    setStatus('불러옴')
  }

  const saveProject = async (mode: 'save' | 'saveAs' = 'save'): Promise<void> => {
    setStatus('저장 중')
    const result =
      mode === 'save'
        ? await window.learnApp.files.saveProject(project)
        : await window.learnApp.files.saveProjectAs(project)

    if (!result.ok) {
      setStatus(result.reason === 'cancelled' ? '저장 취소' : `저장 실패: ${result.message}`)
      return
    }

    setFilePath(result.filePath)
    setStatus(`저장됨 ${formatDateTime(result.savedAt)}`)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <BookOpenCheck size={22} />
          </span>
          <div>
            <h1>LearnApp Studio</h1>
            <p>{appInfo ? `v${appInfo.version} / ${appInfo.platform}` : 'Desktop learning workspace'}</p>
          </div>
        </div>

        <div className="toolbar" aria-label="프로젝트 도구">
          <button type="button" className="tool-button" title="새 프로젝트" onClick={createNewProject}>
            <FilePlus2 size={18} />
            <span>새 프로젝트</span>
          </button>
          <button type="button" className="tool-button" title="JSON 불러오기" onClick={openProject}>
            <FolderOpen size={18} />
            <span>불러오기</span>
          </button>
          <button type="button" className="tool-button primary" title="저장" onClick={() => void saveProject()}>
            <Save size={18} />
            <span>저장</span>
          </button>
          <button type="button" className="icon-button" title="다른 이름으로 저장" onClick={() => void saveProject('saveAs')}>
            <SaveAll size={18} />
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar" aria-label="노트 목록">
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label="노트 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 내용, 태그 검색"
            />
          </div>

          <div className="sidebar-actions">
            <button type="button" className="tool-button primary" title="새 노트" onClick={addNote}>
              <Plus size={18} />
              <span>새 노트</span>
            </button>
            <span className="count-label">{filteredNotes.length}개</span>
          </div>

          <div className="tag-strip" aria-label="태그 필터">
            <button
              type="button"
              className={selectedTag === null ? 'tag-filter active' : 'tag-filter'}
              onClick={() => setSelectedTag(null)}
            >
              전체
            </button>
            {allTags.map((tag) => (
              <button
                type="button"
                className={selectedTag === tag ? 'tag-filter active' : 'tag-filter'}
                key={tag}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="note-list">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">노트 없음</div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  type="button"
                  className={note.id === activeNote?.id ? 'note-card active' : 'note-card'}
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                >
                  <span className="note-card-title">
                    {note.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    {note.title}
                  </span>
                  <span className="note-card-preview">{getNotePreview(note)}</span>
                  <span className="note-card-meta">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="editor" aria-label="노트 편집">
          {activeNote ? (
            <>
              <div className="editor-header">
                <label className="title-field">
                  <span>제목</span>
                  <input
                    value={activeNote.title}
                    onChange={(event) => updateActiveNote({ title: event.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className={activeNote.completed ? 'complete-toggle done' : 'complete-toggle'}
                  onClick={() => updateActiveNote({ completed: !activeNote.completed })}
                >
                  {activeNote.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  <span>{activeNote.completed ? '완료' : '진행 중'}</span>
                </button>
              </div>

              <label className="content-field">
                <span>내용</span>
                <textarea
                  value={activeNote.content}
                  onChange={(event) => updateActiveNote({ content: event.target.value })}
                />
              </label>

              <div className="editor-grid">
                <label>
                  <span>태그</span>
                  <input
                    value={activeNote.tags.join(', ')}
                    onChange={(event) => updateActiveNote({ tags: parseTagInput(event.target.value) })}
                    placeholder="react, electron"
                  />
                </label>
                <label>
                  <span>복습 날짜</span>
                  <input
                    type="date"
                    value={activeNote.reviewDate ?? ''}
                    onChange={(event) => updateActiveNote({ reviewDate: event.target.value || null })}
                  />
                </label>
              </div>

              <div className="editor-footer">
                <span>생성 {formatDateTime(activeNote.createdAt)}</span>
                <span>수정 {formatDateTime(activeNote.updatedAt)}</span>
                <button type="button" className="danger-button" title="노트 삭제" onClick={deleteActiveNote}>
                  <Trash2 size={17} />
                  <span>삭제</span>
                </button>
              </div>
            </>
          ) : (
            <div className="empty-editor">
              <BookOpenCheck size={42} />
              <h2>선택된 노트 없음</h2>
              <button type="button" className="tool-button primary" onClick={addNote}>
                <Plus size={18} />
                <span>새 노트</span>
              </button>
            </div>
          )}
        </section>

        <aside className="inspector" aria-label="프로젝트 상태">
          <section className="panel-section">
            <h2>프로젝트</h2>
            <label>
              <span>이름</span>
              <input
                value={project.title}
                onChange={(event) =>
                  commitProject((current) => ({
                    ...current,
                    title: event.target.value
                  }))
                }
              />
            </label>
          </section>

          <section className="panel-section">
            <h2>진행률</h2>
            <div className="progress-ring" style={{ '--progress': `${progress.percent}%` } as CSSProperties}>
              <span>{progress.percent}%</span>
            </div>
            <div className="metric-grid">
              <span>
                <strong>{progress.total}</strong>
                전체
              </span>
              <span>
                <strong>{progress.completed}</strong>
                완료
              </span>
              <span>
                <strong>{progress.pending}</strong>
                진행
              </span>
            </div>
          </section>

          <section className="panel-section">
            <h2>파일</h2>
            <dl className="file-details">
              <div>
                <dt>상태</dt>
                <dd>{status}</dd>
              </div>
              <div>
                <dt>경로</dt>
                <dd title={filePath ?? '저장 전'}>{filePath ?? '저장 전'}</dd>
              </div>
              <div>
                <dt>업데이트</dt>
                <dd>{formatDateTime(project.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel-section">
            <h2>복습</h2>
            <div className="review-date">
              <Calendar size={18} />
              <span>{formatDate(activeNote?.reviewDate ?? null)}</span>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}
