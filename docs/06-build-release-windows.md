# 06. Windows 빌드와 배포 따라 만들기

이 단계에서는 개발 중인 앱을 Windows에서 실행 가능한 배포 파일로 만듭니다.

## 1단계: production build 확인

먼저 앱을 패키징하기 전에 번들이 정상 생성되는지 확인합니다.

```bash
npm run build
```

성공하면 `out/` 폴더가 생깁니다.

```txt
out/
  main/
  preload/
  renderer/
```

각 폴더의 의미:

- `out/main`: Electron main process 번들
- `out/preload`: preload 번들
- `out/renderer`: React 화면 번들

## 2단계: electron-builder 설정 추가

`package.json`에 `build` 항목을 추가합니다.

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

왜 이렇게 하나요:

- `nsis`: 일반적인 Windows 설치 파일을 만듭니다.
- `portable`: 설치 없이 실행 가능한 파일을 만듭니다.
- 파일 이름을 분리해 두면 설치 파일과 portable 파일이 서로 덮어쓰지 않습니다.

## 3단계: Windows 배포 파일 만들기

```bash
npm run dist:win
```

성공하면 `release/` 폴더에 파일이 생깁니다.

```txt
release/
  LearnApp Studio-0.1.0-x64-setup.exe
  LearnApp Studio-0.1.0-x64-portable.exe
  win-unpacked/
```

## 4단계: 수동 스모크 테스트

배포 파일을 만든 뒤 아래 항목을 직접 확인합니다.

- portable 파일이 실행되는가
- 설치 파일이 실행되는가
- 앱 창이 열리는가
- 새 노트를 만들 수 있는가
- JSON 저장이 되는가
- 저장한 JSON을 다시 불러올 수 있는가
- 설치 제거가 되는가

## 5단계: 공개 배포 전 준비

학습용 개인 앱은 여기까지 해도 충분합니다. 공개 배포를 하려면 아래 항목을 추가로 준비합니다.

- 앱 아이콘
- 버전 관리 규칙
- Windows 코드 서명 인증서
- SmartScreen 경고 대응
- 릴리스 노트

서명하지 않은 앱은 Windows SmartScreen 경고가 표시될 수 있습니다. 이것은 코드 오류가 아니라 Windows 보안 정책과 배포 신뢰도 문제입니다.
