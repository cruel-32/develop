import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
-- 1) 트리거가 호출할 함수: 반환 타입이 반드시 TRIGGER
CREATE FUNCTION trigger_function_name() RETURNS TRIGGER AS $$
BEGIN
  -- NEW: 삽입/수정 "이후" 값, OLD: 수정/삭제 "이전" 값
  RETURN NEW; -- (BEFORE 트리거는 RETURN NEW로 실제 저장될 값을 바꿀 수도 있다)
END;
$$ LANGUAGE plpgsql;

-- 2) 트리거 자체: 어떤 이벤트에, 어떤 함수를 실행할지 연결
CREATE TRIGGER trigger_name
AFTER UPDATE ON table_name
FOR EACH ROW
EXECUTE FUNCTION trigger_function_name();
`;

const OLD_NEW_NOTE = `
-- OLD / NEW 사용 가능 범위
-- INSERT 트리거: NEW만 있다 (아직 이전 값이 없다)
-- UPDATE 트리거: OLD(수정 전)와 NEW(수정 후) 둘 다 있다
-- DELETE 트리거: OLD만 있다 (더 이상 이후 값이 없다)

-- IS DISTINCT FROM은 NULL도 안전하게 비교한다 (둘 다 NULL이면 "다르지 않음")
IF NEW.salary IS DISTINCT FROM OLD.salary THEN
  -- 값이 실제로 바뀐 경우에만 실행
END IF;
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 감사 로그 테이블
CREATE TABLE salary_audit (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  old_salary NUMERIC(10, 2),
  new_salary NUMERIC(10, 2),
  changed_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 트리거 함수: 급여가 실제로 바뀐 UPDATE만 감사 로그에 기록
CREATE FUNCTION log_salary_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.salary IS DISTINCT FROM OLD.salary THEN
    INSERT INTO salary_audit (employee_id, old_salary, new_salary)
    VALUES (OLD.id, OLD.salary, NEW.salary);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- employees 테이블의 모든 UPDATE 직후 자동으로 실행되도록 연결
CREATE TRIGGER trg_salary_audit
AFTER UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION log_salary_change();

-- 트리거를 직접 호출하지 않는다 — 그냥 평소처럼 UPDATE만 하면 된다
UPDATE employees SET salary = ROUND(salary * 1.1, 2) WHERE department_id = 1;
UPDATE employees SET hire_date = hire_date WHERE department_id = 2; -- 급여는 안 바뀜

-- 급여가 실제로 바뀐 Engineering 부서 3명만 로그에 남아있는지 확인
SELECT employee_id, old_salary, new_salary FROM salary_audit ORDER BY employee_id;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>트리거 <span class="badge">프로시저</span></h1>
      <p>
        트리거는 특정 테이블에 <code>INSERT</code>/<code>UPDATE</code>/<code>DELETE</code>가
        일어날 때 애플리케이션 코드의 개입 없이 <strong>DB 안에서 자동으로</strong>
        실행되는 함수입니다. 감사 로그 남기기, 파생 컬럼 자동 계산, 데이터 정합성
        강제 같은 용도로 씁니다. 트리거는 두 부분으로 이루어집니다 — 실행할
        내용을 담은 <strong>트리거 함수</strong>와, 언제 그 함수를 부를지 정하는
        <strong>트리거 정의</strong>입니다.
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="old-new">OLD와 NEW</h2>
      <p>
        트리거 함수 안에서는 <code>OLD</code>(변경 전 행)와 <code>NEW</code>(변경 후
        행)라는 특수 레코드 변수를 쓸 수 있는데, 어떤 이벤트냐에 따라 사용 가능 여부가
        다릅니다. 값이 "실제로 바뀌었는지" 확인할 때는 <code>=</code> 대신
        <code>IS DISTINCT FROM</code>을 쓰는 게 안전합니다 — 둘 중 하나가
        <code>NULL</code>이어도 예상대로 동작합니다.
      </p>
      ${codeBlock(OLD_NEW_NOTE, "OLD/NEW 사용 범위 + NULL-안전 비교")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        실습 코드는 일부러 두 번의 <code>UPDATE</code>를 실행합니다 — 하나는
        급여를 실제로 바꾸고, 다른 하나는 <code>hire_date = hire_date</code>로 값이
        그대로인 갱신입니다. <code>salary_audit</code>에는 급여가 진짜로 바뀐
        Engineering 부서 3명만 남는 걸 확인해보세요. <code>IF NEW.salary IS DISTINCT
        FROM OLD.salary</code> 조건을 지우면 두 번째 <code>UPDATE</code>로도 로그가
        남는지도 비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "TRIGGER",
    sql: PLAYGROUND,
  });
};
