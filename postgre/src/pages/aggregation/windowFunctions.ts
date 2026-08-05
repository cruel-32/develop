import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
window_function() OVER (
  PARTITION BY grouping_column   -- 생략하면 테이블 전체가 하나의 윈도우
  ORDER BY sort_column           -- RANK류/누적합에는 필수
)
`;

const GROUP_BY_VS_WINDOW = `
-- GROUP BY: 그룹당 한 행으로 "요약"된다 (원본 행은 사라진다)
SELECT department_id, AVG(salary) FROM employees GROUP BY department_id;

-- 윈도우 함수: 원본 행 개수를 그대로 유지하면서, 각 행에 "그 행이 속한 그룹의 집계값"을 덧붙인다
SELECT name, department_id, salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg
FROM employees;
`;

const RANKING_FUNCTIONS = `
-- ROW_NUMBER: 동점이어도 무조건 순서대로 1,2,3,4...
-- RANK: 동점이면 같은 순위, 다음 순위는 동점 인원수만큼 건너뜀 (1,2,2,4)
-- DENSE_RANK: 동점이면 같은 순위, 다음 순위는 건너뛰지 않음 (1,2,2,3)
SELECT name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
       RANK()       OVER (ORDER BY salary DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 부서별 급여 순위 + 부서 평균과의 차이
SELECT
  d.name AS department,
  e.name AS employee,
  e.salary,
  RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS dept_rank,
  ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY e.department_id), 2) AS diff_from_dept_avg
FROM employees e
JOIN departments d ON e.department_id = d.id
ORDER BY department, dept_rank;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>윈도우 함수 <span class="badge">함수</span></h1>
      <p>
        윈도우 함수는 <code>GROUP BY</code>처럼 "그룹"을 나누지만, 여러 행을 한 행으로
        뭉개는 대신 <strong>원본 행 개수를 그대로 유지</strong>하면서 각 행에 그 행이
        속한 그룹의 계산값을 함께 붙여줍니다. <code>OVER (...)</code>가 이 함수를
        윈도우 함수로 만드는 신호이고, 그 안의 <code>PARTITION BY</code>가
        <code>GROUP BY</code>와 같은 역할을 합니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}
      ${codeBlock(GROUP_BY_VS_WINDOW, "GROUP BY vs 윈도우 함수")}

      <h2 id="ranking">순위 함수: ROW_NUMBER / RANK / DENSE_RANK</h2>
      <p>
        세 함수 모두 <code>ORDER BY</code>가 정한 순서대로 번호를 매기지만, 동점
        처리 방식이 다릅니다. 예를 들어 급여가 같은 두 사람이 공동 2등이라면,
        <code>RANK</code>는 다음 사람을 4등으로 건너뛰고, <code>DENSE_RANK</code>는
        건너뛰지 않고 3등을 매깁니다.
      </p>
      ${codeBlock(RANKING_FUNCTIONS, "ROW_NUMBER vs RANK vs DENSE_RANK")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>RANK()</code>를 <code>DENSE_RANK()</code>나 <code>ROW_NUMBER()</code>로
        바꿔보고 결과가 어떻게 달라지는지 비교해보세요. <code>WHERE dept_rank = 1</code>
        조건은 <code>WHERE</code>절에서 바로 쓸 수 없다는 점도 기억하세요 — 윈도우
        함수는 <code>WHERE</code>보다 나중에 평가되므로, 순위로 필터링하려면 이 쿼리
        전체를 서브쿼리로 감싸고 바깥에서 걸러야 합니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "윈도우 함수",
    sql: PLAYGROUND,
  });
};
