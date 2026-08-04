/**
 * 사이드바 메뉴 트리 (React/Vue/TypeScript/ECMAScript 학습실의 menu.ts와 동일한 설계).
 *
 * 대메뉴 안에 중메뉴 -> 소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 *
 * HTML5/CSS는 TS/Vue/React처럼 딱 떨어지는 버전 번호가 없어서, "Version" 대신
 * 주제별 그룹으로 묶는다.
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
    id: "semantics",
    label: "시맨틱 & 엘리먼트",
    children: [
      { id: "dialog-element", label: "<dialog> 모달", path: "semantics/dialog-element" },
      {
        id: "details-summary",
        label: "<details>/<summary> 아코디언",
        path: "semantics/details-summary",
      },
    ],
  },
  {
    id: "forms",
    label: "폼 & 검증",
    children: [
      { id: "form-validation", label: "신규 input type / 검증", path: "forms/form-validation" },
      { id: "popover", label: "popover 속성", path: "forms/popover" },
    ],
  },
  {
    id: "layout",
    label: "레이아웃",
    children: [
      { id: "flexbox-grid", label: "Flexbox vs Grid", path: "layout/flexbox-grid" },
      { id: "container-queries", label: "Container Queries", path: "layout/container-queries" },
    ],
  },
  {
    id: "selectors",
    label: "선택자 & 캐스케이드",
    children: [
      { id: "has-selector", label: ":has()", path: "selectors/has-selector" },
      { id: "cascade-layers", label: "Nesting + @layer", path: "selectors/cascade-layers" },
    ],
  },
  {
    id: "color-motion",
    label: "색상 & 애니메이션",
    children: [
      {
        id: "custom-properties-color",
        label: "Custom Properties / 색상 함수",
        path: "color-motion/custom-properties-color",
      },
      { id: "view-transitions", label: "View Transitions API", path: "color-motion/view-transitions" },
    ],
  },
  {
    id: "media",
    label: "미디어",
    children: [
      {
        id: "video-audio-api",
        label: "<video>/<audio> + HTMLMediaElement API",
        path: "media/video-audio-api",
      },
      {
        id: "track-captions-pip",
        label: "<track> 자막 + Picture-in-Picture",
        path: "media/track-captions-pip",
      },
    ],
  },
];
