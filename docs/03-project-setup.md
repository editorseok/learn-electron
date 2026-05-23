# 03. 프로젝트 만들기와 최소 설정

이 단계에서는 빈 폴더에서 Electron + Vite + React + TypeScript 프로젝트를 직접 만듭니다.

이번 단계의 목표는 앱 기능을 완성하는 것이 아닙니다. 먼저 개발 도구가 서로 연결되는 최소 구조를 만드는 것이 목표입니다.

## 이번 단계에서 만들 것

```txt
package.json
electron.vite.config.ts
tsconfig.json
vitest.config.ts
eslint.config.mjs
src/
tests/
```

완료 기준:

- `npm run typecheck`가 실행된다.
- `npm run lint`가 실행된다.
- `npm run test`가 실행될 준비가 된다.
- `npm run dev`로 Electron 개발 앱을 실행할 준비가 된다.

## 1단계: npm 프로젝트 만들기

빈 폴더에서 시작합니다.

```bash
npm init -y
```

그러면 `package.json`이 생성됩니다. 먼저 기본 정보를 정리합니다.

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

여기서 중요한 값은 `main`입니다.

```json
"main": "./out/main/index.js"
```

이 값은 Electron이 실제로 실행할 빌드 결과 파일입니다.

```txt
우리가 작성하는 파일: src/main/index.ts
빌드 후 생성되는 파일: out/main/index.js
Electron이 실행하는 파일: out/main/index.js
```

## 2단계: 실행에 필요한 패키지 설치

```bash
npm install react react-dom lucide-react
```

각 패키지의 역할은 다음과 같습니다.

| 패키지 | 역할 |
| --- | --- |
| `react` | 화면을 컴포넌트로 만들기 위한 핵심 라이브러리 |
| `react-dom` | React 화면을 HTML DOM에 붙이는 라이브러리 |
| `lucide-react` | 버튼과 도구에 사용할 아이콘 컴포넌트 |

이 패키지들은 앱 실행 중에도 필요하므로 일반 dependencies에 설치합니다.

## 3단계: 개발 도구 설치

아래 패키지들은 개발할 때 필요한 도구입니다. 그래서 `-D` 옵션으로 devDependencies에 설치합니다.

```bash
npm install -D electron@41.3.0 --save-exact
npm install -D electron-builder electron-vite@5 vite@7 @vitejs/plugin-react@5
npm install -D typescript vitest jsdom @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint @eslint/js typescript-eslint globals
```

`-D`는 개발할 때만 필요한 패키지라는 뜻입니다.

| 묶음 | 패키지 | 역할 |
| --- | --- | --- |
| Electron | `electron` | 데스크톱 앱 런타임 |
| Electron | `electron-vite` | Electron과 Vite를 함께 실행하고 빌드 |
| Electron | `electron-builder` | Windows 설치 파일 생성 |
| React/Vite | `vite`, `@vitejs/plugin-react` | React 화면 개발 서버와 빌드 |
| TypeScript | `typescript`, `@types/*` | 타입 검사와 자동완성 |
| Test | `vitest`, `jsdom`, `@testing-library/*` | 자동 테스트 |
| Lint | `eslint`, `typescript-eslint`, `globals` | 코드 규칙 검사 |

Electron은 정확히 `41.3.0`으로 고정합니다.

```bash
npm ls electron
```

아래처럼 보이면 됩니다.

```txt
electron@41.3.0
```

## 4단계: scripts 작성하기

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

각 명령의 의미:

| 명령 | 의미 |
| --- | --- |
| `npm run dev` | 개발용 Electron 앱 실행 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run test` | Vitest 테스트 실행 |
| `npm run build` | 배포 전 빌드 |
| `npm run dist:win` | Windows 설치 파일과 portable 파일 생성 |

Windows 환경에 `ELECTRON_RUN_AS_NODE=1`이 설정되어 있으면 Electron이 앱이 아니라 Node처럼 실행될 수 있습니다. 그래서 `dev`와 `preview` 앞에서 이 값을 비웁니다.

## 5단계: Electron/Vite 설정 만들기

프로젝트 루트에 `electron.vite.config.ts`를 만듭니다.

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build: {
      externalizeDeps: true
    }
  },
  preload: {
    build: {
      externalizeDeps: true
    }
  },
  renderer: {
    plugins: [react()]
  }
})
```

이 설정은 의도적으로 최소화했습니다.

`externalizeDeps: true`는 Electron의 `main`과 `preload`에서 사용하는 Node/Electron 의존성을 무리하게 하나의 파일로 묶지 않도록 합니다. 예전에는 `externalizeDepsPlugin()`을 사용했지만, 최신 `electron-vite`에서는 이 설정 방식이 권장됩니다.

`electron-vite`는 기본적으로 아래 위치를 찾습니다.

```txt
main      src/main/index.ts
preload   src/preload/index.ts
renderer  src/renderer/index.html
```

그래서 처음에는 경로를 직접 설정하지 않고, 약속된 위치에 파일을 두는 방식으로 시작합니다.

## 6단계: TypeScript 설정 만들기

프로젝트 루트에 `tsconfig.json`을 만듭니다.

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
    "types": ["node", "vite/client", "electron-vite/node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx", "*.config.*"]
}
```

처음에 기억할 핵심은 세 가지입니다.

| 설정 | 의미 |
| --- | --- |
| `strict: true` | 타입 검사를 엄격하게 합니다. |
| `jsx: "react-jsx"` | React JSX 문법을 사용합니다. |
| `noEmit: true` | 타입 검사만 하고 파일 생성은 Vite/Electron Vite가 담당합니다. |
| `include` | TypeScript가 검사할 파일 범위를 정합니다. |

`include`는 TypeScript가 검사할 파일을 명확히 정합니다.

```txt
src/**/*.ts      src 아래의 모든 .ts 파일
src/**/*.tsx     src 아래의 모든 .tsx 파일
tests/**/*.ts    tests 아래의 모든 .ts 파일
tests/**/*.tsx   tests 아래의 모든 .tsx 파일
*.config.*       루트의 설정 파일
```

`**/*`는 하위 폴더까지 모두 찾겠다는 뜻입니다.

`*.config.*`는 프로젝트 루트에 있는 설정 파일을 범용적으로 포함하기 위한 패턴입니다.

```txt
electron.vite.config.ts
vitest.config.ts
eslint.config.mjs
playwright.config.ts
```

나중에 설정 파일이 추가되어도 이름이 `*.config.*` 형식이면 `tsconfig.json`을 다시 고치지 않아도 됩니다.

## 7단계: 테스트 설정 만들기

프로젝트 루트에 `vitest.config.ts`를 만듭니다.

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/renderer/src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
})
```

React 컴포넌트를 테스트하려면 브라우저처럼 동작하는 DOM 환경이 필요합니다. 그래서 `environment: 'jsdom'`을 사용합니다.

## 8단계: ESLint 설정 만들기

프로젝트 루트에 `eslint.config.mjs`를 만듭니다.

```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['node_modules', 'out', 'dist', 'release', 'coverage']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
)
```

처음에는 복잡한 React 전용 규칙까지 넣지 않습니다. TypeScript와 기본 JavaScript 규칙만으로 시작합니다.

## 9단계: 폴더 구조 만들기

아래 폴더를 만듭니다.

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
```

각 폴더의 역할:

| 폴더 | 역할 |
| --- | --- |
| `src/main` | Electron 창, 앱 생명주기, 파일 시스템, IPC |
| `src/preload` | renderer에 안전한 API 노출 |
| `src/renderer` | React 화면 |
| `src/shared` | 공통 타입과 데이터 모델 |
| `tests` | 자동 테스트 |

## 10단계: 빈 파일부터 만들기

다음 단계에서 코드를 작성할 수 있도록 먼저 파일만 만들어 둡니다.

```txt
src/main/index.ts
src/preload/index.ts
src/renderer/index.html
src/renderer/src/main.tsx
src/renderer/src/App.tsx
src/renderer/src/styles.css
src/renderer/src/test/setup.ts
src/shared/ipc.ts
src/shared/project.ts
```

여기까지 끝나면 프로젝트 뼈대가 준비됩니다.

다음 문서인 [04. Electron 구조 따라 만들기](04-electron-architecture.md)에서 `main`, `preload`, `renderer` 코드를 차례대로 작성합니다.
