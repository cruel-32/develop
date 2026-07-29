# React 학습실

`/react` 경로에서 서빙되는 이 앱은 React의 새 기능/생태계 라이브러리를 직접 타이핑해보며
학습하기 위한 페이지 모음입니다. 단순 CRUD 데모였던 이전 버전에서, 다중 카테고리 학습
콘텐츠를 담을 수 있는 구조로 확장되었습니다.

## 메뉴 taxonomy

요청받은 분류 방식을 다음과 같이 정리했습니다.

| 단계 | 의미 | 예시 |
|------|------|------|
| 대메뉴 | 프레임워크/스택 그 자체 (앱 단위) | **React** (이 앱), Vue, TypeScript |
| 중메뉴 | 학습 주제의 큰 갈래 | **Version**, **External Module** (서로 동급) |
| 소메뉴 | 주제 안의 구체적 대상 | Version → **v19**, External Module → **Store** |
| 소소메뉴 | 그 안의 더 구체적인 분류 또는 개별 개념/API | v19 → **useActionState**, Store → **Zustand** |

이 계층은 `src/menu.ts`의 `MenuNode[]` 트리 하나로 표현되며, 깊이 제한이 없습니다.
`children`이 있으면 사이드바에서 펼침/접힘 그룹(`<details>`)으로, `path`가 있으면 실제
페이지로 렌더링됩니다. 즉 "무수한 카테고리"가 생겨도 이 트리에 노드를 추가하는 것만으로
확장됩니다 — 예를 들어 나중에 `Version > v20 > ...`나 `Store > Redux`, `Data Fetching >
React Query` 같은 갈래를 추가해도 구조는 동일합니다.

현재 트리:

```
React (대메뉴)
├─ 홈
├─ Version (중메뉴)
│   ├─ v18 (소메뉴)
│   │   ├─ useId (소소메뉴)
│   │   ├─ useTransition
│   │   ├─ useDeferredValue
│   │   ├─ useSyncExternalStore
│   │   └─ useInsertionEffect
│   └─ v19 (소메뉴)
│       ├─ useActionState
│       ├─ useOptimistic
│       ├─ use
│       └─ useFormStatus
├─ External Module (중메뉴, Version과 동급)
│   └─ Store (소메뉴)
│       └─ Zustand (소소메뉴)
└─ CRUD Demo (기존 백엔드 연동 데모, 별도 최상위 항목)
```

> deprecated된 훅(`useFormState` 등 `useActionState`로 대체된 것)은 의도적으로 제외했다.
> React 17은 새로 추가된 훅이 없는 "No New Features" 릴리스라 다루지 않는다.
> `External Module`은 React 코어가 아닌 서드파티 라이브러리(상태관리, 라우팅, 데이터
> 페칭 등)를 위한 `Version`과 동급의 자리로, 지금은 `Store > Zustand`만 있지만 나중에
> `Routing > React Router`, `Data Fetching > TanStack Query` 같은 갈래를 그 옆에 추가할 수 있다.

## 페이지 구조 규칙

모든 레슨 페이지(`src/pages/**`)는 동일한 3단 구성을 따릅니다.

1. **설명** — 무엇이고, 왜/언제 쓰는지, 기존 방식과 무엇이 다른지
2. **직접 해보기** (`Playground`) — react.dev 레퍼런스 페이지의 편집 가능한 예제처럼, 코드
   에디터에서 직접 소스를 고쳐가며 즉시 재실행되는 라이브 미리보기로 학습
3. **다른 사용 패턴** (`CodeBlock`) — react.dev의 단일 예제보다 더 다양한 사용 패턴을 1~3개씩
   `title`이 붙은 정적 스니펫으로 나열 (폼 없이 직접 호출, 캐싱/파생 상태 패턴 등)

새 개념을 추가할 때도 이 3단 구성을 유지하면 학습 경험이 일관됩니다.

### 레이아웃 (사이드바 / 콘텐츠 / 목차)

`Layout.tsx`는 3단 구성이다: 왼쪽 **사이드바**(메뉴 트리) - 가운데 **콘텐츠**(`max-width` 없이
남는 가로 공간을 전부 채움) - 오른쪽 **목차**(`PageIndex`, "On this page"). `PageIndex`는
페이지마다 목차를 손으로 관리할 필요 없이, 렌더링된 `<article>` 안의 `h2`/`h3`를
`MutationObserver`로 스캔해 자동으로 앵커 목록을 만들고 `IntersectionObserver`로 현재 보고
있는 섹션을 하이라이트한다(스크롤 스파이). 목차를 클릭해 앵커로 스크롤될 때 sticky한
`.topbar`에 제목이 가려지지 않도록, 모든 `h1/h2/h3`에 `scroll-margin-top: calc(--topbar-h +
1rem)`을 줘서 여백을 확보했다. 64rem 이하 화면에서는 목차가 자동으로 숨겨진다.

`CodeBlock`은 `prism-react-renderer`(`Highlight` + `themes.vsDark`)로 문법 강조를 적용합니다.
`language` prop(기본값 `"tsx"`)만 바꾸면 다른 언어 스니펫도 강조할 수 있습니다.

### Playground (편집 가능한 라이브 예제)

`src/components/Playground.tsx`는 `react-live`의 `LiveProvider`/`LiveEditor`/`LiveError`/
`LivePreview`를 감싼 컴포넌트로, 각 레슨 페이지의 "직접 해보기" 데모를 담당합니다.

```tsx
<Playground code={demoCode} scope={{ useActionState }} />
```

- **`scope`는 화이트리스트**다. 편집 코드에서 이름으로 바로 쓸 수 있는 값은 여기 넘긴 것뿐이고,
  `import`/`require`는 react-live가 지원하지 않아 시도하면 즉시 에러로 표시된다 — 즉 임의
  npm 패키지를 불러오는 것 자체가 애초에 불가능하다.
- **`noInline` 모드**를 쓰므로 편집 코드는 여러 함수 선언을 포함할 수 있고, 마지막에
  `render(<Something />)`으로 끝나야 한다.
- **에러 격리**: react-live는 자체 에러 바운더리로 편집 코드의 문법 오류/런타임 오류를 잡아
  `LiveError`에만 표시한다 — 나머지 페이지는 영향을 받지 않는다. 그 위에 한 겹 더,
  `components/Layout.tsx`가 라우트별로 `ErrorBoundary`(`src/components/ErrorBoundary.tsx`)로
  콘텐츠 영역을 감싸서, Playground 바깥의 페이지 자체 버그로 인한 렌더 예외도 사이드바까지는
  번지지 않게 한다.
- **되돌리기 버튼**: `LiveProvider`를 `key`로 강제 리마운트해 원래 `code`로 즉시 복원한다
  (콘솔 로그도 함께 지워진다).
- **레이아웃**: 왼쪽 = 에디터, 오른쪽은 위/아래 2행으로 나눠 **위 = 미리보기**(`LivePreview`),
  **아래 = 콘솔 로그**로 구성했다. 각 행은 `.playground-right`(고정 높이) 안에서
  `flex: 1 1 50%`로 절반씩 차지하고 내용이 넘치면 각자 독립적으로 스크롤된다.
- **콘솔 패널**: 편집 코드 안의 `console.log/info/warn/error` 호출은 실제 브라우저
  콘솔이 아니라, `Playground`가 `scope`에 주입하는 이 인스턴스 전용 가짜 `console`로
  가로채져 콘솔 행에 표시된다(진짜 전역 `console`을 건드리지 않으므로 다른 Playground나
  브라우저 devtools에는 영향이 없다). 렌더링 중 에러(`LiveError`)도 같은 패널에 표시되고,
  이벤트 핸들러처럼 React 렌더 트리 밖에서 던져진 예외는 `window`의 `error`/
  `unhandledrejection` 이벤트로 잡아 함께 보여준다.
- **TypeScript**: `language="tsx"` + react-live 기본값인 `enableTypeScript`로 에디터와
  미리보기 모두 TypeScript 문법(인터페이스, 제네릭, 타입 주석)을 그대로 지원한다. 다만
  react-live는 sucrase로 타입 주석을 "지워주기"만 할 뿐 실제 타입 검사는 하지 않으므로,
  이 프로젝트의 모든 데모 코드는 실제 `tsc`(버전은 툴바의 배지 참고, `lib/constants.ts`에서
  관리)로 strict 모드 타입 에러가 없는지 미리 확인하고 작성했다.
- **알려진 한계 (정직하게 밝힘)**: react-live는 진짜 iframe 샌드박스가 아니라 같은 브라우저
  탭 안에서 `new Function`으로 코드를 실행한다. 그래서 브라우저 전역(`window`, `fetch` 등)
  자체를 원천 차단하지는 못한다 — 다만 `scope`에 없는 이름은 애초에 자동완성/설명에도 없고,
  `import` 시도는 바로 에러로 끝나므로 "의도된 API 밖의 동작"을 하려면 사용자가 콘솔을 열고
  브라우저 전역을 직접 뒤지는 수준의 의도적 시도가 필요하다. 이 프로젝트는 개인 학습용
  도구이므로 이 수준의 격리로 충분하다고 판단했다. 완전한 네트워크/DOM 격리가 필요하면
  Sandpack처럼 별도 오리진의 sandboxed iframe으로 옮기는 것이 다음 단계다.

## 새 레슨 추가하는 법

1. `src/pages/<중메뉴>/<소메뉴>/XxxPage.tsx` 생성 (설명 + `Playground` + `CodeBlock` 구조)
2. `src/menu.ts`의 `menuTree`에 노드 추가 (`path`는 `App.tsx`의 라우트 경로와 동일해야 함)
3. `src/App.tsx`에 `lazy(() => import(...))` + `<Route>` 추가 (react-live 번들을 방문 시점에만
   로드하기 위해 모든 레슨 페이지는 lazy import + `<Suspense>`로 감싼다)
4. 필요하면 `src/index.css`에 공용 클래스(`.playground`, `.inline-form`, `.error`, `.success` 등) 재사용

라우팅은 `react-router-dom`의 `BrowserRouter`를 `basename={import.meta.env.BASE_URL}`로 띄워서,
Vite의 `base: "/react/"` 설정과 항상 동기화됩니다 (Express 쪽 SPA fallback이
`/react/*` 요청을 전부 `index.html`로 돌려주므로 새로고침해도 깨지지 않습니다).

## 현재 구현된 레슨

- **useId** (v18) — 접근성 속성에 쓸 안정적인 고유 id 생성. 재사용 폼 필드 데모.
- **useTransition** (v18) — 긴급/비긴급 업데이트 구분. 무거운 목록 필터링 + on/off 비교 데모.
- **useDeferredValue** (v18) — 값의 지연된 버전 생성. 입력은 즉시, 결과 목록은 살짝 늦게
  갱신되는 데모.
- **useSyncExternalStore** (v18) — React 밖의 값을 안전하게 구독. 커스텀 pub-sub 스토어
  데모 (Zustand가 내부적으로 쓰는 바로 그 훅).
- **useInsertionEffect** (v18) — CSS-in-JS 라이브러리용 훅. `useInsertionEffect` →
  `useLayoutEffect` → `useEffect` 실행 순서를 콘솔 패널로 확인하는 데모.
- **useActionState** (v19) — 폼 액션의 결과 상태 + `isPending`을 함께 관리하는 훅. **실제
  `/api/people`에 POST하는 사람 등록 폼** 데모 (CRUD Demo와 완전히 같은 데이터베이스).
- **useOptimistic** — 비동기 작업 완료 전에 낙관적으로 UI를 먼저 갱신하고, 실패 시 자동
  롤백하는 훅. **CRUD Demo와 같은 실제 목록**에서 낙관적으로 삭제하는 데모(실패 시뮬레이션
  토글 포함).
- **use** — Promise/Context를 조건부로 읽을 수 있는 React 19 신규 API. **실제
  `GET /api/people/:id`**를 Promise + Suspense로 읽는 데모, 조건부 Context 읽기 데모.
- **useFormStatus** (`react-dom`) — 가장 가까운 부모 `<form>`의 제출 상태를 자식 컴포넌트에서
  읽는 훅. useActionState와 **같은 실제 사람 등록 폼**을 재사용한 `SubmitButton` 패턴 데모.
- **Zustand** (External Module → Store) — Provider 없이 훅 하나로 전역 상태를 공유하는
  상태관리 라이브러리. **CRUD Demo와 같은 실제 `/api/people` 목록**을 감싸는 스토어를
  셀렉터로 슬라이스별 구독하는 데모.
- **CRUD Demo** — Express + Drizzle ORM `/api/people`을 호출하는 실전 연동 예제. 데이터
  모델은 `{ id, name, age: number, job, address? }`로 고정되어 있고, 페이지네이션이 있는
  목록(생성/삭제 포함)과 개별 레코드 상세 조회/수정/삭제(master-detail)를 지원한다. **`id`는
  자동 생성이 아니라 사용자가 직접 지정**하는 값이라, 목록에서 id를 확인한 뒤 `use` 레슨의
  상세 조회 데모에 그대로 입력해 원하는 레코드를 불러올 수 있고, 이미 존재하는 id로 생성을
  시도해 `409` 중복 처리도 확인할 수 있다. 상세 화면에서 id 자체를 바꿔 저장하면 그 레코드의
  기본키(PK)가 바뀐다.

> 위 5개 레슨은 CRUD Demo와 **진짜 같은 데이터베이스**를 건드린다 — 여기서 등록/삭제하면
> CRUD Demo 목록에도 그대로 반영되고, 반대로도 마찬가지다. 개인 학습용 배포이므로 의도된
> 동작이지만, 공개 배포에서는 이 점을 감안할 것.

## 의존성 변경 사항

- `react`, `react-dom`: 18 → **19** (useActionState/useOptimistic/use/useFormStatus 사용을 위해 필수)
- `react-router-dom` 신규 추가 — 중첩 라우팅 + 사이드바 네비게이션
- `zustand` 신규 추가 — Store 레슨용
- `prism-react-renderer` 신규 추가 — `CodeBlock`의 문법 강조 (별도 CSS 파일 없이 inline theme 사용)
- `react-live` 신규 추가 — `Playground`의 편집 가능한 라이브 예제 (내부적으로
  `prism-react-renderer`와 같은 메이저 버전을 사용). 번들이 커서(gzip 약 79KB) 레슨 페이지들은
  `App.tsx`에서 `React.lazy`로 코드 스플리팅되어 있다 — Home/CRUD Demo는 이 비용을 지불하지 않는다.
- `typescript`: 정식 최신 버전인 **7.0.2**로 `--save-exact` 고정 (네이티브 컴파일러로 넘어간
  첫 메이저 버전). `Playground` 툴바의 배지(`src/lib/constants.ts`의 `TYPESCRIPT_VERSION`)와
  반드시 같은 값으로 유지할 것.
