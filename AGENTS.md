# 프로젝트: tune-share-hub-frontend

이 저장소는 Codex용 Harness 프레임워크를 사용한다. 작업 전 이 파일과 `docs/` 문서를 먼저 읽고, 현재 코드 구조를 확인한 뒤 필요한 범위만 수정한다.

## 먼저 읽을 문서

- `docs/GIT_FLOW.md` - 팀 Git-Flow, 브랜치, 커밋, PR 규칙
- `docs/PHASE_WORKFLOW.md` - phase/step 단위 작업 방식
- `docs/HOOKS.md` - Codex hook과 Git hook 구성
- `docs/ARCHITECTURE.md` - 프론트엔드 디렉토리 구조와 데이터 흐름
- `docs/ADR.md` - 기술 결정
- `docs/UI_GUIDE.md` - Bootstrap 기반 UI 규칙

## 기술 스택

- Vite 6
- React 18
- JavaScript JSX
- React Router DOM
- Axios
- Bootstrap
- ESLint 9 + Prettier

## 아키텍처 규칙

- CRITICAL: 앱 진입점은 `src/main.jsx`, 최상위 앱 컴포넌트는 `src/App.jsx`에 둔다.
- CRITICAL: 외부 HTTP 호출은 `src/api/` 하위 모듈로 분리한다. 컴포넌트에서 axios 인스턴스나 엔드포인트 문자열을 직접 흩뿌리지 않는다.
- CRITICAL: 작업 브랜치는 최신 `develop`에서 만들고 PR 대상은 `develop`으로 둔다.
- CRITICAL: 커밋 메시지는 `<type>: #<issue-number> <message>` 형식으로 작성한다.
- 페이지 단위 화면은 `src/pages/`, 재사용 UI는 `src/components/`, 공통 훅은 `src/hooks/`, 클라이언트 상태 저장소는 `src/stores/`에 둔다.
- 기존 사용자 변경을 되돌리지 말고, 요청된 작업과 직접 관련된 파일만 수정한다.

## UI 규칙

- Bootstrap 컴포넌트와 유틸리티를 우선 사용한다.
- 커스텀 CSS는 Bootstrap으로 해결되지 않는 제품 고유 표현에만 제한한다.
- loading, empty, error, active 상태를 빠뜨리지 않는다.
- 마케팅 랜딩 페이지보다 실제 앱 화면을 먼저 만든다.

## Git-Flow

- 개발 순서: 이슈 생성 -> develop 최신화 -> 작업 브랜치 생성 -> 작업 단위 커밋 -> PR(develop) -> 코드리뷰 -> 머지
- 작업 브랜치 형식: `<type>/<issue-number>-<kebab-case-summary>`
- 예: `feat/14-playlist-list`
- 허용 type: `feat`, `fix`, `build`, `chore`, `docs`, `style`, `refactor`, `test`, `release`
- 커밋 형식: `<type>: #<issue-number> <message>`
- 예: `feat: #14 플레이리스트 목록 화면 구현`

## Phase 작업

- phase는 이슈 하나에 대응한다.
- phase 디렉토리명은 `<issue-number>-<kebab-case-summary>` 형식을 사용한다.
- step은 최대한 작게 나눈다. 한 step은 한 레이어, 한 화면, 한 API 모듈, 한 테스트 묶음만 다룬다.
- step 파일은 독립된 Codex 실행에서 수행될 수 있도록 필요한 맥락, 파일 경로, AC, 금지사항을 모두 포함한다.
- 메인 세션은 계획, 리뷰, 통합 판단만 맡기고 실제 step 작업은 `scripts/execute.py`가 띄우는 별도 `codex exec` 세션에서 수행한다.

## Hooks

Codex hook:

- `.codex/config.toml`에서 `codex_hooks = true`를 켠다.
- `.codex/hooks.json`이 Codex lifecycle hook을 등록한다.
- `.codex/hooks/tdd-guard.sh`는 `PreToolUse[apply_patch|Edit|Write]`에서 구현 파일 수정 전에 대응 테스트 파일 존재 여부를 검사한다.
- `.codex/hooks/quality-gate.sh`는 `Stop`에서 quality gate를 실행한다.

Git hook:

- `scripts/git-hooks/commit-msg`는 커밋 메시지 형식을 검사한다.
- `scripts/git-hooks/pre-push`는 브랜치명, `.env` 추적 여부, quality gate를 검사한다.
- `scripts/install-git-hooks.sh`로 Git hook 원본을 `.git/hooks/`에 설치한다.

## Quality Gate

공용 검증 스크립트는 `scripts/quality-gate.sh`다. Codex `Stop` hook과 Git `pre-push` hook이 모두 이 스크립트를 호출한다.

검증 항목:

```bash
npm run lint
npm run test --if-present
npm run build
```

추가 검증:

- 백엔드 API 연결 확인
- Docker preview smoke test

백엔드 API URL 우선순위:

1. `BACKEND_API_HEALTH_URL`
2. `.env`의 `BACKEND_API_HEALTH_URL`
3. `VITE_API_BASE_URL`
4. `.env`의 `VITE_API_BASE_URL`
5. `.env.example`의 `VITE_API_BASE_URL`

## 개발 프로세스

- 구현 파일을 수정하기 전에 대응 테스트 파일을 먼저 만들거나 확인한다.
- 변경 후 가능한 경우 `npm run lint`, `npm run test --if-present`, `npm run build`를 실행한다.
- PR 전에는 백엔드 API 연결 확인과 Docker smoke test도 통과해야 한다.
- 테스트 스크립트는 아직 없을 수 있으므로 step AC에는 현재 프로젝트에서 실제로 실행 가능한 커맨드만 적는다.
- Git-Flow, phase, hook 규칙은 `docs/GIT_FLOW.md`, `docs/PHASE_WORKFLOW.md`, `docs/HOOKS.md`를 따른다.

## 명령어

```bash
npm run dev                  # 개발 서버
npm run lint                 # ESLint
npm run test --if-present    # 테스트 스크립트가 있으면 실행
npm run build                # 프로덕션 빌드
npm run preview              # 빌드 결과 미리보기
scripts/quality-gate.sh      # lint/test/build/backend/docker 공용 검증
scripts/install-git-hooks.sh # Git hook 설치
```
