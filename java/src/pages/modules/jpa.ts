import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const COMPARISON = `
JPA        객체(Entity)를 중심으로 생각한다. SQL은 JPA/하이버네이트가 대신 만들어준다.
QueryDSL   JPA 위에서, 복잡한 동적 쿼리를 문자열이 아니라 자바 코드로 타입-안전하게 짠다.
MyBatis    SQL을 직접 작성하고, 결과를 객체에 매핑만 맡긴다. "SQL 매퍼"에 가깝다 (ORM이 아니다).
`;

const ENTITY = `
@Entity
@Table(name = "employees")
public class Employee {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  @ManyToOne(fetch = FetchType.LAZY) // 꼭 필요할 때만 department를 조회한다(N+1 주의)
  @JoinColumn(name = "department_id")
  private Department department;

  private BigDecimal salary;

  protected Employee() {
    // JPA는 프록시 생성을 위해 매개변수 없는 생성자가 필요하다 (외부에서 막으려면 protected)
  }

  public Employee(String name, Department department, BigDecimal salary) {
    this.name = name;
    this.department = department;
    this.salary = salary;
  }

  // getter는 생략 - 실무에서는 Lombok으로 대체하는 경우가 많다 (Lombok 페이지 참고)
}
`;

const REPOSITORY = `
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

  // 메서드 이름만으로 쿼리가 자동 생성된다 (Derived Query Method)
  List<Employee> findByDepartmentIdAndSalaryGreaterThan(Long departmentId, BigDecimal minSalary);

  // 이름만으로 표현하기 복잡한 쿼리는 JPQL을 직접 쓸 수 있다
  @Query("SELECT e FROM Employee e WHERE e.department.name = :deptName ORDER BY e.salary DESC")
  List<Employee> findTopEarnersByDepartment(@Param("deptName") String deptName);
}

// 사용하는 쪽에서는 인터페이스만 있으면 된다 - 구현체는 Spring Data JPA가 런타임에 만들어준다
@Service
public class EmployeeService {
  private final EmployeeRepository employeeRepository;

  public EmployeeService(EmployeeRepository employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  public List<Employee> findWellPaid(Long departmentId) {
    return employeeRepository.findByDepartmentIdAndSalaryGreaterThan(
        departmentId, new BigDecimal("70000"));
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Spring Data JPA <span class="badge">모듈</span></h1>
      ${staticExampleNote()}
      <p>
        JPA(Java Persistence API)는 자바 객체와 관계형 DB 테이블을 매핑하는 표준
        스펙이고, Hibernate가 그 구현체입니다. Spring Data JPA는 그 위에
        <code>JpaRepository</code> 인터페이스 하나만 정의하면 기본 CRUD와 페이징을
        자동으로 구현해주는 편의 계층입니다. postgre 학습실에서 다룬 SQL 개념(JOIN,
        WHERE)이 여기서는 애노테이션과 메서드 이름으로 표현됩니다.
      </p>
      ${codeBlock(COMPARISON, "JPA / QueryDSL / MyBatis, 뭐가 다를까")}

      <h2 id="entity">@Entity로 테이블 매핑하기</h2>
      ${codeBlock(ENTITY, "Employee 엔티티")}
      <p>
        <code>@ManyToOne</code>은 postgre 학습실의 <code>employees.department_id</code>
        외래 키와 정확히 같은 관계를 표현합니다. <code>fetch = FetchType.LAZY</code>를
        지정하지 않으면 <code>Employee</code>를 조회할 때마다 연관된
        <code>Department</code>까지 매번 즉시(EAGER) 함께 조회해서, 필요 없는 조인이
        누적되는 성능 문제(N+1 문제의 원인 중 하나)로 이어지기 쉽습니다.
      </p>

      <h2 id="repository">JpaRepository와 쿼리 메서드</h2>
      ${codeBlock(REPOSITORY, "EmployeeRepository")}
      <p class="hint">
        <code>findByDepartmentIdAndSalaryGreaterThan</code>처럼 메서드 이름 자체가
        쿼리 조건이 됩니다 — Spring Data JPA가 메서드 이름을 파싱해 실행 시점에 알맞은
        SQL을 만들어줍니다. 조건이 복잡해지면 이름이 한없이 길어지므로, 그럴 땐
        <code>@Query</code>(JPQL)나 다음 페이지의 QueryDSL로 넘어가는 게 낫습니다.
      </p>
    </article>
  `;
};
