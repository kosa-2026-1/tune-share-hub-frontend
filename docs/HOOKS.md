# Hooks

## Git Hooks

설치:

```bash
scripts/install-git-hooks.sh
```

### commit-msg

커밋 메시지가 팀 규칙을 따르는지 검사한다.

허용 예:

```text
feat: #14 회원가입 기능 구현
fix: #21 로그인 에러 메시지 표시
```

거부 예:

```text
feat: 회원가입 기능 구현
fix login error
```

### pre-push

push 전에 다음을 검사한다.

- 브랜치 이름이 `<type>/<issue>-<slug>` 형식인지 확인
- `.env`가 git에 추적되고 있지 않은지 확인
- `npm run lint`
- `npm run test --if-present`
- `npm run build`
- `BACKEND_API_HEALTH_URL` 또는 `VITE_API_BASE_URL`로 백엔드 API 연결 확인
- Docker가 설치되고 daemon이 실행 중이면 `docker compose up -d --build app`
- 컨테이너 안에서 `http://127.0.0.1:4173` preview 서버가 정상 응답하는지 확인
- 검사 후 `docker compose down`으로 smoke test 컨테이너를 정리

Git hook 원본은 `scripts/git-hooks/`에 보관한다. 설치 스크립트가 이 파일들을 `.git/hooks/`로 복사한다.

## Codex TDD Guard

Codex가 읽는 repo-local hook 설정:

```text
.codex/config.toml
.codex/hooks.json
.codex/hooks/tdd-guard.sh
```

실제 검사 로직 원본:

```text
.codex/hooks/tdd-guard.sh
```

목적:

- Codex `PreToolUse[Edit|Write|apply_patch]` 단계에서 구현 파일 수정 전에 대응 테스트 파일 존재 여부를 확인한다.
- 테스트 파일, 문서, 설정, CSS, 타입 파일은 검사 대상에서 제외한다.

대응 테스트 파일 예:

```text
src/components/PlaylistCard.jsx
src/components/PlaylistCard.test.jsx
```

또는:

```text
src/components/PlaylistCard.jsx
src/components/__tests__/PlaylistCard.test.jsx
```

`.codex/hooks.json`이 `PreToolUse`의 `apply_patch`, `Edit`, `Write` matcher에 이 훅을 연결한다. Codex hook 기능은 `.codex/config.toml`의 `codex_hooks = true`로 켠다.

## Codex Quality Gate

Codex가 답변을 끝내기 전 `Stop` hook으로 다음 검증을 실행한다.

```text
.codex/hooks/quality-gate.sh
```

실제 검증 로직은 Git pre-push와 공유한다.

```text
scripts/quality-gate.sh
```

검증 항목:

- `npm run lint`
- `npm run test --if-present`
- `npm run build`
- 백엔드 API 연결 확인
- Docker preview smoke test

검증 실패 시 Codex는 최종 응답을 멈추고 실패 내용을 바탕으로 계속 수정하도록 요청받는다.
