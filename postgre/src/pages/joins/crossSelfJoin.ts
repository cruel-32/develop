import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const CROSS_SYNTAX = `
-- ON 조건이 없다 - 왼쪽 모든 행 x 오른쪽 모든 행, 모든 조합(카티션 곱)
SELECT a.*, b.*
FROM table_a a
CROSS JOIN table_b b;
`;

const SELF_SYNTAX = `
-- 같은 테이블을 서로 다른 별칭으로 두 번 등장시켜 자기 자신과 조인한다
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습 1: CROSS JOIN — 모든 직원 x 모든 부서의 조합 중 앞 10개만 미리보기
-- (employees 7행 x departments 4행 = 총 28개 조합이 나온다)
SELECT e.name AS employee, d.name AS possible_department
FROM employees e
CROSS JOIN departments d
ORDER BY e.name, d.name
LIMIT 10;

SELECT COUNT(*) AS total_combinations
FROM employees
CROSS JOIN departments;

-- 실습 2: SELF JOIN — 각 직원과 그 직원의 관리자를 나란히 조회
-- 관리자가 없는 직원(Ada Kim 등)도 보이도록 LEFT JOIN을 쓴다
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY manager NULLS FIRST, employee;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>CROSS JOIN · SELF JOIN <span class="badge">JOIN</span></h1>

      <h2 id="cross">CROSS JOIN — 카티션 곱</h2>
      <p>
        <code>CROSS JOIN</code>은 <code>ON</code> 조건이 없습니다 — 왼쪽 테이블의
        모든 행과 오른쪽 테이블의 모든 행을 <strong>가능한 모든 조합</strong>으로
        묶습니다. 그래서 결과 행 수는 항상 두 테이블 행 수의 곱입니다. 실수로
        <code>ON</code>절을 빠뜨린 <code>JOIN</code>도 사실상 <code>CROSS JOIN</code>과
        같은 결과(모든 조합)를 내므로, 의도치 않게 행이 폭발적으로 늘어난다면 이
        실수를 의심해봐야 합니다.
      </p>
      ${codeBlock(CROSS_SYNTAX, "기본 문법")}
      <p>
        실무에서는 "가능한 모든 날짜 x 모든 지점" 같은 조합표를 만들어 실제 데이터와
        <code>LEFT JOIN</code>해서 "데이터가 없는 조합"을 찾아내는 용도로 의도적으로
        씁니다.
      </p>

      <h2 id="self">SELF JOIN — 같은 테이블을 자기 자신과 조인</h2>
      <p>
        <code>employees.manager_id</code>는 같은 <code>employees</code> 테이블의
        <code>id</code>를 가리킵니다(관리자도 결국 직원이니까요). 이렇게 한 테이블
        안에 계층 관계가 있을 때, 같은 테이블을 서로 다른 별칭으로 두 번 등장시켜
        조인하면 "각 행과 그 행이 가리키는 다른 행"을 나란히 볼 수 있습니다.
      </p>
      ${codeBlock(SELF_SYNTAX, "SELF JOIN — 직원과 관리자 나란히 보기")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        두 번째 쿼리에서 <code>LEFT JOIN</code>을 <code>INNER JOIN</code>으로 바꿔보세요
        — 관리자가 없는 Ada Kim, Youngmi Choi, Sunny Oh가 결과에서 통째로 사라지는
        것을 확인할 수 있습니다(자기 자신을 조인할 때도 INNER/OUTER 규칙은 똑같이
        적용됩니다).
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "CROSS / SELF JOIN",
    sql: PLAYGROUND,
  });
};
