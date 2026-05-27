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
			"artifactName": "${productName}-${version}-Setup.${ext},
			"signAndEditExecutable: false
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



## 다음 단계

환경 준비가 끝났다면 [03. 프로젝트 만들기와 최소 설정](03-project-setup.md)으로 이동합니다. 그 문서에서 `npm init`, 의존성 설치, scripts 작성, 설정 파일 작성, 폴더 구조 만들기까지 순서대로 진행합니다.
