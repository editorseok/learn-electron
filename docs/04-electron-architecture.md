# 04. Electron 구조 따라 만들기

이 단계에서는 Electron 앱의 세 영역을 직접 나눕니다.

```txt
main      데스크톱 앱 자체를 담당
preload   main과 renderer 사이의 안전한 연결 통로
renderer  React 화면
shared    공통 타입과 IPC 계약
```

## 1단계: 폴더 만들기

```txt
src/
  main/
    ipc/
    services/
  preload/
  renderer/
    src/
  shared/
```

## 2단계: shared부터 만들기

먼저 main, preload, renderer가 함께 사용할 이름을 정합니다.

만들 파일:

```txt
src/shared/ipc.ts
src/shared/project.ts
```

`src/shared/ipc.ts`에는 IPC 채널명을 모읍니다.

```ts
export const IPC_CHANNELS = {
  appInfo: 'app:info',
  projectOpen: 'project:open',
  projectSave: 'project:save',
  projectSaveAs: 'project:save-as',
  projectNewSession: 'project:new-session'
} as const
```

왜 이렇게 하나요:

- 문자열을 여러 파일에 흩뿌리면 오타가 생기기 쉽습니다.
- 채널명을 한 파일에 모으면 나중에 변경하기 쉽습니다.

확인:

```bash
npm run typecheck
```

## 3단계: main process 만들기

만들 파일:

```txt
src/main/index.ts
```

이 파일은 Electron 앱의 시작점입니다. 최소 설정에서는 이 경로를 `electron.vite.config.ts`에 직접 쓰지 않습니다. 대신 `electron-vite`의 기본 폴더 규칙을 따릅니다.

```txt
main      src/main/index.ts
preload   src/preload/index.ts
renderer  src/renderer/index.html
```

처음에는 이 약속된 위치에 파일을 두는 것이 설정을 가장 적게 쓰는 방법입니다.

빌드 후에는 아래 파일로 변환됩니다.

```txt
src/main/index.ts
  -> out/main/index.js
```

그리고 `package.json`의 `main` 값이 빌드 결과를 가리킵니다.

```json
{
  "main": "./out/main/index.js"
}
```

즉, 사람이 작성하는 파일은 `src/main/index.ts`이고, Electron이 실제 실행하는 파일은 `out/main/index.js`입니다.

처음에는 창 하나를 만드는 코드만 작성합니다.

```ts
import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)
```

여기서 중요한 부분은 `webPreferences`입니다.

- `nodeIntegration: false`: React 화면에서 Node.js API를 직접 쓰지 못하게 합니다.
- `contextIsolation: true`: preload와 renderer의 실행 환경을 분리합니다.
- `sandbox: true`: renderer를 더 제한된 환경에서 실행합니다.

## 4단계: preload 만들기

만들 파일:

```txt
src/preload/index.ts
```

처음에는 앱 정보만 가져오는 API를 노출합니다.

```ts
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc'

contextBridge.exposeInMainWorld('learnApp', {
  app: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.appInfo)
  }
})
```

renderer에서 `ipcRenderer`를 직접 쓰지 않고 `window.learnApp`만 사용하게 만드는 것이 핵심입니다.

## 5단계: renderer 타입 선언하기

만들 파일:

```txt
src/renderer/src/global.d.ts
```

```ts
import type { LearnAppApi } from '../../preload'

declare global {
  interface Window {
    learnApp: LearnAppApi
  }
}

export {}
```

이 파일이 있어야 React 코드에서 `window.learnApp`을 TypeScript가 이해합니다.

## 6단계: 실행 확인

```bash
npm run dev
```

확인할 것:

- Vite dev server가 실행된다.
- Electron 창이 열린다.
- 터미널에 `app.whenReady` 관련 오류가 없다.
- `Electron uninstall` 오류가 없다.

오류가 난다면 `docs/02-development-setup-windows.md`의 Windows 환경변수 항목을 다시 확인합니다.
