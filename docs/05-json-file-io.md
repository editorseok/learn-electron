# 05. JSON 파일 저장과 불러오기 따라 만들기

이 단계에서는 사용자의 학습 노트를 JSON 파일로 저장하고 다시 불러옵니다.

중요한 원칙은 renderer에서 직접 `fs`를 쓰지 않는 것입니다. React 화면은 preload API를 호출하고, 실제 파일 작업은 main process가 처리합니다.

## 전체 흐름

```txt
React 버튼 클릭
-> window.learnApp.files.saveProject(project)
-> preload
-> ipcRenderer.invoke(...)
-> main process
-> dialog + fs
-> JSON 파일 저장
```

## 1단계: 결과 타입 만들기

만들 파일:

```txt
src/shared/ipc.ts
```

저장과 불러오기는 성공할 수도 있고 실패할 수도 있습니다. 그래서 결과 타입을 먼저 만듭니다.

```ts
export interface FileFailure {
  ok: false
  reason: 'cancelled' | 'invalid' | 'error'
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
```

왜 이렇게 하나요:

- 사용자가 취소한 상황과 실제 오류를 구분할 수 있습니다.
- renderer에서 `if (!result.ok)`처럼 명확하게 처리할 수 있습니다.

## 2단계: JSON 변환 함수 만들기

만들 파일:

```txt
src/shared/project.ts
```

핵심 함수:

```ts
export const serializeProject = (project: LearningProject): string => {
  return `${JSON.stringify(project, null, 2)}\n`
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
```

`normalizeProject()`는 JSON 구조가 우리가 기대한 형태인지 확인하는 함수입니다.

## 3단계: 파일 서비스 만들기

만들 파일:

```txt
src/main/services/projectFileService.ts
```

이 파일에서만 `fs/promises`를 사용합니다.

```ts
import { dialog } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
```

직접 만들 함수:

- `openProjectFile()`
- `saveProjectFile()`
- `clearCurrentProjectPath()`

구현 순서:

1. `dialog.showOpenDialog()`로 JSON 파일을 고릅니다.
2. `readFile()`로 파일 내용을 읽습니다.
3. `parseProjectJson()`으로 구조를 확인합니다.
4. 성공하면 `{ ok: true, project, filePath }`를 반환합니다.
5. 실패하면 `{ ok: false, reason, message }`를 반환합니다.

## 4단계: IPC handler 연결하기

만들 파일:

```txt
src/main/ipc/fileHandlers.ts
```

```ts
ipcMain.handle(IPC_CHANNELS.projectOpen, (event) => {
  assertTrustedSender(event)
  return openProjectFile(getWindow())
})

ipcMain.handle(IPC_CHANNELS.projectSave, (event, project) => {
  assertTrustedSender(event)
  return saveProjectFile(getWindow(), project, 'save')
})
```

`assertTrustedSender()`는 IPC 요청이 우리가 띄운 renderer에서 온 것인지 확인합니다.

## 5단계: preload API 연결하기

만들 파일:

```txt
src/preload/index.ts
```

```ts
contextBridge.exposeInMainWorld('learnApp', {
  files: {
    openProject: () => ipcRenderer.invoke(IPC_CHANNELS.projectOpen),
    saveProject: (project) => ipcRenderer.invoke(IPC_CHANNELS.projectSave, project),
    saveProjectAs: (project) => ipcRenderer.invoke(IPC_CHANNELS.projectSaveAs, project)
  }
})
```

renderer는 이제 `window.learnApp.files.openProject()`만 호출하면 됩니다.

## 6단계: React 버튼에 연결하기

만들 파일:

```txt
src/renderer/src/App.tsx
```

```ts
const openProject = async (): Promise<void> => {
  const result = await window.learnApp.files.openProject()

  if (!result.ok) {
    setStatus(result.message)
    return
  }

  setProject(result.project)
  setFilePath(result.filePath)
}
```

저장도 같은 방식으로 만듭니다.

## 7단계: 수동 확인

```bash
npm run dev
```

앱에서 아래 순서로 확인합니다.

1. 새 노트를 만든다.
2. 제목과 내용을 수정한다.
3. 저장 버튼을 눌러 JSON 파일을 만든다.
4. 앱을 다시 실행한다.
5. 불러오기 버튼으로 JSON 파일을 연다.
6. 내용이 그대로 보이는지 확인한다.
