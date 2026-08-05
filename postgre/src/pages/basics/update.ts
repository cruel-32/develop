import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
`;

const NO_WHERE_WARNING = `
-- WHERE를 빠뜨리면 "조건에 맞는 일부"가 아니라 테이블의 모든 행이 바뀐다
UPDATE employees SET salary = 50000;
-- ↑ employees 테이블 전체 직원의 급여가 5만으로 통일되어버린다
`;

const EXPRESSION_UPDATE = `
-- SET의 오른쪽에는 현재 값을 참조하는 표현식도 쓸 수 있다
UPDATE employees
SET salary = salary * 1.1
WHERE department_id = 1;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: Engineering(department_id=1) 부서 전체 10% 인상 + 변경된 행 확인
UPDATE employees
SET salary = ROUND(salary * 1.1, 2)
WHERE department_id = 1
RETURNING name, salary AS new_salary;

SELECT name, department_id, salary FROM employees ORDER BY department_id, name;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>UPDATE <span class="badge">기초</span></h1>
      <p>
        <code>UPDATE table SET col = value WHERE condition</code>으로 기존 행을
        수정합니다. <code>SET</code>은 한 번에 여러 컬럼을 콤마로 나열해 동시에 바꿀 수
        있고, 오른쪽 값 자리에는 상수뿐 아니라 그 행의 다른 컬럼을 참조하는 표현식도
        그대로 쓸 수 있습니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="where-danger">WHERE를 빠뜨리면 벌어지는 일</h2>
      <p class="hint">
        <code>UPDATE</code>에서 가장 흔한 사고입니다 — <code>WHERE</code>절이 없으면
        "조건에 맞는 행"이 아니라 <strong>테이블의 모든 행</strong>이 대상이 됩니다.
        아래 코드는 <em>실행하지 않는</em> 예시이니 직접 실습창에서는 시도하지 마세요
        (이 페이지의 인메모리 DB는 새로고침하면 되돌릴 수 있지만, 실제 운영 DB에서는
        되돌리기 어렵습니다).
      </p>
      ${codeBlock(NO_WHERE_WARNING, "위험한 예시 — 절대 이렇게 쓰지 않기")}

      <h2 id="expression">현재 값을 활용한 갱신</h2>
      <p>
        연봉 인상처럼 "기존 값에 비례해서" 바꿔야 할 때는 <code>SET salary = salary * 1.1</code>
        처럼 같은 컬럼을 오른쪽에서 참조하면 됩니다. <code>INSERT</code>와 마찬가지로
        <code>RETURNING</code>을 붙이면 바뀐 뒤의 값을 별도 <code>SELECT</code> 없이 바로
        확인할 수 있습니다.
      </p>
      ${codeBlock(EXPRESSION_UPDATE, "현재 값 기반 갱신")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>WHERE department_id = 1</code>을 <code>WHERE department_id = 2</code>로
        바꿔 Sales 부서만 인상해보거나, 아예 <code>WHERE</code>절을 지워서(주의!) 이
        인메모리 DB 안에서만 "전체 인상"이 어떻게 되는지 안전하게 관찰해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "UPDATE",
    sql: PLAYGROUND,
  });
};
