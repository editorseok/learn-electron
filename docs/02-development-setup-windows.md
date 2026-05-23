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

## 다음 단계

환경 준비가 끝났다면 [03. 프로젝트 만들기와 최소 설정](03-project-setup.md)으로 이동합니다. 그 문서에서 `npm init`, 의존성 설치, scripts 작성, 설정 파일 작성, 폴더 구조 만들기까지 순서대로 진행합니다.
