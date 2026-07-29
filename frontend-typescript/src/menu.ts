/**
 * 사이드바 메뉴 트리 (React/Vue 학습실의 menu.ts와 동일한 설계).
 *
 * 대메뉴(TypeScript 앱 자체) 안에 중메뉴 -> 소메뉴 -> 소소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 */
export interface MenuNode {
  id: string;
  label: string;
  /** 라우터 기준 상대 경로("" = 홈). children이 있는 그룹 노드는 생략 가능 */
  path?: string;
  children?: MenuNode[];
}

export const menuTree: MenuNode[] = [
  { id: "home", label: "홈", path: "" },
  {
    id: "version",
    label: "Version",
    children: [
      {
        id: "v70",
        label: "v7.0",
        children: [
          {
            id: "template-literal-unicode",
            label: "템플릿 리터럴 유니코드",
            path: "version/v7.0/template-literal-unicode",
          },
          {
            id: "native-compiler",
            label: "네이티브 컴파일러",
            path: "version/v7.0/native-compiler",
          },
        ],
      },
      {
        id: "v60",
        label: "v6.0",
        children: [
          {
            id: "strict-by-default",
            label: "strict 기본값 true",
            path: "version/v6.0/strict-by-default",
          },
          {
            id: "map-get-or-insert",
            label: "Map/WeakMap getOrInsert",
            path: "version/v6.0/map-get-or-insert",
          },
        ],
      },
      {
        id: "v59",
        label: "v5.9",
        children: [
          { id: "import-defer", label: "import defer", path: "version/v5.9/import-defer" },
          {
            id: "arraybuffer-split",
            label: "ArrayBuffer/TypedArray 분리",
            path: "version/v5.9/arraybuffer-split",
          },
        ],
      },
      {
        id: "v58",
        label: "v5.8",
        children: [
          {
            id: "return-branches",
            label: "return문 분기별 타입 검사",
            path: "version/v5.8/return-branches",
          },
          {
            id: "erasable-syntax-only",
            label: "erasableSyntaxOnly",
            path: "version/v5.8/erasable-syntax-only",
          },
        ],
      },
    ],
  },
  { id: "crud-demo", label: "CRUD Demo", path: "crud-demo" },
];
