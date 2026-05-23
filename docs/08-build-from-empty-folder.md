# 08. 빈 폴더에서 직접 만들기

이 문서는 완성된 소스를 복사해서 실행하는 방식이 아닙니다. 빈 폴더에서 시작해 프로젝트를 직접 구성하는 실습 문서입니다.

각 단계마다 먼저 작은 파일을 만들고, 명령어로 확인합니다. 막히면 완성본 파일과 비교하되, 처음에는 직접 입력하면서 구조를 익히는 것을 권장합니다.

## 1단계: npm 프로젝트 만들기

```bash
npm init -y
```

생성된 `package.json`에서 `name`, `version`, `description`을 정리합니다.

```json
{
  "name": "learnapp-desktop",
  "version": "0.1.0",
  "description": "Learning note desktop app built with Vite, Electron, TypeScript, and React.",
  "main": "./out/main/index.js",
  "author": "LearnApp",
  "license": "MIT"
}
```

왜 이렇게 하나요:

- `main`은 빌드된 Electron main process 진입 파일을 가리킵니다.
- 나중에 electron-builder가 이 값을 기준으로 앱을 패키징합니다.

## 2단계: 의존성 설치하기

런타임 의존성을 설치합니다.

```bash
npm install react react-dom lucide-react
```

개발 의존성을 설치합니다.

```bash
npm install -D electron@41.3.0 --save-exact
npm install -D electron-builder electron-vite@5 vite@7 @vitejs/plugin-react@5
npm install -D typescript vitest jsdom @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

확인합니다.

```bash
npm ls electron
```

`electron@41.3.0`이 출력되면 됩니다.

## 3단계: npm scripts 작성하기

`package.json`에 scripts를 추가합니다.

```json
{
  "scripts": {
    "dev": "set ELECTRON_RUN_AS_NODE=&& electron-vite dev",
    "preview": "set ELECTRON_RUN_AS_NODE=&& electron-vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "build": "npm run typecheck && electron-vite build",
    "dist:win": "npm run build && electron-builder --win nsis portable"
  }
}
```

왜 이렇게 하나요:

- `dev`: 개발용 Electron 앱 실행
- `typecheck`: TypeScript 타입 확인
- `lint`: 코드 규칙 확인
- `test`: 자동 테스트 실행
- `build`: 배포 전 번들 생성
- `dist:win`: Windows 설치 파일 생성

## 4단계: 설정 파일 만들기

프로젝트 루트에 아래 파일을 만듭니다.

```txt
electron.vite.config.ts
tsconfig.json
vitest.config.ts
eslint.config.mjs
```

### electron.vite.config.ts

```ts
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

const sharedAlias = {
  '@shared': resolve('src/shared')
}

export default defineConfig({
  main: {
    resolve: {
      alias: sharedAlias
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: sharedAlias
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        ...sharedAlias,
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
```

핵심은 `main`, `preload`, `renderer`를 따로 빌드한다는 점입니다.

### tsconfig.json

처음에는 엄격한 타입 검사를 켭니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "ignoreDeprecations": "6.0",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@renderer/*": ["src/renderer/src/*"]
    },
    "types": ["node", "vite/client", "vitest/globals", "electron-vite/node"]
  },
  "include": ["src", "tests", "electron.vite.config.ts", "vitest.config.ts", "eslint.config.mjs"]
}
```

확인합니다.

```bash
npm run typecheck
```

아직 `src` 폴더가 없어도 설정 파일 문법 오류가 있는지 확인할 수 있습니다.

## 5단계: 폴더 구조 만들기

아래 구조를 만듭니다.

```txt
src/
  main/
    ipc/
    services/
  preload/
  renderer/
    src/
      test/
  shared/
tests/
  renderer/
  unit/
docs/
```

각 폴더의 역할은 다음과 같습니다.

- `src/main`: Electron 앱 창, 파일 시스템, IPC 처리
- `src/preload`: renderer에 안전한 API만 노출
- `src/renderer`: React 화면
- `src/shared`: 공통 타입, JSON 모델, IPC 채널명
- `tests`: 자동 테스트

## 6단계: shared 모델 먼저 만들기

먼저 화면보다 데이터 구조를 만듭니다.

만들 파일:

```txt
src/shared/project.ts
src/shared/ipc.ts
```

`src/shared/project.ts`에는 아래 항목을 순서대로 작성합니다.

1. `LearningNote` 타입
2. `LearningProject` 타입
3. `createNote()`
4. `createEmptyProject()`
5. `updateNote()`
6. `removeNote()`
7. `calculateProgress()`
8. `parseProjectJson()`
9. `serializeProject()`

처음에는 타입부터 작성합니다.

```ts
export const PROJECT_SCHEMA_VERSION = 1

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

export interface LearningProject {
  schemaVersion: typeof PROJECT_SCHEMA_VERSION
  title: string
  notes: LearningNote[]
  settings: {
    theme: 'system' | 'light' | 'dark'
    lastOpenedNoteId: string | null
  }
  updatedAt: string
}
```

그다음 생성, 수정, 삭제 함수를 추가합니다. 이 파일은 Electron을 몰라도 테스트할 수 있는 순수 로직이어야 합니다.

확인 방법:

```bash
npm run typecheck
```

## 7단계: Electron main process 만들기

만들 파일:

```txt
src/main/index.ts
src/main/ipc/fileHandlers.ts
src/main/services/projectFileService.ts
```

main process가 담당할 일:

- 앱 창 만들기
- 보안 옵션 설정
- 파일 열기 대화상자 표시
- 파일 저장 대화상자 표시
- JSON 읽기와 쓰기

`BrowserWindow`를 만들 때는 아래 보안 옵션을 사용합니다.

```ts
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webSecurity: true
}
```

왜 이렇게 하나요:

- renderer는 브라우저 화면처럼 동작해야 합니다.
- 파일 시스템 접근은 main process에서만 처리합니다.
- preload가 두 영역 사이의 안전한 다리 역할을 합니다.

## 8단계: preload API 만들기

만들 파일:

```txt
src/preload/index.ts
```

preload에서는 `ipcRenderer` 전체를 노출하지 않습니다. 필요한 기능만 좁은 API로 노출합니다.

```ts
contextBridge.exposeInMainWorld('learnApp', {
  files: {
    openProject: () => ipcRenderer.invoke('project:open'),
    saveProject: (project) => ipcRenderer.invoke('project:save', project),
    saveProjectAs: (project) => ipcRenderer.invoke('project:save-as', project)
  }
})
```

실제 프로젝트에서는 문자열 채널명을 직접 쓰지 않고 `src/shared/ipc.ts`의 상수를 사용합니다.

## 9단계: React renderer 만들기

만들 파일:

```txt
src/renderer/index.html
src/renderer/src/main.tsx
src/renderer/src/App.tsx
src/renderer/src/styles.css
src/renderer/src/global.d.ts
```

처음에는 화면을 작게 시작합니다.

1. 앱 제목을 보여줍니다.
2. 새 노트 버튼을 추가합니다.
3. 노트 목록을 보여줍니다.
4. 선택한 노트의 제목과 내용을 수정합니다.
5. 저장, 불러오기 버튼을 연결합니다.
6. 오른쪽 상태 패널을 추가합니다.

React 상태는 처음에는 `useState`와 `useMemo`만 사용합니다. 초보 단계에서는 Zustand나 Redux를 바로 넣지 않습니다. 먼저 데이터 흐름을 눈으로 이해하는 것이 중요합니다.

확인합니다.

```bash
npm run dev
```

앱 창이 뜨고 기본 노트가 보이면 성공입니다.

## 10단계: 테스트 작성하기

만들 파일:

```txt
src/renderer/src/test/setup.ts
tests/unit/project.test.ts
tests/renderer/App.test.tsx
```

처음 테스트는 UI보다 데이터 로직부터 작성합니다.

```ts
import { describe, expect, it } from 'vitest'
import { createEmptyProject, parseProjectJson, serializeProject } from '@shared/project'

describe('project model', () => {
  it('serializes and parses a project', () => {
    const project = createEmptyProject('테스트 프로젝트')
    const parsed = parseProjectJson(serializeProject(project))

    expect(parsed.title).toBe('테스트 프로젝트')
  })
})
```

확인합니다.

```bash
npm run test
```

## 11단계: 빌드와 배포 설정하기

`package.json`에 electron-builder 설정을 추가합니다.

```json
{
  "build": {
    "appId": "com.learnapp.desktop",
    "productName": "LearnApp Studio",
    "directories": {
      "output": "release"
    },
    "files": ["out/**/*", "package.json"],
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "nsis": {
      "artifactName": "${productName}-${version}-${arch}-setup.${ext}",
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "portable": {
      "artifactName": "${productName}-${version}-${arch}-portable.${ext}"
    }
  }
}
```

확인합니다.

```bash
npm run build
npm run dist:win
```

## 12단계: 최종 점검

아래 명령이 모두 통과하면 첫 번째 버전이 완성된 것입니다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

그다음 앱에서 직접 확인합니다.

- 새 노트를 만든다.
- 제목과 내용을 수정한다.
- 태그를 입력한다.
- JSON 파일로 저장한다.
- 앱을 다시 실행한다.
- 저장한 JSON 파일을 불러온다.

여기까지 끝나면 Electron 앱의 핵심 흐름을 한 번 완주한 것입니다.
