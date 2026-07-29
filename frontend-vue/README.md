# Vue 학습실

`/vue` 경로에서 서빙되는 이 앱은 Vue의 마이너 버전별 변경점을 실제 코드로 체험하며 학습하기
위한 페이지 모음입니다. React 학습실(`frontend-react/README.md`)과 같은 설계 철학(대/중/소/
소소메뉴, 사이드바+콘텐츠+목차 3단 레이아웃, 편집 가능한 라이브 예제)을 Vue 생태계에 맞게
그대로 이식했습니다.

## 왜 @vue/repl인가

React 학습실은 `react-live`(sucrase로 타입 주석만 지워서 실행)를 썼지만, Vue는 그 방식이
통하지 않습니다. `defineModel`, Reactive Props Destructure 같은 기능은 **`<script setup>`
컴파일러 매크로**라서, 실제 `@vue/compiler-sfc`가 소스를 컴파일하지 않으면 애초에 존재하지
않는 문법입니다. 그래서 이 프로젝트는 Vue 팀이 공식적으로 만든 `@vue/repl`
(play.vuejs.org에서 쓰는 바로 그 컴포넌트)을 그대로 사용합니다.

- **버전 고정**: `useStore({ vueVersion })`으로 레슨마다 정확한 마이너 버전(예: v3.4 레슨은
  `3.4.38`, v3.5 레슨은 `3.5.40`)을 지정한다. `@vue/repl`이 그 버전에 맞는
  `@vue/compiler-sfc`와 Vue 런타임을 CDN(jsdelivr/unpkg)에서 받아와 컴파일·실행하므로,
  "그 버전에서 실제로 이렇게 동작한다"를 그대로 보여준다.
- **진짜 sandboxed iframe**: react-live는 같은 브라우저 렐름에서 `new Function`으로 코드를
  실행했지만, `@vue/repl`의 미리보기는 원래부터 별도 iframe 샌드박스에서 돈다 — 편집 코드가
  우리 페이지의 DOM/전역에 접근할 수 없다.
- **CodeMirror 에디터**를 썼다(Monaco는 7MB+로 너무 무거워서 "임베딩 용도로 더 적합하다"는
  공식 문서 권고를 따름). 그래도 CodeMirror 자체의 언어 서비스 때문에 레슨 페이지 방문 시
  약 1.4MB(gzip ~425KB)의 공유 청크가 로드된다 — 정확한 컴파일러 동작을 보여주는 대가로
  받아들인 트레이드오프다. (빌드 결과물에 4MB대의 "jsx" 청크가 하나 더 보이는데, 이건
  `.jsx`/`.tsx` 파일을 열 때만 쓰는 완전히 지연 로드되는 코드라 우리 레슨(전부 `.vue`
  파일만 씀)에서는 실제로 다운로드되지 않는다.)
- **알려진 한계**: 실제 브라우저에서 CDN(jsdelivr/unpkg)에 접근할 수 있어야 REPL이 동작한다.
  개인 학습용 공개 배포이므로 감내할 만한 제약으로 판단했다.

## 메뉴 taxonomy

| 단계 | 의미 | 예시 |
|------|------|------|
| 대메뉴 | 프레임워크 그 자체 (앱 단위) | **Vue** (이 앱) |
| 중메뉴 | 학습 주제의 큰 갈래 | **Version** |
| 소메뉴 | 주제 안의 구체적 대상 | Version → **v3.4**, Version → **v3.5** |
| 소소메뉴 | 실제로 배우는 개별 개념/API | v3.4 → **defineModel**, v3.5 → **useId** |

현재 트리:

```
Vue (대메뉴)
├─ 홈
├─ Version (중메뉴)
│   ├─ v3.4 (소메뉴)
│   │   ├─ defineModel (소소메뉴)
│   │   └─ v-bind 축약 문법
│   └─ v3.5 (소메뉴)
│       ├─ Reactive Props Destructure
│       ├─ useTemplateRef
│       ├─ useId
│       └─ onWatcherCleanup
└─ CRUD Demo (기존 백엔드 연동 데모, 별도 최상위 항목)
```

> Vue는 3.4 이후 3.5까지만 정식 릴리스됐다(2026-07 기준 최신 3.5.40). 각 마이너 버전의
> 실제 변경 사항은 공식 블로그(blog.vuejs.org/posts/vue-3-4, vue-3-5)를 근거로 정리했다.

## 페이지 구조 규칙

React 학습실과 동일한 3단 구성:

1. **설명** — 무엇이고, 왜/언제 쓰는지, 기존 방식과 무엇이 다른지
2. **직접 해보기** (`VueRepl`) — 실제 `@vue/compiler-sfc`로 컴파일되는 라이브 멀티 파일
   에디터. 코드를 고치면 진짜 sandboxed iframe에서 다시 컴파일·렌더링된다.
3. **다른 사용 패턴** (`CodeBlock`) — 정적 스니펫 1~2개를 `title`과 함께 나열

## 컴포넌트

- `src/components/VueRepl.vue` — `@vue/repl`의 `useStore`/`Repl`을 감싼 래퍼.
  `files`(멀티 파일), `mainFile`, `vueVersion` prop을 받는다. 되돌리기 버튼은
  `store.setFiles()`를 원본 files로 다시 호출해서 구현했다.
- `src/components/CodeBlock.vue` — `prismjs`로 정적 코드 스니펫에 문법 강조를 적용한다
  (기본 언어는 `markup` — `<template>`/`<script>`가 섞인 SFC 스니펫을 감안).
- `src/components/Layout.vue` / `Sidebar.vue` / `MenuItem.vue` / `PageIndex.vue` /
  `ErrorBoundary.vue` — React 학습실의 동일 컴포넌트를 Vue Composition API로 이식.
  `ErrorBoundary`는 React의 에러 바운더리 대신 `onErrorCaptured()`를 쓴다.
- `src/index.css` — React 학습실의 `index.css`와 거의 동일(순수 CSS라 프레임워크 무관).
  `.playground-*` 대신 `.vue-repl-*` 클래스만 새로 추가했다.

## 새 레슨 추가하는 법

1. `src/pages/version/<소메뉴>/XxxPage.vue` 생성 (설명 + `VueRepl` + `CodeBlock` 구조)
2. `src/menu.ts`의 `menuTree`에 노드 추가
3. `src/router.ts`에 `component: () => import(...)` 라우트 추가 (lazy import로 코드
   스플리팅 — CodeMirror+@vue/repl 비용을 레슨 페이지만 지불하게 한다)

## 현재 구현된 레슨

- **defineModel** (v3.4) — `v-model`을 지원하는 컴포넌트를 매크로 하나로 구현. 커스텀
  input 컴포넌트 2-파일 데모.
- **v-bind 동일 이름 축약** (v3.4) — `:id="id"` → `:id` 문법 축약. 여러 속성 한 번에 확인.
- **Reactive Props Destructure** (v3.5) — `defineProps()` 구조 분해 시 반응성 유지 +
  네이티브 기본값 문법.
- **useTemplateRef** (v3.5) — 문자열 이름으로 template ref를 얻는 새 API. 자동 포커스 데모.
- **useId** (v3.5) — 앱 안에서 유일하고 안정적인 id 생성. 폼 필드 접근성 데모.
- **onWatcherCleanup** (v3.5) — watcher 정리 콜백 등록. 타이핑할 때마다 이전 타이머를
  취소하는 디바운스 데모.
- **CRUD Demo** — Express + Drizzle ORM `/api/people`을 호출하는 실전 연동 예제
  (React/TypeScript 프론트엔드와 동일한 데이터, id 직접 지정 가능).

## 의존성

- `vue-router` `^4.6.4` — **v5가 아니라 v4를 의도적으로 선택**했다. v5는 Pinia +
  `@pinia/colada` + Vite 7/8을 강제하는 새 아키텍처라 우리 Vite 5 스택과 안 맞고, 우리에게
  필요한 건 단순 라우팅뿐이라 과한 의존성이었다.
- `@vue/repl` — 위에서 설명한 라이브 SFC 플레이그라운드.
- `prismjs` + `@types/prismjs` — `CodeBlock`의 정적 코드 문법 강조.
