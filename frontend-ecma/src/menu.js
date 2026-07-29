/**
 * 사이드바 메뉴 트리 (React/Vue/TypeScript 학습실의 menu와 동일한 설계).
 *
 * 대메뉴(ECMAScript 앱 자체) 안에 중메뉴 -> 소메뉴 -> 소소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 *
 * @typedef {Object} MenuNode
 * @property {string} id
 * @property {string} label
 * @property {string} [path] 라우터 기준 상대 경로("" = 홈). children이 있는 그룹 노드는 생략 가능
 * @property {MenuNode[]} [children]
 */

/** @type {MenuNode[]} */
export const menuTree = [
  { id: "home", label: "홈", path: "" },
  {
    id: "version",
    label: "Version",
    children: [
      {
        id: "es2025",
        label: "ES2025",
        children: [
          { id: "set-methods", label: "Set 메서드", path: "version/es2025/set-methods" },
          { id: "iterator-helpers", label: "이터레이터 헬퍼", path: "version/es2025/iterator-helpers" },
        ],
      },
      {
        id: "es2024",
        label: "ES2024",
        children: [
          { id: "object-groupby", label: "Object.groupBy / Map.groupBy", path: "version/es2024/object-groupby" },
          { id: "promise-withresolvers", label: "Promise.withResolvers", path: "version/es2024/promise-withresolvers" },
        ],
      },
      {
        id: "es2023",
        label: "ES2023",
        children: [
          { id: "array-find-last", label: "findLast / findLastIndex", path: "version/es2023/array-find-last" },
          { id: "array-immutable", label: "toSorted / toReversed / with", path: "version/es2023/array-immutable" },
        ],
      },
      {
        id: "es2022",
        label: "ES2022",
        children: [
          { id: "class-fields", label: "클래스 필드 / private", path: "version/es2022/class-fields" },
          { id: "top-level-await", label: "top-level await", path: "version/es2022/top-level-await" },
          { id: "array-at", label: "Array.at / String.at", path: "version/es2022/array-at" },
        ],
      },
      {
        id: "es2021",
        label: "ES2021",
        children: [
          { id: "logical-assignment", label: "논리 할당 연산자", path: "version/es2021/logical-assignment" },
          { id: "string-replaceall", label: "String.replaceAll", path: "version/es2021/string-replaceall" },
        ],
      },
      {
        id: "es2020",
        label: "ES2020",
        children: [
          { id: "optional-chaining", label: "옵셔널 체이닝 / 널 병합", path: "version/es2020/optional-chaining" },
          { id: "bigint", label: "BigInt", path: "version/es2020/bigint" },
          { id: "promise-allsettled", label: "Promise.allSettled", path: "version/es2020/promise-allsettled" },
        ],
      },
      {
        id: "es2019",
        label: "ES2019",
        children: [
          { id: "array-flat", label: "Array.flat / flatMap", path: "version/es2019/array-flat" },
          { id: "object-fromentries", label: "Object.fromEntries", path: "version/es2019/object-fromentries" },
        ],
      },
      {
        id: "es2018",
        label: "ES2018",
        children: [
          { id: "object-spread-rest", label: "객체 스프레드 / 레스트", path: "version/es2018/object-spread-rest" },
          { id: "async-iteration", label: "비동기 반복 (for await...of)", path: "version/es2018/async-iteration" },
        ],
      },
      {
        id: "es2017",
        label: "ES2017",
        children: [
          { id: "async-await", label: "async / await", path: "version/es2017/async-await" },
          { id: "object-entries-values", label: "Object.entries / values", path: "version/es2017/object-entries-values" },
        ],
      },
      {
        id: "es2016",
        label: "ES2016",
        children: [
          { id: "array-includes", label: "Array.includes", path: "version/es2016/array-includes" },
          { id: "exponent-operator", label: "지수 연산자 **", path: "version/es2016/exponent-operator" },
        ],
      },
      {
        id: "es2015",
        label: "ES2015 (ES6)",
        children: [
          { id: "let-const", label: "let / const & 블록 스코프", path: "version/es2015/let-const" },
          { id: "arrow-class", label: "화살표 함수 & 클래스", path: "version/es2015/arrow-class" },
          { id: "template-destructuring", label: "템플릿 리터럴 & 구조분해", path: "version/es2015/template-destructuring" },
          { id: "promise", label: "Promise", path: "version/es2015/promise" },
          { id: "modules", label: "모듈 (import / export)", path: "version/es2015/modules" },
        ],
      },
    ],
  },
  { id: "crud-demo", label: "CRUD Demo", path: "crud-demo" },
];
