# 00. 프로젝트 개요

이 문서는 완성된 소스를 내려받아 실행하는 안내서가 아닙니다. 학습자가 빈 폴더에서 시작해 직접 파일을 만들고, 단계마다 동작을 확인하면서 Electron 데스크톱 앱의 전체 흐름을 익히는 것을 목표로 합니다.

## 우리가 만들 앱

LearnApp Studio는 학습 노트를 관리하는 Windows 데스크톱 앱입니다.

- 노트를 만들고 수정하고 삭제합니다.
- 태그로 노트를 검색하고 필터링합니다.
- 완료 여부와 복습 날짜를 관리합니다.
- 앱 데이터를 JSON 파일로 저장하고 다시 불러옵니다.
- 테스트를 작성하고 Windows 설치 파일을 만듭니다.

## 학습 방식

각 문서는 다음 순서로 설명합니다.

1. 이번 단계에서 만들 것
2. 왜 필요한지
3. 어떤 파일을 만들거나 수정하는지
4. 직접 작성할 코드의 핵심
5. 실행해서 확인하는 방법

## 전체 진행 순서

```txt
00. 프로젝트 개요
    무엇을 만들고 어떤 순서로 진행하는지 확인합니다.

01. 기획 따라하기
    요구사항, 화면 구성, JSON 데이터 구조를 먼저 정합니다.

02. Windows 개발 환경 준비
    Node.js, npm, VS Code, Git을 준비합니다.

03. 프로젝트 만들기와 최소 설정
    npm 초기화, 의존성 설치, scripts, 설정 파일, 폴더 구조를 만듭니다.

04. Electron 구조 따라 만들기
    main, preload, renderer, shared 역할을 나눕니다.

05. JSON 파일 저장과 불러오기
    renderer에서 직접 fs를 쓰지 않고 IPC로 main process에 요청합니다.

06. 테스트 따라 만들기
    도메인 로직과 React 화면을 Vitest로 확인합니다.

07. Windows 빌드와 배포
    electron-builder로 설치 파일과 portable 파일을 만듭니다.

08. 확장 로드맵
    첫 버전 이후 어떤 기능을 추가할 수 있는지 정리합니다.
```

## 최종 폴더 구조

```txt
LearnApp/
  docs/
  src/
    main/
    preload/
    renderer/
      src/
    shared/
  tests/
  package.json
  electron.vite.config.ts
  tsconfig.json
  vitest.config.ts
```

처음부터 이 구조를 모두 외울 필요는 없습니다. 문서 순서대로 만들다 보면 각 폴더가 왜 필요한지 자연스럽게 연결됩니다.
