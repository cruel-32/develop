/**
 * 사이드바 메뉴 트리 (React 학습실의 menu.ts와 동일한 설계).
 *
 * 대메뉴(Vue 앱 자체) 안에 중메뉴 -> 소메뉴 -> 소소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 */
export interface MenuNode {
  id: string;
  label: string;
  /** basename("/vue") 기준 상대 경로. children이 있는 그룹 노드는 생략 가능 */
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
        id: "v34",
        label: "v3.4",
        children: [
          { id: "define-model", label: "defineModel", path: "version/v3.4/define-model" },
          {
            id: "v-bind-shorthand",
            label: "v-bind 축약 문법",
            path: "version/v3.4/v-bind-shorthand",
          },
        ],
      },
      {
        id: "v35",
        label: "v3.5",
        children: [
          {
            id: "reactive-props-destructure",
            label: "Reactive Props Destructure",
            path: "version/v3.5/reactive-props-destructure",
          },
          {
            id: "use-template-ref",
            label: "useTemplateRef",
            path: "version/v3.5/use-template-ref",
          },
          { id: "use-id", label: "useId", path: "version/v3.5/use-id" },
          {
            id: "on-watcher-cleanup",
            label: "onWatcherCleanup",
            path: "version/v3.5/on-watcher-cleanup",
          },
        ],
      },
    ],
  },
  {
    id: "crud-demo",
    label: "CRUD Demo",
    path: "crud-demo",
  },
];
