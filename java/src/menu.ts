/**
 * 사이드바 메뉴 트리 (다른 학습실의 menu.ts와 동일한 설계).
 *
 * 대메뉴 안에 중메뉴 -> 소메뉴 형태로 무한히 깊어질 수 있다.
 * `children`이 있으면 그룹(펼침/접힘)으로, `path`가 있으면 실제 페이지로 렌더링된다.
 *
 * postgre와 마찬가지로 버전별이 아니라 "기초 문법 -> OOP -> 컬렉션/제네릭 ->
 * 함수형/스트림 -> 예외 처리"로 이어지는 학습 순서를 주제별 그룹으로 묶는다.
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
      { id: "variables-types", label: "변수 · 타입", path: "basics/variables-types" },
      { id: "control-flow", label: "제어문 (if · for · switch)", path: "basics/control-flow" },
      { id: "arrays", label: "배열", path: "basics/arrays" },
    ],
  },
  {
    id: "oop",
    label: "객체지향 (OOP)",
    children: [
      { id: "classes-constructors", label: "클래스 · 생성자", path: "oop/classes-constructors" },
      {
        id: "inheritance-polymorphism",
        label: "상속과 다형성",
        path: "oop/inheritance-polymorphism",
      },
      { id: "interfaces-abstract", label: "인터페이스 · 추상 클래스", path: "oop/interfaces-abstract" },
    ],
  },
  {
    id: "collections",
    label: "컬렉션 & 제네릭",
    children: [
      { id: "collections-basics", label: "List · Map · Set", path: "collections/collections-basics" },
      { id: "generics", label: "제네릭", path: "collections/generics" },
    ],
  },
  {
    id: "functional",
    label: "함수형 & 스트림",
    children: [
      { id: "lambda", label: "람다 표현식", path: "functional/lambda" },
      { id: "stream-api", label: "Stream API", path: "functional/stream-api" },
    ],
  },
  {
    id: "exceptions",
    label: "예외 처리",
    children: [
      { id: "try-catch-finally", label: "try · catch · finally", path: "exceptions/try-catch-finally" },
      { id: "custom-exceptions", label: "커스텀 예외", path: "exceptions/custom-exceptions" },
    ],
  },
  {
    id: "spring",
    label: "Spring Framework",
    children: [
      { id: "spring-core", label: "Spring 핵심 (IoC · DI)", path: "spring/core" },
      { id: "spring-rest-api", label: "Spring Boot & REST API", path: "spring/rest-api" },
      { id: "spring-security", label: "Spring Security", path: "spring/security" },
    ],
  },
  {
    id: "modules",
    label: "자주 쓰는 외부 모듈",
    children: [
      { id: "jpa", label: "Spring Data JPA", path: "modules/jpa" },
      { id: "querydsl", label: "QueryDSL", path: "modules/querydsl" },
      { id: "lombok", label: "Lombok", path: "modules/lombok" },
      { id: "mybatis", label: "MyBatis", path: "modules/mybatis" },
    ],
  },
];
