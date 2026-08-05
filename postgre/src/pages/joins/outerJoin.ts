import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
-- 왼쪽 테이블의 모든 행을 유지하고, 짝이 없으면 오른쪽 컬럼은 NULL
SELECT ... FROM a LEFT JOIN b ON ...;

-- 오른쪽 테이블의 모든 행을 유지 (LEFT JOIN에서 a/b 순서만 뒤집은 것과 동일)
SELECT ... FROM a RIGHT JOIN b ON ...;

-- 양쪽 모두, 짝이 없는 행까지 전부 유지
SELECT ... FROM a FULL OUTER JOIN b ON ...;
`;

const LEFT_JOIN_EXAMPLE = `
-- 부서가 없는 직원(Dana Yoon)도 department 컬럼이 NULL인 채로 결과에 남는다
SELECT e.name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;
`;

const RIGHT_JOIN_EXAMPLE = `
-- 소속 직원이 0명인 부서(People Ops)도 employee 컬럼이 NULL인 채로 결과에 남는다
SELECT d.name AS department, e.name AS employee
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 모든 부서를 기준으로, 소속 직원이 없으면 NULL로 표시 (RIGHT JOIN)
-- + 부서별 직원 수까지 함께 확인
SELECT
  d.name AS department,
  e.name AS employee,
  COUNT(e.id) OVER (PARTITION BY d.id) AS headcount
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id
ORDER BY d.name, e.name;

-- FULL OUTER JOIN: 부서 없는 직원 + 직원 없는 부서를 한 번에
SELECT e.name AS employee, d.name AS department
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.id
ORDER BY department, employee;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>LEFT / RIGHT / FULL OUTER JOIN <span class="badge">JOIN</span></h1>
      <p>
        <code>OUTER JOIN</code>은 <code>INNER JOIN</code>과 달리 "짝을 찾지 못한 행"도
        결과에 남기고, 짝이 없는 쪽의 컬럼은 <code>NULL</code>로 채웁니다. 어느 쪽을
        기준으로 전부 살릴지에 따라 세 종류로 나뉩니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="left">LEFT (OUTER) JOIN</h2>
      <p>
        <code>FROM</code>절에 먼저 쓴(왼쪽) 테이블의 모든 행을 무조건 유지합니다.
        샘플 데이터에서 <code>employees</code>를 왼쪽에 두면, 부서가 배정되지 않은
        Dana Yoon도 <code>department</code> 컬럼이 <code>NULL</code>인 채로 결과에
        남습니다.
      </p>
      ${codeBlock(LEFT_JOIN_EXAMPLE, "LEFT JOIN — 부서 없는 직원도 포함")}

      <h2 id="right">RIGHT (OUTER) JOIN</h2>
      <p>
        <code>LEFT JOIN</code>의 반대로, 오른쪽 테이블의 모든 행을 유지합니다. 사실
        <code>a RIGHT JOIN b</code>는 <code>b LEFT JOIN a</code>와 완전히 같은 결과를
        내므로 실무에서는 대부분 <code>LEFT JOIN</code>으로 통일해서 쓰고
        <code>RIGHT JOIN</code>은 잘 쓰지 않지만, 문법은 알아두는 게 좋습니다. 아래는
        소속 직원이 0명인 People Ops 부서도 <code>employee</code>가
        <code>NULL</code>인 채로 남는 예시입니다.
      </p>
      ${codeBlock(RIGHT_JOIN_EXAMPLE, "RIGHT JOIN — 직원 없는 부서도 포함")}

      <h2 id="full">FULL OUTER JOIN</h2>
      <p>
        양쪽에서 짝을 찾지 못한 행을 전부 살립니다. "부서가 없는 직원"과 "직원이 없는
        부서"를 한 번에 찾아야 할 때(데이터 정합성 점검 등)에 유용합니다. MySQL은
        오랫동안 <code>FULL OUTER JOIN</code>을 지원하지 않았지만 Postgres는 처음부터
        지원합니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        첫 번째 쿼리의 <code>COUNT(e.id) OVER (PARTITION BY d.id)</code>는 다음 장
        "윈도우 함수"에서 자세히 다루는 기능을 미리 살짝 써본 것입니다 — 결과 테이블에서
        같은 부서의 모든 행에 그 부서의 직원 수가 똑같이 찍히는 걸 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "OUTER JOIN",
    sql: PLAYGROUND,
  });
};
