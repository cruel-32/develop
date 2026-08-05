import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
CREATE FUNCTION function_name(param1 TYPE, param2 TYPE)
RETURNS return_type AS $$
DECLARE
  local_var TYPE;
BEGIN
  -- 여기서부터는 절차형 코드(변수, IF, LOOP 등)를 SQL과 섞어 쓸 수 있다
  RETURN local_var;
END;
$$ LANGUAGE plpgsql;
`;

const DOLLAR_QUOTE_NOTE = `
-- $$ ... $$ 는 "달러 인용(dollar quoting)"이다. 함수 본문 안에 작은따옴표 문자열이
-- 아무리 많아도 이스케이프할 필요 없이 그대로 쓸 수 있어서 함수/프로시저 본문에는
-- 항상 이 방식을 쓴다.
CREATE FUNCTION greet(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN 'Hello, ' || name || '!';  -- 작은따옴표를 그냥 써도 함수 본문 구분과 안 겹친다
END;
$$ LANGUAGE plpgsql;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 함수 1: 부서 평균 급여 조회 (읽기 전용) — SELECT ... INTO로 결과를 변수에 담는다
CREATE FUNCTION department_avg_salary(dept_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  avg_salary NUMERIC;
BEGIN
  SELECT AVG(salary) INTO avg_salary
  FROM employees
  WHERE department_id = dept_id;

  RETURN COALESCE(ROUND(avg_salary, 2), 0);
END;
$$ LANGUAGE plpgsql;

-- 함수 2: 특정 직원 연봉 인상 (데이터를 직접 변경) — Postgres 함수는 부수효과를 가질 수 있다
CREATE FUNCTION give_raise(emp_id INTEGER, raise_pct NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  updated_salary NUMERIC;
BEGIN
  UPDATE employees
  SET salary = ROUND(salary * (1 + raise_pct / 100), 2)
  WHERE id = emp_id
  RETURNING salary INTO updated_salary;

  RETURN updated_salary;
END;
$$ LANGUAGE plpgsql;

-- 함수 호출은 일반 SELECT처럼 쓴다
SELECT department_avg_salary(1) AS engineering_avg;

SELECT give_raise(1, 10) AS ada_new_salary;
SELECT name, salary FROM employees WHERE id = 1;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>PL/pgSQL 사용자 정의 함수 <span class="badge">함수</span></h1>
      <p>
        <code>CREATE FUNCTION</code>으로 직접 정의하는 함수는 SQL만으로 표현하기
        번거로운 로직(조건 분기, 반복, 임시 변수)을 함수 안에 캡슐화합니다. 함수
        본문은 기본적으로 SQL이 아니라 <strong>PL/pgSQL</strong>이라는 절차형 언어로
        작성하는데, <code>DECLARE</code>로 변수를 선언하고 <code>BEGIN...END</code>
        블록 안에서 SQL과 제어문을 섞어 씁니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="dollar-quote">$$ ... $$ (달러 인용)</h2>
      <p>
        함수 본문은 사실 하나의 문자열 리터럴입니다. 그 안에 작은따옴표 문자열이 잔뜩
        들어가면 이스케이프가 지저분해지므로, Postgres는 <code>$$</code>(또는
        <code>$tag$</code>)로 본문 전체를 감싸는 "달러 인용" 문법을 제공합니다 — 함수
        본문에서는 거의 항상 이 방식을 씁니다.
      </p>
      ${codeBlock(DOLLAR_QUOTE_NOTE, "달러 인용 예시")}

      <h2 id="side-effects">함수도 데이터를 바꿀 수 있다</h2>
      <p>
        많은 DB에서 "함수(function)"는 값만 계산하는 순수 읽기 전용을 뜻하지만,
        Postgres의 <code>FUNCTION</code>은 본문 안에 <code>UPDATE</code>/
        <code>INSERT</code>/<code>DELETE</code>를 그대로 넣어 데이터를 바꿀 수도
        있습니다. 아래 <code>give_raise</code>는 <code>UPDATE ... RETURNING ... INTO</code>
        패턴으로, 급여를 올리는 동시에 바뀐 값을 그 자리에서 돌려줍니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>give_raise(1, 10)</code>의 두 번째 인자(인상률)를 바꿔보거나,
        <code>department_avg_salary(2)</code>처럼 다른 부서 id로 호출해보세요.
        부서가 없는 <code>dept_id</code>를 넣으면 <code>AVG</code>가
        <code>NULL</code>을 돌려주는데, <code>COALESCE</code> 덕분에 함수는
        <code>NULL</code> 대신 0을 반환합니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "PL/pgSQL",
    sql: PLAYGROUND,
  });
};
