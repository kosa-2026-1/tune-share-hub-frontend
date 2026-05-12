# 아키텍처

## 디렉토리 구조

```text
src/
├── main.jsx        # React 앱 진입점
├── App.jsx         # 최상위 앱 컴포넌트와 라우팅 루트
├── api/            # 외부 API 클라이언트와 요청 함수
├── components/     # 재사용 UI 컴포넌트
├── hooks/          # 공통 React hooks
├── pages/          # 라우트 단위 화면
└── stores/         # 클라이언트 상태 저장소
```

## 패턴

- Vite 기반 SPA로 유지한다.
- 페이지 컴포넌트는 라우트 단위 책임만 갖고, 재사용 가능한 UI는 `components/`로 분리한다.
- 외부 HTTP 호출은 `api/`에 모아 컴포넌트와 네트워크 세부사항을 분리한다.
- 복잡한 화면 상태나 재사용 상태 로직은 `hooks/` 또는 `stores/`로 승격한다.

## 데이터 흐름

```text
사용자 입력
-> page/component
-> hook/store (필요한 경우)
-> api module
-> backend/external API
-> UI state update
```

## 상태 관리

- 로컬 UI 상태는 우선 `useState`/`useReducer`로 처리한다.
- 여러 페이지나 컴포넌트가 공유하는 상태만 `stores/`로 분리한다.
- 서버 응답 캐싱이 필요해지기 전에는 추가 상태 관리 라이브러리를 도입하지 않는다.
