import { describe, expect, it } from 'vitest'
import {
  calculateProgress,
  createEmptyProject,
  createNote,
  parseProjectJson,
  removeNote,
  serializeProject,
  updateNote
} from '../../src/shared/project'

describe('project model', () => {
  it('serializes and parses a project without losing notes', () => {
    const project = createEmptyProject('테스트 프로젝트', '2026-05-23T00:00:00.000Z')
    const note = createNote(
      {
        title: '타입스크립트',
        content: '타입으로 데이터 구조를 먼저 정한다.',
        tags: ['typescript', 'react']
      },
      '2026-05-23T00:00:00.000Z'
    )

    const json = serializeProject({
      ...project,
      notes: [note]
    })

    const parsed = parseProjectJson(json)

    expect(parsed.title).toBe('테스트 프로젝트')
    expect(parsed.notes).toHaveLength(1)
    expect(parsed.notes[0].tags).toEqual(['typescript', 'react'])
  })

  it('updates and removes notes immutably', () => {
    const note = createNote({ title: '처음 제목' }, '2026-05-23T00:00:00.000Z')
    const updated = updateNote([note], note.id, { title: '수정 제목', completed: true }, '2026-05-23T01:00:00.000Z')

    expect(updated[0]).not.toBe(note)
    expect(updated[0].title).toBe('수정 제목')
    expect(updated[0].completed).toBe(true)

    expect(removeNote(updated, note.id)).toEqual([])
  })

  it('calculates learning progress', () => {
    const first = createNote({ completed: true }, '2026-05-23T00:00:00.000Z')
    const second = createNote({ completed: false }, '2026-05-23T00:00:00.000Z')

    expect(calculateProgress([first, second])).toEqual({
      total: 2,
      completed: 1,
      pending: 1,
      percent: 50
    })
  })

  it('rejects unsupported project versions', () => {
    expect(() => parseProjectJson('{"schemaVersion":99,"notes":[]}')).toThrow('지원하지 않는 프로젝트 버전')
  })
})
