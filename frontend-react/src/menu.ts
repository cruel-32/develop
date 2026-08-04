/**
 * 사이드바 메뉴 트리.
 *
 * 대메뉴(React 앱 자체) 안에 중메뉴 -> 소메뉴 -> 소소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 * 새 레슨을 추가할 때는 이 배열에 노드를 추가하고 App.tsx에 <Route>만 함께 추가하면 된다.
 */
export interface MenuNode {
  id: string;
  label: string;
  /** basename("/react") 기준 상대 경로. children이 있는 그룹 노드는 생략 가능 */
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
        id: "v19",
        label: "v19",
        children: [
          { id: "use-action-state", label: "useActionState", path: "version/v19/use-action-state" },
          { id: "use-optimistic", label: "useOptimistic", path: "version/v19/use-optimistic" },
          { id: "use", label: "use", path: "version/v19/use" },
          { id: "use-form-status", label: "useFormStatus", path: "version/v19/use-form-status" },
        ],
      },
      {
        id: "v18",
        label: "v18",
        children: [
          { id: "use-id", label: "useId", path: "version/v18/use-id" },
          { id: "use-transition", label: "useTransition", path: "version/v18/use-transition" },
          { id: "use-deferred-value", label: "useDeferredValue", path: "version/v18/use-deferred-value" },
          {
            id: "use-sync-external-store",
            label: "useSyncExternalStore",
            path: "version/v18/use-sync-external-store",
          },
          { id: "use-insertion-effect", label: "useInsertionEffect", path: "version/v18/use-insertion-effect" },
        ],
      },
    ],
  },
  {
    id: "external-module",
    label: "External Module",
    children: [
      {
        id: "store",
        label: "Store",
        children: [
          {
            id: "zustand",
            label: "Zustand",
            path: "external-module/store/zustand",
          },
          {
            id: "jotai",
            label: "Jotai",
            path: "external-module/store/jotai",
          },
        ],
      },
      {
        id: "data-fetching",
        label: "Data Fetching",
        children: [
          {
            id: "tanstack-query",
            label: "TanStack Query",
            path: "external-module/data-fetching/tanstack-query",
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
