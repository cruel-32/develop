import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
DELETE FROM table_name
WHERE condition;
`;

const TRUNCATE_COMPARE = `
-- DELETE: WHERE로 일부만 지울 수 있고, 트리거가 각 행마다 발동하며, 되돌리기(ROLLBACK) 가능
DELETE FROM employees WHERE department_id = 3;

-- TRUNCATE: 테이블 전체를 통째로 비운다. DELETE보다 훨씬 빠르지만
-- 조건을 걸 수 없고(항상 전체), 기본적으로 행 단위 트리거는 발동하지 않는다
TRUNCATE TABLE employees;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 부서가 배정되지 않은 직원(department_id IS NULL) 삭제
DELETE FROM employees
WHERE department_id IS NULL
RETURNING name;

SELECT name, department_id FROM employees ORDER BY name;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>DELETE <span class="badge">기초</span></h1>
      <p>
        <code>DELETE FROM table WHERE condition</code>으로 조건에 맞는 행을 지웁니다.
        <code>UPDATE</code>와 마찬가지로 <strong><code>WHERE</code>를 빠뜨리면 테이블의
        모든 행이 삭제</strong>됩니다 — 실무에서는 실행 전에 같은 조건으로
        <code>SELECT</code>를 먼저 돌려 "무엇이 지워질지" 확인하는 습관을 들이는 게
        안전합니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="returning">지워지기 전 값 확인하기</h2>
      <p>
        <code>DELETE</code>에도 <code>RETURNING</code>을 붙일 수 있어서, 삭제된 행의
        내용을 별도 백업 쿼리 없이 그 자리에서 확인할 수 있습니다.
      </p>

      <h2 id="truncate">DELETE vs TRUNCATE</h2>
      <p>
        테이블을 통째로 비울 목적이라면 <code>TRUNCATE</code>가 더 빠릅니다. 다만
        <code>WHERE</code>절을 쓸 수 없어 항상 전체를 지우고, 대상 테이블을 참조하는
        외래 키가 있으면(<code>employees.department_id → departments.id</code>처럼)
        기본적으로 거부되거나 <code>CASCADE</code> 옵션이 필요합니다.
      </p>
      ${codeBlock(TRUNCATE_COMPARE, "DELETE와 TRUNCATE 비교")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        조건을 <code>WHERE salary < 60000</code>처럼 바꿔서 저연봉 직원을 지워보거나,
        <code>RETURNING *</code>으로 바꿔서 삭제된 행의 모든 컬럼을 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "DELETE",
    sql: PLAYGROUND,
  });
};
