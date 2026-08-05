import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
SELECT ...
FROM table_a
INNER JOIN table_b ON table_a.fk = table_b.pk;

-- INNER JOIN은 JOIN이라고만 써도 동일하다
SELECT ... FROM table_a JOIN table_b ON ...;
`;

const MULTI_JOIN = `
-- 세 테이블 이상도 계속 JOIN을 이어 붙이면 된다
SELECT e.name, d.name AS department, m.name AS manager
FROM employees e
JOIN departments d ON e.department_id = d.id
LEFT JOIN employees m ON e.manager_id = m.id;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 부서가 배정된 직원만, 부서 이름과 함께 조회
SELECT e.name AS employee, d.name AS department, e.salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
ORDER BY d.name, e.salary DESC;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>INNER JOIN <span class="badge">JOIN</span></h1>
      <p>
        <code>INNER JOIN</code>은 두 테이블을 <code>ON</code> 조건으로 이어 붙이되,
        <strong>양쪽 테이블 모두에 조건을 만족하는 짝이 있는 행만</strong> 남깁니다.
        <code>employees.department_id</code>가 <code>NULL</code>인 Dana Yoon처럼 짝을
        찾을 수 없는 행은 결과에서 통째로 빠집니다 — "부서가 없다"는 사실 자체를 보고
        싶다면 다음 페이지의 <code>OUTER JOIN</code>이 필요합니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}
      <p>
        테이블 이름이 길어지면 <code>e</code>, <code>d</code> 같은 별칭(alias)을 붙여
        <code>ON</code>절과 <code>SELECT</code> 목록을 짧게 쓰는 게 관례입니다. 양쪽
        테이블에 같은 이름의 컬럼(예: 둘 다 <code>name</code>)이 있으면 별칭 없이는
        어느 테이블의 컬럼인지 모호해져 오류가 납니다.
      </p>

      <h2 id="multi-join">테이블 세 개 이상 이어 붙이기</h2>
      <p>
        <code>JOIN</code>은 필요한 만큼 계속 이어 쓸 수 있습니다. 아래 예시는
        <code>employees</code>를 <code>departments</code>와 한 번, 자기 자신과(관리자
        찾기) 또 한 번 조인합니다 — 관리자가 없는 최상위 직원(Ada Kim, Youngmi Choi,
        Sunny Oh)도 놓치지 않기 위해 두 번째 조인은 <code>LEFT JOIN</code>을 씁니다.
      </p>
      ${codeBlock(MULTI_JOIN, "3-way JOIN 예시")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>ORDER BY</code>를 <code>e.salary DESC</code> 하나만 남기고 부서별 정렬을
        지워보거나, <code>SELECT</code> 목록에 <code>d.budget</code>을 추가해 부서
        예산까지 함께 조회해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "INNER JOIN",
    sql: PLAYGROUND,
  });
};
