# 02. Windows 개발 환경 준비

이 단계에서는 빈 폴더에서 프로젝트를 만들 준비를 합니다. 아직 앱 코드를 작성하지 않습니다.

## 준비물

- Windows 10 또는 11
- Node.js 22 이상
- npm
- Visual Studio Code
- Git
- PowerShell 또는 Windows Terminal

## Node.js 확인

터미널에서 아래 명령을 실행합니다.

```bash
node --version
npm --version
```

버전이 출력되면 준비가 된 것입니다.

## 새 폴더 만들기

직접 처음부터 따라 만들 때는 별도 폴더를 만들어 진행합니다.

```bash
mkdir LearnApp
cd LearnApp
```

이미 이 저장소 안에서 실습 중이라면 새 폴더를 만들지 않고 현재 폴더에서 진행해도 됩니다.

## Windows 환경변수 주의

Windows 환경에 `ELECTRON_RUN_AS_NODE=1`이 설정되어 있으면 Electron이 데스크톱 앱이 아니라 Node처럼 실행될 수 있습니다.

이 프로젝트의 `npm run dev`와 `npm run preview`는 실행 전에 해당 변수를 비우도록 구성합니다.

```json
{
  "scripts": {
    "dev": "set ELECTRON_RUN_AS_NODE=&& electron-vite dev",
    "preview": "set ELECTRON_RUN_AS_NODE=&& electron-vite preview"
  }
}
```

## 새 프로젝트 만들기

```bash
npm init -y
```

## 패키지 설치

사내망이나 보안 프록시가 있는 환경에서는 Electron 바이너리 다운로드 단계에서 인증서 오류가 날 수 있다. Electron 패키지는 npm 패키지만 설치하는 것이 아니라, 설치 스크립트에서 Github 릴리즈의 Electron 실행 파일을 추가로 내려 받는다.

이 프로젝트에서는 npm lifecycle script가 Windows 시스템 인증서 저장소를 사용하도록 `.npmrc`를 먼저 만든다.

`.npmrc`:
```
# Use the Windows certificate store for npm lifecycle scripts.
node-options=--use-system-ca 
```

이 설정은 Node 기반 설치 스크립트가 회사 PC에 등록된 루트 인증서를 신뢰하도록 도와준다. 사내 SSL 검사 장비나 프록시 인증서 때문에 Electron 다운로드가 실패하는 환경에서 특히 중요하다.

런타임 의존성을 설치한다.

```bash
npm install react react-dom lucide-react
npm install -D electron electron-builder electron-vite typescript vite vitest @vitejs/plugin-react @types/node @types/react @types/react-dom
```

## package.json 설정

`package.json`을 아래 형태로 맞춘다. 버전은 설치 시점에 따라 달라도 괜찮다.

```json
{
	"main": "out/main/index.js",
	"script": {
		"predev": "install-electron --no",
		"postinstall": "install-electron --no",
		"dev": "set ELECTRON_RUN_AS_NODE=&& electron-vite dev",
		"typecheck": "tsc --noEmit",
		"test": "vitest run",
		"test:watch": "vitest",
		"build": "npm run typecheck && npm run test && electron-vite build",
		"dist": "npm run build && set CSC_IDENTITY_AUTO_DISCOVERY=false&& electron-builder --win",
		"dist:unpacked": "npm run build && set CSC_IDENTITY_AUTO_DISCOVERY=false&& electron-builder --win --dir --config.directories.output=release-unpacked",
		"preview": "set ELECTRON_RUN_AS_NODE=&& electron-vite preview"
	},
	"build": {
		"appId": "com.app",
		"productName": "ProductName",
		"directories": {
			"output": "release"
		},
		"files": [
			"out/**/*",
			"!out/user-data/**",
			"package.json"
		],
		"win": {
			"target": [
				"nsis"
			],
			"artifactName": "${productName}-${version}-Setup.${ext}",
			"signAndEditExecutable": false
		},
		"nsis": {
			"oneClick": false,
			"perMachine": false,
			"allowToChangeInstallationDirectory": true,
			"createDesktopShortcut": true,
			"createStartMenuShortcut": true
		}
	}
}
```

중요한 부분:

- `main`은 빌드 결과인 `out/main/index.js`를 가리킨다.
- `predev`는 `npm run dev` 직전에 Electron 실행 파일을 다시 확인한다.
- `postinstall`은 `npn install` 직후 Electron 실행 파일을 확인하고 설치한다.
- dist:unpacked`는 설치 프로그램 없이 실행 가능한 `win-unpacked` 폴더를 만든다.
- `build:files`에서 `!out/user-data/**`를 제외한다. 이 폴더는 앱 실행 중 생기는 Chromium 사용자 데이터이다.

## 설정 파일 만들기

이 단계에서 만드는 설정 파일은 앱 코드를 직접 실행하지는 않지만, 개발 도구가 프로젝트를 어떻게 해석하고 빌드할지 결정한다.

```text
tsconfig.json
	TypeScript가 src 폴더의 코드를 어떤 문법 기준으로 검사할지 정한다.

electron.vite.config.ts
	Electron의 Main, Preload, Renderer를 각각 어디서 시작하고 어디로 빌드할지 정한다.

vitest.config.ts
	테스트 파일을 어디서 찾고 어떤 테스트 환경으로 실행할지 정한다.
```

`tsconfig.json`을 만든다.

이 파일은 TypeScript 검사 규칙이다. Main, Preload, Renderer가 모두 TypeScript를 쓰기 때문에 `src/**/*.ts`, `src/**/*.tsx`를 검사 대상으로 넣는다.

핵심 옵션:

- `strict`: 타입을 느슨하게 추론하지 않고 더 엄격하게 검사한다.
- `moduleResolution: "Bundler"`:Vite/electron-vite 방식의 import 해석과 맞춘다.
- `jsx: "react-jsx"`: React 17 이후 방식의 JSX 변환을 사용한다.
- `types`: Node와 Vitest 전역 타입을 함께 사용한다.
- `noEmit`: 타입 검사만 하고 실제 JS 출력은 만들지 않는다. 실제 빌드는 electron-vite가 담당한다.

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"useDefineForClassFields": true,
		"lib": ["ES2022", "DOM", "DOM.Iterable"],
		"allowJs": false,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"forceConsistentCasingInFileNames": true,
		"module": "ESNext",
		"moduleResolution": "Bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"jsx": "react-jsx",
		"types": ["node", "vitest/globals"]
	},
	"include": [
		"electron.vite.config.ts",
		"src/**/*.ts",
		"src/**/*.tsx"
	]
}
```

`electron.vite.config.ts`를 만든다.

이 파일은 Electron 앱의 빌드 지도이다. 일반 React 앱과 다르게 Electron 앱에는 실행 영역이 3개 있다.

- `main`: 창 생성, 앱 생명주기, 파일 시스템, IPC 핸들러를 담당한다.
- `preload`: Renderer와 Main 사이에서 안전한 API를 노출한다.
- `renderer`: 사용자가 보는 React 화면이다.

그래서 `electron.vite.config.ts`에서는 세 영역의 시작 파일을 따로 지정한다.

중요한 부분:

- `main.rollupOptions.input`: Main 프로세스 시작 파일이다.
- `preload.rollupOptions.input`: Preload 시작 파일이다.
- `renderer.root`: React 앱의 기준 폴더이다.
- `renderer.build.rollupOptions.input`: React HTML 시작 파일이다.
- `externalizeDepsPlugin()`: Electron Main/Preload에서 Node 패키지를 번들에 무리하게 섞지 않도록 도와준다.

 ```ts
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, "src/main/index.ts")
				}
			}
		}
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, "src/preload/index.tx")
				}
			}
		}
	},
	renderer: {
		root: resolve(__dirname, "src/renderer"),
		plugins: [react()],
		build: {
			rollupOptions: {
				input: resolve(__dirname, "src/renderer/index.html")
			}
		},
		server: {
			host: "127.0.0.1",
			port: 5173,
		}
	}
});
```

`vitest.config.ts`를 만든다.

이 파일은 테스트 실행 규칙이다. 지금은 `src/**/*.test.ts`만 테스트 대상으로 잡는다. Renderer 컴포넌트 테스트까지 추가하면 나중에 `*.test.tsx` 나 DOM 테스트 환경을 추가할 수 있다.

현재 단계에서는 shared 로직처럼 브라우저 없이 검증 가능한 순수 TypeScript 코드를 테스트하는데 초점을 둔다.

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"]
	}
});
```

## 폴더 구조

```text
src
	main
		app
		ipc
		stores
	preload
	renderer
		src
			app
	shared
```

## IPC 채널 만들기

`src/shared/ipcChannels.ts`를 만든다. 문자열 채널 이름을 한 곳에 모아 두면 Main과 Preload 사이의 오타를 줄일 수 있다.

```ts
export const IPC_CHANNELS = {
	workspace: {
		selectFolder: "workspace:selectFolder",
		listJsonFiles: "workspace:listJsonFiles"
	},
	file: {
		readJson: "file:readJson",
		saveJson: "file:saveJson"
	},
	// ...
} as const;
```

## Main 프로세스 만들기

`src/main/app/createWindow.ts`를 만든다.

```ts
import { BrowserWindow } from "electron";

export interface CreateWindowOptions {
	preloadPath: string;
	rendererHtmlPath: string;
	rendererUrl?: string;
}

export function createWindow(options: CreateWindowOptions): BrowserWindow {
	const window = new BrowserWindow({
		width: 1440,
		height: 940,
		minWidth: 1180,
		minHeight: 760,
		title: "title",
		backgroundColor: "#f6f7f9",
		webPreferences: {
			preload: options.preloadPath,
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		}
	});

	if (options.rendererUrl) {
		void window.loadURL(options.rendererUrl);
	} else {
		void window.loadFile(options.rendererHtmlPath);
	}

	return window;
}
```

`src/main/index.ts`를 만든다.

```ts
import { app } from "electron";
import { join } from "node:path";
import type { BrowserWindow } from "electron";
import { createWindow } from "./app/createWindow";
import { registerIpcHandlers } from "./ipc/registerIpcHandlers";

let mainWindow: BrowserWindow | null = null;

function openMainWindow(): void {
	mainWindow = createWindow({
		preloadPath: join(__dirname, "../preload/index.js"),
		rendererHtmlPath: join(__dirname, "../renderer/index.html"),
		rendererUrl: process.env.ELECTRON_RENDERER_URL
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	registerIpcHandlers();
	openMainWindow();
});
app.on("active", () => {
	if (mainWindow === null) {
		openMainWindow();
	}
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
```

여기서 `join(__dirname, "../renderer/index.html")`가 중요하다. 빌드 후 main 파일은 `out/main/index.js`가 되고, production HTML은 `out/renderer/index.html`에 생기므로 `../renderer/index.html`이 맞다.

## IPC 핸들러 만들기

`src/main/ipc/registerIpcHandlers.ts`를 만든다.

```ts
import { registerFileHandlers } from "./fileHandlers";
import { registerSchemaHandlers } from "./schemaHandlers"

export function registerIpcHandlers(): void {
	registerFileHandlers();
	registerSchemaHandlers();
	// ...
}
```

`src/main/ipc/fileHandlers.ts`를 만든다.

```ts
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../shared/ipcChannels";
import { readJsonFile, saveJsonFile } from "../stores/jsonFileStore";

export function registerFileHandlers(): void {
	ipcMain.handler(IPC_CHANNELS.file.readJson, async (_, folderPath: string, filePath: string) => {
		return readJsonFile(folderPath, filePath);
	});
	// ...
}
```

## Preload API 만들기

`src/preload/api.ts`를 만든다.

```ts
import { ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/ipcChannels";

export const api = {
	readJsonFile: (folderPath: string, filePath: string): Promise<ReadJsonResult> => ipcRenderer.invoke(IPC_CHANNELS.file.readJson, folderPath, filePath),
	saveJsonFile: (filePath: string, text: string): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.file.saveJson, filePath, text),
	// ...
};

export type MyApp = typeof api;
```

`src/preload/index.ts`를 만든다.

```ts
import { contextBridge } from "electron";
import { api } from "./api";

contextBridge.exposeInMainWorld("myApp", api);

export type { MyApp } from "./api";
```

Renderer에서 `window.myApp` 타입을 알 수 있도록 `src/renderer/src/vite-env.d.ts`를 만든다.

```ts
/// <reference types="vite/client" />

import type { myApp } from "../../preload";

declare global {
	interface Window {
		myApp: MyApp;
	}
} 
```

## 다음 단계

환경 준비가 끝났다면 [03. 프로젝트 만들기와 최소 설정](03-project-setup.md)으로 이동합니다. 그 문서에서 `npm init`, 의존성 설치, scripts 작성, 설정 파일 작성, 폴더 구조 만들기까지 순서대로 진행합니다.
