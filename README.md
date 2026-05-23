# LearnApp Studio

이 저장소는 Vite, Electron, TypeScript, React로 Windows 데스크톱 앱을 직접 만들어 보는 학습용 프로젝트입니다.

목표는 완성된 소스를 내려받아 실행하는 것이 아니라, 문서를 보면서 빈 폴더에서 하나씩 따라 만들 수 있게 하는 것입니다. 완성 파일은 비교용 예시이고, 학습자는 `docs/` 문서 순서대로 직접 파일을 만들며 진행합니다.

## 학습 순서

1. [프로젝트 개요](docs/00-overview.md)
2. [기획 따라하기](docs/01-planning.md)
3. [Windows 개발 환경 준비](docs/02-development-setup-windows.md)
4. [빈 폴더에서 직접 만들기](docs/08-build-from-empty-folder.md)
5. [Electron 구조 이해](docs/03-electron-architecture.md)
6. [JSON 저장과 불러오기](docs/04-json-file-io.md)
7. [테스트](docs/05-testing.md)
8. [Windows 빌드와 배포](docs/06-build-release-windows.md)

## 최종 앱 기능

- 학습 노트 생성, 수정, 삭제
- 태그 검색과 필터
- 완료 여부와 복습 날짜 관리
- JSON 파일 저장과 불러오기
- Electron 보안 구조: `main`, `preload`, `renderer` 분리
- Vitest 기반 테스트
- Windows 설치 파일과 portable 실행 파일 생성

## 완성본 실행

문서 실습을 먼저 따라 하는 것을 권장합니다. 완성본을 확인하고 싶다면 아래 명령을 사용합니다.

```bash
npm install
npm run dev
```

## 검증 명령

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Windows 배포

```bash
npm run dist:win
```

빌드 결과는 `release/` 폴더에 생성됩니다. 공개 배포 전에는 앱 아이콘, 코드 서명, SmartScreen 경고 대응을 별도로 준비해야 합니다.
