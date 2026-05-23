# 00. 프로젝트 개요

이 문서는 완성된 소스를 내려받아 따라 실행하는 안내서가 아닙니다. 학습자가 빈 폴더에서 시작해 직접 파일을 만들고, 단계마다 동작을 확인하면서 Electron 데스크톱 앱의 전체 흐름을 익히는 것을 목표로 합니다.

## 우리가 만들 앱

LearnApp Studio는 학습 노트를 관리하는 Windows 데스크톱 앱입니다.

- 노트를 만들고 수정하고 삭제합니다.
- 태그로 노트를 검색하고 필터링합니다.
- 완료 여부와 복습 날짜를 관리합니다.
- 앱 데이터를 JSON 파일로 저장하고 다시 불러옵니다.
- 테스트를 작성하고 Windows 설치 파일을 만듭니다.

## 왜 학습 노트 앱인가

학습 노트 앱은 CRUD, 상태 관리, 파일 저장, 화면 구성, 테스트, 배포를 모두 다룹니다. 하지만 서버나 데이터베이스가 없어도 만들 수 있기 때문에 초보자가 Electron 구조를 배우기 좋습니다.

## 학습 방식

각 문서는 다음 순서로 구성합니다.

1. 이번 단계에서 만들 것
2. 왜 필요한지
3. 어떤 파일을 만들거나 수정하는지
4. 직접 작성할 코드의 핵심
5. 실행해서 확인하는 방법

## 전체 진행 지도

```txt
01. 기획
    요구사항, 화면 구성, JSON 데이터 구조를 먼저 정합니다.

02. 개발 환경
    Windows에서 Node.js, npm, VS Code를 준비합니다.

08. 빈 폴더에서 직접 만들기
    npm 초기화, 의존성 설치, 설정 파일, 소스 폴더를 순서대로 만듭니다.

03. Electron 구조
    main, preload, renderer, shared 역할을 나눕니다.

04. JSON 파일 입출력
    renderer에서 직접 fs를 쓰지 않고 IPC로 main process에 요청합니다.

05. 테스트
    도메인 로직과 React 화면을 Vitest로 확인합니다.

06. Windows 배포
    electron-builder로 설치 파일과 portable 파일을 만듭니다.
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
