/**
 * 사이드바 메뉴 트리 (다른 학습실의 menu.ts와 동일한 설계).
 *
 * 대메뉴 안에 중메뉴 -> 소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 *
 * PostgreSQL은 버전별 스펙보다 "기본 문법 -> JOIN -> 집계/함수 -> 서버 사이드
 * 함수/프로시저"로 이어지는 학습 순서가 더 자연스러워서, 주제별 그룹으로 묶는다.
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
    id: "basics",
    label: "기초 문법",
    children: [
      { id: "select", label: "SELECT · WHERE · ORDER BY", path: "basics/select" },
      { id: "insert", label: "INSERT", path: "basics/insert" },
      { id: "update", label: "UPDATE", path: "basics/update" },
      { id: "delete", label: "DELETE", path: "basics/delete" },
    ],
  },
  {
    id: "joins",
    label: "JOIN",
    children: [
      { id: "inner-join", label: "INNER JOIN", path: "joins/inner-join" },
      { id: "outer-join", label: "LEFT / RIGHT / FULL OUTER JOIN", path: "joins/outer-join" },
      { id: "cross-self-join", label: "CROSS JOIN · SELF JOIN", path: "joins/cross-self-join" },
    ],
  },
  {
    id: "aggregation",
    label: "집계 & 함수",
    children: [
      {
        id: "group-by-aggregate",
        label: "GROUP BY · 집계 함수 · HAVING",
        path: "aggregation/group-by-aggregate",
      },
      { id: "string-functions", label: "문자열 함수", path: "aggregation/string-functions" },
      { id: "date-functions", label: "날짜/시간 함수", path: "aggregation/date-functions" },
      { id: "window-functions", label: "윈도우 함수", path: "aggregation/window-functions" },
    ],
  },
  {
    id: "procedures",
    label: "함수 & 프로시저",
    children: [
      {
        id: "plpgsql-functions",
        label: "PL/pgSQL 사용자 정의 함수",
        path: "procedures/plpgsql-functions",
      },
      { id: "stored-procedures", label: "저장 프로시저 (PROCEDURE)", path: "procedures/stored-procedures" },
      { id: "triggers", label: "트리거", path: "procedures/triggers" },
    ],
  },
];
