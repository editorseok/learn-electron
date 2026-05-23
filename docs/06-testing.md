# 06. 테스트 따라 만들기

테스트는 앱이 커져도 기존 기능이 깨지지 않도록 도와줍니다. 처음부터 모든 것을 테스트하지 말고, 데이터가 망가지면 치명적인 부분부터 테스트합니다.

## 1단계: 테스트 설정 파일 만들기

만들 파일:

```txt
vitest.config.ts
src/renderer/src/test/setup.ts
```

`vitest.config.ts`에서는 React 테스트를 위해 `jsdom`을 사용합니다.

```ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/renderer/src/test/setup.ts']
  }
})
```

`setup.ts`에서는 preload API를 mock으로 만듭니다.

```ts
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
```

왜 이렇게 하나요:

- 테스트 환경에는 실제 Electron preload가 없습니다.
- React 컴포넌트가 `window.learnApp`을 사용할 수 있도록 가짜 객체를 넣어 줍니다.
- `cleanup()`은 테스트가 끝날 때마다 이전 화면을 정리해서 다음 테스트와 섞이지 않게 합니다.

## 2단계: 도메인 로직 테스트 만들기

만들 파일:

```txt
tests/unit/project.test.ts
```

먼저 JSON 저장과 불러오기 왕복을 테스트합니다.

```ts
it('serializes and parses a project without losing notes', () => {
  const project = createEmptyProject('테스트 프로젝트')
  const json = serializeProject(project)
  const parsed = parseProjectJson(json)

  expect(parsed.title).toBe('테스트 프로젝트')
})
```

추가로 테스트할 것:

- 노트 수정
- 노트 삭제
- 진행률 계산
- 지원하지 않는 JSON 버전 거부

## 3단계: React 화면 테스트 만들기

만들 파일:

```txt
tests/renderer/App.test.tsx
```

사용자가 보는 것을 기준으로 테스트합니다.

```ts
render(<App />)

expect(screen.getByRole('heading', { name: 'LearnApp Studio' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: /새 노트/ })).toBeInTheDocument()
```

버튼 클릭은 `userEvent`를 사용합니다.

```ts
const user = userEvent.setup()

await user.click(screen.getByRole('button', { name: /새 노트/ }))

expect(screen.getByDisplayValue('제목 없는 노트')).toBeInTheDocument()
```

## 4단계: 테스트 실행

```bash
npm run test
```

커버리지도 확인합니다.

```bash
npm run test:coverage
```

## 5단계: 테스트 습관 만들기

기능을 하나 만들 때마다 아래 순서로 확인합니다.

```bash
npm run typecheck
npm run lint
npm run test
```

처음에는 느리게 느껴져도, 나중에 오류를 찾는 시간을 크게 줄여 줍니다.
