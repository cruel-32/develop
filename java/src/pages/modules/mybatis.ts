import type { PageRender } from "../../router";
import { codeBlock, staticExampleNote } from "../../pageHelpers";

const ANNOTATION_MAPPER = `
@Mapper // 이 인터페이스의 구현체를 MyBatis-Spring이 런타임에 자동으로 만들어 빈으로 등록한다
public interface EmployeeMapper {

  @Select("SELECT * FROM employees WHERE department_id = #{departmentId}")
  List<Employee> findByDepartmentId(@Param("departmentId") Long departmentId);

  @Insert("INSERT INTO employees (name, department_id, salary) " +
          "VALUES (#{name}, #{departmentId}, #{salary})")
  @Options(useGeneratedKeys = true, keyProperty = "id") // INSERT 후 생성된 id를 employee.id에 채워준다
  void insert(Employee employee);
}
`;

const XML_MAPPER = `
<!-- resources/mapper/EmployeeMapper.xml -->
<mapper namespace="com.example.mapper.EmployeeMapper">
  <select id="search" resultType="Employee">
    SELECT * FROM employees
    <where>
      <if test="departmentId != null">
        AND department_id = #{departmentId}
      </if>
      <if test="minSalary != null">
        AND salary &gt;= #{minSalary}
      </if>
    </where>
    ORDER BY salary DESC
  </select>
</mapper>
`;

const PARAM_BINDING = `
-- #{...} : PreparedStatement의 ? 바인딩 파라미터로 치환된다 (SQL 인젝션에 안전)
SELECT * FROM employees WHERE name = #{name}
-- 실행되는 실제 쿼리: SELECT * FROM employees WHERE name = ?

\${...} : 값을 SQL 문자열에 그대로 이어붙인다 (SQL 인젝션 위험 - 컬럼/테이블 이름 등
정말 필요한 경우가 아니면 쓰지 않는다)
ORDER BY \${sortColumn}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>MyBatis <span class="badge">모듈</span></h1>
      ${staticExampleNote()}
      <p>
        MyBatis는 JPA와 달리 <strong>ORM이 아니라 "SQL 매퍼"</strong>입니다 — SQL을
        MyBatis가 대신 만들어주지 않고, 개발자가 SQL을 직접 작성하면 MyBatis는 그
        결과를 자바 객체로 매핑해주는 역할만 합니다. 복잡한 조인/통계 쿼리를 세밀하게
        직접 튜닝해야 하는 팀에서 JPA 대신(또는 JPA와 함께) 자주 선택합니다.
      </p>

      <h2 id="annotation">애노테이션 방식</h2>
      ${codeBlock(ANNOTATION_MAPPER, "@Mapper 인터페이스")}
      <p>
        간단한 쿼리는 <code>@Select</code>/<code>@Insert</code>/<code>@Update</code>/
        <code>@Delete</code> 애노테이션에 SQL을 바로 적을 수 있습니다.
      </p>

      <h2 id="xml">XML 방식 — 동적 SQL</h2>
      <p>
        조건에 따라 <code>WHERE</code>절이 통째로 달라지는 검색 쿼리처럼 복잡해지면,
        자바 문자열보다 XML의 <code>&lt;if&gt;</code>/<code>&lt;where&gt;</code>/
        <code>&lt;foreach&gt;</code> 태그로 SQL을 조립하는 편이 훨씬 읽기 쉽습니다.
        <code>&lt;where&gt;</code>는 안의 <code>&lt;if&gt;</code>들이 하나도 참이 아니면
        <code>WHERE</code> 자체를 생략하고, 맨 앞의 불필요한 <code>AND</code>도
        자동으로 정리해줍니다.
      </p>
      ${codeBlock(XML_MAPPER, "동적 WHERE 조건")}

      <h2 id="param-binding">#{ } vs \${ }</h2>
      ${codeBlock(PARAM_BINDING, "파라미터 바인딩 방식의 차이")}
      <p class="hint">
        <code>#{...}</code>는 항상 우선적으로 고려하고, <code>\${...}</code>는
        정렬 컬럼명처럼 값이 아니라 SQL 구조 자체를 동적으로 바꿔야 하는 극히 제한된
        경우에만, 그것도 화이트리스트 검증을 거친 값에만 써야 합니다.
      </p>
    </article>
  `;
};
