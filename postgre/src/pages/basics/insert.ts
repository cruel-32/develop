import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);

-- 여러 행을 한 번에
INSERT INTO table_name (column1, column2)
VALUES
  (v1, v2),
  (v3, v4);
`;

const RETURNING_EXAMPLE = `
-- SERIAL(자동 증가) 컬럼처럼 DB가 채워주는 값을 별도 SELECT 없이 바로 돌려받는다
INSERT INTO departments (name, budget)
VALUES ('Design', 120000)
RETURNING id, name;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 신규 부서 하나와, 그 부서에 배정될 직원 두 명을 한 번에 등록
INSERT INTO departments (name, budget)
VALUES ('Design', 120000)
RETURNING id, name;

INSERT INTO employees (name, department_id, salary, hire_date, manager_id)
VALUES
  ('Mina Seo', 5, 68000, '2024-01-15', NULL),
  ('Joon Baek', 5, 61000, '2024-03-02', NULL)
RETURNING id, name, department_id;

SELECT * FROM employees WHERE department_id = 5;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>INSERT <span class="badge">기초</span></h1>
      <p>
        <code>INSERT INTO table (columns...) VALUES (...)</code>로 새 행을 추가합니다.
        컬럼 목록을 생략하면 테이블에 정의된 모든 컬럼 순서대로 값을 채워야 하는데,
        나중에 컬럼 순서가 바뀌면 조용히 잘못된 값이 들어갈 수 있어 실무에서는
        컬럼 이름을 명시하는 편이 안전합니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="returning">RETURNING — Postgres의 편의 기능</h2>
      <p>
        MySQL 등 다른 DB에서는 <code>INSERT</code> 직후 자동 생성된 id를 얻으려면
        별도의 "마지막에 삽입된 id" 조회가 필요하지만, Postgres는
        <code>RETURNING</code>절로 방금 삽입한 행의 컬럼 값을 그 자리에서 바로 돌려받을
        수 있습니다. <code>SERIAL</code>(자동 증가) 컬럼의 실제 값을 확인할 때 특히
        유용합니다.
      </p>
      ${codeBlock(RETURNING_EXAMPLE, "RETURNING으로 생성된 id 바로 받기")}

      <h2 id="multi-row">여러 행을 한 번에 삽입하기</h2>
      <p>
        <code>VALUES</code> 뒤에 <code>(...), (...), ...</code>로 여러 튜플을 나열하면
        <code>INSERT</code> 문 하나로 여러 행을 넣을 수 있습니다. 행마다 개별
        <code>INSERT</code>를 실행하는 것보다 네트워크 왕복이 줄어 훨씬 빠릅니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        새 부서의 <code>id</code>가 5로 나오는 건 앞서 홈 페이지 스키마에서
        <code>departments</code>에 4개 행을 이미 넣었기 때문입니다(<code>SERIAL</code>은
        삭제된 행이 있어도 되돌아가지 않고 계속 증가합니다). <code>VALUES</code>에
        직원을 한 명 더 추가해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "INSERT",
    sql: PLAYGROUND,
  });
};
