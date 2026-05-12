# 팀 Git-Flow

## 개발 순서

```text
이슈 생성 -> develop 최신화 -> 브랜치 생성 -> 개발(작업 단위 커밋) -> PR(develop) -> 코드리뷰 -> 머지
```

## 브랜치

- `main`: 제품으로 출시될 수 있는 브랜치
- `develop`: 다음 출시 버전을 개발하는 브랜치
- 작업 브랜치: 항상 최신 `develop`에서 생성한다.

## 브랜치 이름

```text
<type>/<issue-number>-<kebab-case-summary>
```

예:

- `feat/1-swagger-api-docs`
- `fix/14-login-error-message`
- `docs/22-readme-run-guide`

허용 type:

- `feat`
- `fix`
- `build`
- `chore`
- `docs`
- `style`
- `refactor`
- `test`
- `release`

## 커밋 메시지

```text
<type>: #<issue-number> <message>
```

예:

- `feat: #14 회원가입 폼 추가`
- `fix: #21 로그인 실패 메시지 표시`
- `docs: #22 실행 방법 문서화`

이슈 번호를 커밋 메시지에 포함해야 GitHub 이슈에서 커밋 추적이 가능하다.

## PR

- PR 대상 브랜치는 `develop`이다.
- `.github/PULL_REQUEST_TEMPLATE.md`의 체크리스트를 채운다.
- 관련 이슈는 `closes #<issue-number>` 형식으로 연결한다.
- `develop`에는 오류가 없는 코드만 보낸다.

## 커밋 전 확인

1. 로컬에서 `npm run lint`, `npm run test --if-present`, `npm run build`가 통과해야 한다.
2. 백엔드 API 연결 확인이 통과해야 한다.
3. Docker에서 앱이 빌드되고 preview 서버가 정상 응답해야 한다.
4. `.env`와 시크릿 키가 git에 포함되지 않아야 한다.
5. 커밋 메시지는 `feat: #14 커밋메시지` 형식을 지켜야 한다.

## Git Hooks

로컬 훅 설치:

```bash
scripts/install-git-hooks.sh
```

설치되는 훅:

- `commit-msg`: 커밋 메시지 형식 검사
- `pre-push`: 브랜치 이름, `.env` 추적 여부, lint, test, build, 백엔드 API 연결, Docker smoke test 검사

Git hook 원본은 `scripts/git-hooks/`에 있고, 설치 후 실제 실행 위치는 `.git/hooks/`이다.

Codex TDD Guard:

- `.codex/hooks/tdd-guard.sh`
- 구현 파일 수정 전에 대응 테스트 파일이 있는지 검사하는 PreToolUse 훅이다.

Codex Quality Gate:

- `.codex/hooks/quality-gate.sh`
- Codex가 답변을 끝내기 전 lint, test, build, 백엔드 API 연결, Docker smoke test를 실행하는 Stop 훅이다.
