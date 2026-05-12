# Phase 작업 방식

## 원칙

- phase는 이슈 하나에 대응한다.
- phase 디렉토리 이름은 `<issue-number>-<kebab-case-summary>` 형식으로 만든다.
- step은 최대한 작게 나눈다. 한 step은 한 레이어, 한 화면, 한 API 모듈, 한 테스트 묶음만 다룬다.
- 각 step은 독립된 Codex 실행에서 수행될 수 있도록 필요한 맥락을 파일 안에 모두 적는다.

## 권장 크기

좋은 step:

- `playlist-api-client`
- `playlist-list-page`
- `playlist-card-component`
- `playlist-empty-error-states`
- `bootstrap-layout-polish`

너무 큰 step:

- `implement-playlist-feature`
- `frontend-all-pages`
- `api-and-ui-and-tests`

## phase index 예시

```json
{
  "project": "tune-share-hub-frontend",
  "phase": "playlist-list",
  "type": "feat",
  "issue": 14,
  "slug": "playlist-list",
  "steps": [
    { "step": 0, "name": "playlist-api-client", "status": "pending" },
    { "step": 1, "name": "playlist-list-page", "status": "pending" },
    { "step": 2, "name": "bootstrap-responsive-polish", "status": "pending" }
  ]
}
```

`scripts/execute.py`는 위 정보를 사용해 다음 브랜치를 만든다:

```text
feat/14-playlist-list
```

그리고 커밋 메시지는 다음 형식으로 생성한다:

```text
feat: #14 step 0 - playlist-api-client
chore: #14 step 0 output
```

## 세션 관리

- 메인 세션은 계획, 리뷰, 통합 결정만 맡긴다.
- 각 step 실행은 `python3 scripts/execute.py <phase-dir>`가 띄우는 별도 `codex exec` 세션에서 수행한다.
- step 파일에는 이전 대화가 아니라 파일 경로, 요구사항, AC, 금지사항을 직접 적는다.
- 완료된 step의 `summary`만 다음 step 컨텍스트로 전달해 메인 세션 컨텍스트를 작게 유지한다.

## Acceptance Criteria

프론트엔드 step의 기본 AC:

```bash
npm run lint
npm run build
```

PR 전 최종 확인:

```bash
npm run lint
npm run test --if-present
npm run build
scripts/git-hooks/pre-push
```

Codex 세션에서는 `.codex/hooks/quality-gate.sh` Stop hook이 같은 검증을 자동 실행한다.
