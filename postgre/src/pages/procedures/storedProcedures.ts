import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const SYNTAX = `
CREATE PROCEDURE procedure_name(IN param1 TYPE, INOUT param2 TYPE)
LANGUAGE plpgsql
AS $$
BEGIN
  -- 본문은 함수와 거의 같지만 RETURN에 값을 실어 보낼 수 없다
END;
$$;

-- 호출은 SELECT가 아니라 CALL
CALL procedure_name(value1, value2);
`;

const FUNCTION_VS_PROCEDURE = `
-- FUNCTION: SELECT로 호출, 반드시 RETURN 값이 있어야 하며 SELECT 목록 등 "값이 필요한 곳"에 쓸 수 있다
SELECT give_raise(1, 10);

-- PROCEDURE: CALL로만 호출, 값을 SELECT처럼 표현식 자리에 쓸 수 없다
-- 대신 COMMIT/ROLLBACK으로 자체 트랜잭션을 제어할 수 있어(함수는 불가능),
-- 여러 단계를 거치는 배치/마이그레이션 작업에 적합하다
CALL apply_department_raise(1, 5, 0);
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- INOUT 파라미터: CALL 이후 실제로 몇 행이 바뀌었는지 결과로 돌려받는다
CREATE PROCEDURE apply_department_raise(
  IN dept_id INTEGER,
  IN raise_pct NUMERIC,
  INOUT affected_count INTEGER DEFAULT 0
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE employees
  SET salary = ROUND(salary * (1 + raise_pct / 100), 2)
  WHERE department_id = dept_id;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
END;
$$;

-- affected_count 자리에 아무 값이나 넣어도 되고(DEFAULT가 있으니 생략도 가능하다), 결과 행에서 최종 값을 돌려준다
CALL apply_department_raise(1, 5, 0);

SELECT name, department_id, salary FROM employees WHERE department_id = 1;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>저장 프로시저 (PROCEDURE) <span class="badge">프로시저</span></h1>
      <p>
        <code>PROCEDURE</code>는 문법이 <code>FUNCTION</code>과 비슷하지만 호출 방식과
        용도가 다릅니다. <code>SELECT</code>가 아니라 <code>CALL</code>로 실행하고,
        값을 표현식처럼 반환하지 않는 대신 <strong>본문 안에서 직접 트랜잭션을
        커밋/롤백</strong>할 수 있다는 게 가장 큰 차이입니다(함수는 이게 불가능합니다).
      </p>
      ${codeBlock(SYNTAX, "기본 문법")}

      <h2 id="function-vs-procedure">FUNCTION vs PROCEDURE 언제 뭘 쓸까</h2>
      <p>
        "쿼리 안에서 값 하나를 계산해 끼워 넣고 싶다"면 <code>FUNCTION</code>,
        "여러 단계를 거치는 작업을 하나의 이름으로 묶어 실행하고 싶다"면
        <code>PROCEDURE</code>가 자연스럽습니다. 배치 작업처럼 중간에 실패해도
        일부는 커밋해두고 싶은 경우 프로시저의 자체 트랜잭션 제어가 특히 유용합니다.
      </p>
      ${codeBlock(FUNCTION_VS_PROCEDURE, "호출 방식 비교")}

      <h2 id="inout">INOUT 파라미터로 결과 돌려받기</h2>
      <p>
        프로시저는 <code>RETURN value</code>로 값을 반환할 수 없는 대신,
        <code>INOUT</code> 파라미터를 선언하면 <code>CALL</code> 실행 후 그 파라미터의
        최종 값이 결과 행으로 돌아옵니다. <code>GET DIAGNOSTICS var = ROW_COUNT</code>는
        바로 직전 SQL 문이 몇 행에 영향을 줬는지 알려주는 PL/pgSQL 전용 구문입니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>CALL apply_department_raise(1, 5, 0)</code>를
        <code>CALL apply_department_raise(2, 8, 0)</code>로 바꿔 Sales 부서를
        8% 인상해보세요. 결과 테이블의 <code>affected_count</code> 컬럼이 그 부서의
        직원 수와 일치하는지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "PROCEDURE",
    sql: PLAYGROUND,
  });
};
