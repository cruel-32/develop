import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
SELECT column1, column2, ...
FROM table_name
WHERE condition
ORDER BY column [ASC | DESC]
LIMIT n OFFSET m;
`;

const WHERE_OPERATORS = `
-- 비교: =, <>, <, <=, >, >=
WHERE salary >= 70000

-- 여러 조건 조합
WHERE department_id = 1 AND salary > 80000
WHERE department_id = 1 OR department_id = 2

-- 목록에 포함되는지
WHERE department_id IN (1, 2)

-- 범위
WHERE salary BETWEEN 60000 AND 90000

-- 패턴 매칭 (%: 0개 이상의 문자, _: 정확히 1글자)
WHERE name LIKE 'A%'

-- NULL 비교는 =이 아니라 반드시 IS NULL / IS NOT NULL
WHERE department_id IS NULL
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 급여 7만 이상인 Engineering/Sales 직원을 급여 내림차순으로, 상위 3명만
SELECT name, department_id, salary, hire_date
FROM employees
WHERE department_id IN (1, 2)
  AND salary >= 70000
ORDER BY salary DESC
LIMIT 3;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>SELECT · WHERE · ORDER BY <span class="badge">기초</span></h1>
      <p>
        <code>SELECT</code>는 테이블에서 조건에 맞는 행을 조회하는 가장 기본적인 명령입니다.
        실행 순서는 코드에 쓰는 순서와 다르다는 점이 중요합니다 — Postgres는
        <code>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</code> 순으로
        평가합니다. 그래서 <code>WHERE</code>절에는 아직 계산되지 않은 <code>SELECT</code>의
        별칭(alias)을 쓸 수 없습니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="where">WHERE 조건</h2>
      <p>
        여러 조건은 <code>AND</code>/<code>OR</code>로 조합하고, <code>AND</code>가
        <code>OR</code>보다 먼저 묶이므로 섞어 쓸 때는 괄호로 우선순위를 명시하는 게
        안전합니다. NULL은 "값이 없음"을 뜻해서 <code>= NULL</code>은 항상 알 수 없음(unknown)
        으로 평가되어 어떤 행도 매치되지 않습니다 — 반드시 <code>IS NULL</code>을 써야 합니다.
      </p>
      ${codeBlock(WHERE_OPERATORS, "자주 쓰는 WHERE 패턴")}

      <h2 id="order-limit">ORDER BY · LIMIT · OFFSET</h2>
      <p>
        <code>ORDER BY</code> 없이는 행이 반환되는 순서가 보장되지 않습니다(Postgres가
        내부적으로 가장 빠르다고 판단한 순서로 줄 뿐입니다). <code>LIMIT n OFFSET m</code>은
        정렬된 결과에서 <code>m</code>개를 건너뛰고 <code>n</code>개만 가져오는, 페이지네이션의
        기본 도구입니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>LIMIT 3</code>을 지워서 전체 결과를 보거나, <code>WHERE</code>절에
        <code>name LIKE '%a%'</code> 같은 패턴 조건을 추가해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "SELECT",
    sql: PLAYGROUND,
  });
};
