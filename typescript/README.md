# TypeScript 학습실

`/typescript` 경로에서 서빙되는 이 앱은 TypeScript 5.8 이후 마이너/메이저 버전별 변경점을
실제 코드로 체험하며 학습하기 위한 페이지 모음입니다. React/Vue 학습실과 같은 설계 철학(대/
중/소/소소메뉴, 사이드바+콘텐츠+목차 3단 레이아웃, 편집 가능한 라이브 예제)을 따르지만, 이
앱만은 **프레임워크 없이 순수 TypeScript + Vite**로 만들었습니다 — 학습 대상이 TypeScript
자체이므로 React/Vue의 렌더링 방식이 끼어들 이유가 없기 때문입니다.

## 왜 `@typescript/vfs`인가

`ts.transpileModule()`은 문법만 확인할 뿐 실제 타입 검사(semantic diagnostics)를 하지
않습니다 — 직접 검증해보면 `let x: number = "hello"` 같은 코드도 진단 0개로 나옵니다.
그래서 실제 `tsc`가 쓰는 것과 동일한 조합인 `ts.createProgram()` +
`ts.getPreEmitDiagnostics()`를 그대로 사용하며, `@typescript/vfs`가 target/lib에 맞는
`lib.d.ts` 파일들을 CDN에서 받아와 가상 파일시스템을 구성해줍니다. 이건 공식 TypeScript
Playground(typescriptlang.org/play)가 쓰는 것과 정확히 같은 조합입니다.

- **버전 고정**: 레슨마다 정확한 패치 버전(5.8.3 / 5.9.3 / 6.0.3)의 `typescript.js` UMD
  번들을 jsdelivr CDN에서 `<script>` 태그로 동적 로드합니다 — "그 버전에서 실제로 이렇게
  동작한다"를 그대로 보여줍니다.
- **디바운스 재검사**: 에디터 입력 500ms 후 재검사하며, 이전 요청이 늦게 끝나 최신 결과를
  덮어쓰지 않도록 요청 순번(`requestSeq`)으로 오래된 응답을 버립니다.
- **다중 파일 지원**: `import defer` 레슨처럼 실제 모듈 해석이 필요한 경우
  `extraFiles`로 보조 파일을 함께 컴파일할 수 있습니다.

### TypeScript 7.0의 한계

TypeScript 7.0은 컴파일러 자체를 Go로 새로 이식한 네이티브 포트입니다. 공식 발표
(devblogs.microsoft.com/typescript/announcing-typescript-7-0)는 "7.0에는 아직 안정된
프로그래밍 API가 없으며, API는 7.1에서 제공될 예정"이라고 명시합니다. 실제로 npm의
`typescript@7.0.2` 패키지에는 브라우저에서 로드 가능한 `lib/typescript.js`가 아예 들어있지
않고 (`getExePath.js`, `tsc.js`, `bin/tsc` 같은 네이티브 실행 파일 런처만 존재), 이는
jsdelivr 미러링 문제가 아니라 패키지 구조 자체의 문제임을 npm 레지스트리 메타데이터로 직접
확인했습니다. 그래서:

- **템플릿 리터럴 유니코드** 레슨: "변경 전" 동작은 CDN에서 실행 가능한 마지막 버전인
  6.0.3으로 라이브 실습하고(타입 단언 트릭으로 진단 유무를 통해 확인), "변경 후" 동작은
  공식 발표 예시를 정적 코드로 보여줍니다.
- **네이티브 컴파일러** 레슨: 처음부터 실습창 없이, 공식 벤치마크 표와 설치/플래그 안내로
  구성했습니다.

두 레슨 모두 페이지 안에서 이 제약과 근거를 그대로 설명합니다.

## 메뉴 taxonomy

| 단계 | 의미 | 예시 |
|------|------|------|
| 대메뉴 | 앱 자체 | **TypeScript** (이 앱) |
| 중메뉴 | 학습 주제의 큰 갈래 | **Version** |
| 소메뉴 | 주제 안의 구체적 대상 | Version → **v5.8**, **v5.9**, **v6.0**, **v7.0** |
| 소소메뉴 | 실제로 배우는 개별 개념/API | v5.8 → **return문 분기별 타입 검사** |

현재 트리:

```
TypeScript (대메뉴)
├─ 홈
├─ Version (중메뉴)
│   ├─ v5.8 (소메뉴)
│   │   ├─ return문 분기별 타입 검사
│   │   └─ erasableSyntaxOnly
│   ├─ v5.9 (소메뉴)
│   │   ├─ import defer
│   │   └─ ArrayBuffer/TypedArray 분리
│   ├─ v6.0 (소메뉴)
│   │   ├─ strict 기본값 true
│   │   └─ Map/WeakMap getOrInsert
│   └─ v7.0 (소메뉴)
│       ├─ 템플릿 리터럴 유니코드
│       └─ 네이티브 컴파일러 (실습창 없음, 이유는 본문 참고)
└─ CRUD Demo (기존 백엔드 연동 데모, 별도 최상위 항목)
```

> 5.8 이후 정확히 4개의 마이너/메이저 릴리스(5.8, 5.9, 6.0, 7.0)가 존재한다는 사실을 npm
> 레지스트리(`registry.npmjs.org/typescript`)의 실제 버전 이력으로 확인했다. 각 릴리스의
> 실제 변경 사항은 공식 devblogs.microsoft.com/typescript 발표 글을 근거로 정리했고, 8개
> 레슨의 모든 코드 예시는 해당 패치 버전의 실제 `tsc` CLI로 직접 실행해 진단 결과가
> 발표문과 일치하는지 검증했다.

## 페이지 구조 규칙

각 레슨은 다음 순서를 따릅니다:

1. **설명** — 무엇이 바뀌었고, 왜 바뀌었는지, 이전엔 어떻게 동작했는지
2. **직접 해보기** (`mountTsPlayground`) — 왼쪽은 편집 가능한 코드, 오른쪽은 실시간
   진단(diagnostics) 패널. 초기 코드로 되돌리기 버튼 포함.
3. (일부 레슨) **정적 코드 예시** (`codeBlock`) — 라이브 실습이 불가능하거나 비교가 필요한
   경우의 보조 스니펫

## 주요 모듈

- `src/tsPlayground.ts` — CDN에서 특정 버전의 `typescript.js`를 불러와 `@typescript/vfs`
  기반으로 실제 타입 검사를 수행하는 핵심 로직 + 에디터/진단 패널 UI 마운트.
- `src/router.ts` — pushState 기반의 최소 vanilla 라우터. 페이지 렌더 중 에러가 나면
  자동으로 `.crash-box`를 보여준다 (React ErrorBoundary/Vue `onErrorCaptured`의 대응물).
- `src/layout.ts` / `src/pageIndex.ts` — 사이드바/목차 렌더링과 `IntersectionObserver`
  기반 스크롤 스파이.
- `src/menu.ts` — 사이드바 메뉴 트리 정의 (React/Vue의 `menu.ts`와 동일한 설계).
- `src/pageHelpers.ts` — `escapeHtml`, 정적 `codeBlock` 렌더러.
- `src/index.css` — React/Vue 학습실과 같은 디자인 시스템(CSS 커스텀 프로퍼티)을 공유하되,
  `.playground-*`/`.vue-repl-*` 대신 이 앱만의 `.ts-playground-*` 클래스를 쓴다 (에디터가
  CodeMirror/react-live가 아니라 평범한 `<textarea>`이기 때문).

## 새 레슨 추가하는 법

1. `src/pages/version/<소메뉴>/xxx.ts` 생성 — `PageRender` 시그니처의 `render` 함수를
   export (설명 HTML + `mountTsPlayground` 또는 `codeBlock` 조합)
2. `src/menu.ts`의 `menuTree`에 노드 추가 (경로는 `version/vX.Y/slug` 형태)
3. `src/main.ts`에 `registerRoute("version/vX.Y/slug", render)` 추가

## 의존성

- `typescript` `^5.6.3` (devDependency) — 프로젝트 자체 빌드용. 레슨에서 실제로 실행되는
  컴파일러는 이것과 무관하게 CDN에서 버전별로 동적 로드된다.
- `@typescript/vfs` — 가상 파일시스템 기반 `lib.d.ts` 로딩 + 컴파일러 호스트 생성. 타입은
  고정된 devDependency 버전의 `CompilerOptions`를 기준으로 하지만, 실제로는 CDN에서 받아온
  임의 버전의 `ts`를 덕타이핑으로 쓰므로 관련 호출부는 의도적으로 `as any`를 사용한다.
