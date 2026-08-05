import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const Q_TYPE_NOTE = `
// @Entity를 붙인 Employee 클래스가 있으면, QueryDSL의 어노테이션 프로세서가
// 빌드 시점에 자동으로 QEmployee라는 "Q타입" 클래스를 생성해준다.
// 컬럼 이름을 문자열("salary")이 아니라 employee.salary처럼 자바 코드로 참조하므로,
// 오타를 내면 "실행 중"이 아니라 "컴파일 시점"에 바로 잡힌다.
QEmployee employee = QEmployee.employee;
`;

const QUERY_EXAMPLE = `
@Repository
public class EmployeeQueryRepository {

  private final JPAQueryFactory queryFactory;

  public EmployeeQueryRepository(EntityManager em) {
    this.queryFactory = new JPAQueryFactory(em);
  }

  public List<Employee> findHighEarners(String departmentName, BigDecimal minSalary) {
    QEmployee employee = QEmployee.employee;
    QDepartment department = QDepartment.department;

    return queryFactory
        .selectFrom(employee)
        .join(employee.department, department)
        .where(
            department.name.eq(departmentName),
            employee.salary.goe(minSalary)) // goe = ">="
        .orderBy(employee.salary.desc())
        .fetch();
  }
}
`;

const DYNAMIC_CONDITION = `
// where()에 넘긴 조건들은 콤마로 나열하면 자동으로 AND로 묶인다.
// 조건이 null이면 QueryDSL이 그 조건을 통째로 무시하므로, "값이 있을 때만 필터링"하는
// 동적 검색 조건을 삼항 연산자만으로 깔끔하게 표현할 수 있다.
public List<Employee> search(String name, Long departmentId) {
  QEmployee employee = QEmployee.employee;

  return queryFactory
      .selectFrom(employee)
      .where(
          name != null ? employee.name.containsIgnoreCase(name) : null,
          departmentId != null ? employee.department.id.eq(departmentId) : null)
      .fetch();
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>QueryDSL <span class="badge">모듈</span></h1>
      ${staticExampleNote()}
      <p>
        JPA의 메서드 이름 쿼리(<code>findByXxx</code>)나 문자열 JPQL은 조건이 여러 개
        조합되는 "동적 검색" 화면(예: 이름은 선택 입력, 부서는 선택 입력...)을 짜기
        시작하면 금세 지저분해집니다. QueryDSL은 이런 동적 쿼리를 <strong>자바
        코드 그 자체</strong>로 타입-안전하게 조립하게 해줍니다.
      </p>

      <h2 id="q-type">Q타입 — 자동 생성되는 쿼리용 클래스</h2>
      ${codeBlock(Q_TYPE_NOTE, "QEmployee")}

      <h2 id="query">JPAQueryFactory로 쿼리 작성하기</h2>
      ${codeBlock(QUERY_EXAMPLE, "join + where + orderBy")}
      <p>
        postgre 학습실의 JOIN 페이지에서 SQL로 짰던
        <code>INNER JOIN ... WHERE ... ORDER BY ...</code>가 여기서는 메서드 체이닝으로
        그대로 대응됩니다 — 단, 컬럼/테이블 이름을 문자열로 오타 낼 여지가 없다는 게
        SQL 직접 작성과의 가장 큰 차이입니다.
      </p>

      <h2 id="dynamic-condition">동적 조건 조립</h2>
      ${codeBlock(DYNAMIC_CONDITION, "null을 활용한 조건부 필터")}
      <p class="hint">
        <code>where()</code>에 <code>null</code>을 넘기면 QueryDSL이 그 조건을
        무시한다는 점을 이용하면, "검색어가 있을 때만" 같은 조건 분기를
        <code>if</code>로 SQL을 문자열 조립하지 않고도 표현할 수 있습니다.
      </p>
    </article>
  `;
};
