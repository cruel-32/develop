import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const WITHOUT_LOMBOK = `
public class Employee {
  private Long id;
  private String name;
  private BigDecimal salary;

  public Employee() {}

  public Employee(Long id, String name, BigDecimal salary) {
    this.id = id;
    this.name = name;
    this.salary = salary;
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public BigDecimal getSalary() { return salary; }
  public void setSalary(BigDecimal salary) { this.salary = salary; }

  @Override
  public boolean equals(Object o) { /* id/name/salary 비교 코드 생략 */ return false; }
  @Override
  public int hashCode() { /* id/name/salary 기반 해시 코드 생략 */ return 0; }
  @Override
  public String toString() { return "Employee{id=" + id + ", name=" + name + "}"; }
}
`;

const WITH_LOMBOK = `
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class Employee {
  private Long id;
  private String name;
  private BigDecimal salary;
}
// 컴파일 시점에 어노테이션 프로세서가 위 코드와 똑같은 getter/setter/생성자/
// equals/hashCode/toString을 .class 파일에 그대로 만들어 넣는다 - 실행 성능 차이는 없다
`;

const BUILDER = `
@Builder
@Getter
public class Employee {
  private Long id;
  private String name;
  private BigDecimal salary;
}

Employee employee = Employee.builder()
    .name("Ada Kim")
    .salary(new BigDecimal("95000"))
    .build();
// 생성자 인자 순서를 외울 필요 없이, 필드 이름으로 하나씩 채워나갈 수 있다
`;

const SLF4J = `
@Slf4j // private static final Logger log = LoggerFactory.getLogger(OrderService.class); 를 대신 생성
@Service
public class OrderService {
  public void placeOrder(Order order) {
    log.info("주문 접수: id={}", order.getId());
  }
}
`;

const CAUTION = `
// 주의: JPA @Entity에 @Data(또는 @EqualsAndHashCode/@ToString)를 그대로 쓰면
// 위험할 수 있다 - 양방향 연관관계에서 서로의 toString()을 계속 호출하다
// StackOverflowError로 이어지는 사고가 실무에서 자주 보고된다.
@Entity
public class Employee {
  @ManyToOne
  private Department department; // Department도 List<Employee>를 갖고 있다면?
}
// -> 연관관계가 있는 필드는 @ToString.Exclude / @EqualsAndHashCode.Exclude로 빼는 게 안전하다
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Lombok <span class="badge">모듈</span></h1>
      ${staticExampleNote()}
      <p>
        Lombok은 getter/setter, 생성자, <code>equals</code>/<code>hashCode</code>/
        <code>toString</code>처럼 자바에서 반복적으로 손으로 써야 하는 코드(보일러플레이트)를
        어노테이션 하나로 대신 만들어주는 컴파일 시점 코드 생성 도구입니다.
      </p>

      <h2 id="before-after">Lombok 없이 vs Lombok으로</h2>
      ${codeBlock(WITHOUT_LOMBOK, "직접 작성한 보일러플레이트")}
      ${codeBlock(WITH_LOMBOK, "같은 클래스, Lombok으로")}
      <p>
        <code>@Data</code> 하나로 <code>@Getter</code> + <code>@Setter</code> +
        <code>@RequiredArgsConstructor</code> + <code>@EqualsAndHashCode</code> +
        <code>@ToString</code>을 한 번에 적용할 수도 있지만, 어떤 메서드가 실제로
        생기는지 한눈에 안 보인다는 단점이 있어 팀에 따라 개별 어노테이션을 명시적으로
        나열하는 걸 선호하기도 합니다.
      </p>

      <h2 id="builder">@Builder</h2>
      ${codeBlock(BUILDER, "빌더 패턴")}

      <h2 id="slf4j">@Slf4j</h2>
      ${codeBlock(SLF4J, "로거 선언 생략")}

      <h2 id="caution">주의: JPA 엔티티와 함께 쓸 때</h2>
      ${codeBlock(CAUTION, "양방향 연관관계 + toString/equals 무한 재귀 위험")}
    </article>
  `;
};
