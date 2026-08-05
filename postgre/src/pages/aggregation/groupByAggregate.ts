import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
SELECT group_column, AGG_FUNC(other_column)
FROM table_name
WHERE row_filter
GROUP BY group_column
HAVING group_filter
ORDER BY ...;
`;

const WHERE_VS_HAVING = `
-- WHERE: 그룹으로 묶기 "전" 개별 행을 거른다 (여기서는 집계 함수를 못 쓴다)
SELECT department_id, AVG(salary)
FROM employees
WHERE salary > 0            -- 행 단위 조건
GROUP BY department_id
-- HAVING: 그룹으로 묶은 "후" 집계 결과를 거른다 (여기서만 집계 함수를 조건에 쓸 수 있다)
HAVING AVG(salary) > 65000;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 부서별 인원수 / 평균·최고·최저 급여, 평균 급여가 6.5만을 넘는 부서만
SELECT
  d.name AS department,
  COUNT(e.id) AS headcount,
  ROUND(AVG(e.salary), 2) AS avg_salary,
  MAX(e.salary) AS max_salary,
  MIN(e.salary) AS min_salary
FROM employees e
JOIN departments d ON e.department_id = d.id
GROUP BY d.name
HAVING AVG(e.salary) > 65000
ORDER BY avg_salary DESC;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>GROUP BY · 집계 함수 · HAVING <span class="badge">집계</span></h1>
      <p>
        <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MAX</code>,
        <code>MIN</code> 같은 집계 함수는 여러 행을 하나의 값으로 요약합니다.
        <code>GROUP BY</code>와 함께 쓰면 "전체를 하나로" 대신 "그룹마다 하나씩"
        요약할 수 있습니다. <code>SELECT</code> 목록에는 <code>GROUP BY</code>에 쓴
        컬럼과 집계 함수만 올 수 있다는 규칙을 기억하세요 — 그룹 안에서 값이
        여러 개일 수 있는 컬럼을 그냥 나열하면 오류가 납니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="where-vs-having">WHERE와 HAVING의 차이</h2>
      <p>
        Postgres는 <code>FROM → WHERE → GROUP BY → HAVING → SELECT</code> 순서로
        평가합니다. <code>WHERE</code>는 그룹으로 묶이기 전 개별 행을 거르므로 아직
        집계값이 존재하지 않아 <code>AVG(salary)</code> 같은 조건을 쓸 수 없고,
        <code>HAVING</code>은 그룹으로 묶인 뒤의 집계 결과를 거르므로 반대로 집계
        함수 조건만 여기 씁니다.
      </p>
      ${codeBlock(WHERE_VS_HAVING, "WHERE(행 필터) vs HAVING(그룹 필터)")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>HAVING AVG(e.salary) > 65000</code>을 <code>HAVING COUNT(e.id) >= 2</code>로
        바꿔서 "2명 이상인 부서만" 조건으로 바꿔보세요. People Ops처럼 직원이 0명인
        부서는 애초에 <code>INNER JOIN</code> 단계에서 사라진다는 점도 확인해보세요
        (0으로 나누기를 피하려면 <code>LEFT JOIN</code> + <code>COALESCE</code>가
        필요합니다).
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "GROUP BY",
    sql: PLAYGROUND,
  });
};
