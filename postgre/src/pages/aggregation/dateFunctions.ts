import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const COMMON_FUNCTIONS = `
CURRENT_DATE                          -- 오늘 날짜 (시간 없음)
NOW()                                 -- 현재 타임스탬프 (시간대 포함)
AGE(hire_date)                        -- 오늘 기준 경과 기간(interval), 예: '6 years 3 mons 2 days'
EXTRACT(YEAR FROM AGE(hire_date))     -- interval에서 특정 필드만 뽑기
DATE_TRUNC('month', hire_date)        -- 월 시작일로 내림
TO_CHAR(hire_date, 'YYYY-MM-DD')      -- 원하는 형식의 문자열로
hire_date + INTERVAL '90 days'        -- 날짜 산술(수습 기간 계산 등)
`;

const INTERVAL_ARITHMETIC = `
-- 날짜/시간에 interval을 더하고 빼는 연산이 그대로 된다
hire_date + INTERVAL '1 year'   -- 입사 1주년
hire_date + INTERVAL '90 days'  -- 수습 종료일
CURRENT_DATE - hire_date        -- 두 날짜의 차이(정수, 일 단위)
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 근속 연차 계산 + 입사 연도별 인원수
SELECT
  name,
  hire_date,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) AS years_employed,
  hire_date + INTERVAL '1 year' AS first_anniversary,
  TO_CHAR(hire_date, 'YYYY-MM') AS hire_month
FROM employees
ORDER BY hire_date;

SELECT
  DATE_TRUNC('year', hire_date) AS hire_year,
  COUNT(*) AS hires
FROM employees
GROUP BY hire_year
ORDER BY hire_year;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>날짜/시간 함수 <span class="badge">함수</span></h1>
      <p>
        Postgres의 날짜/시간 계산은 대부분 <code>interval</code> 타입을 매개로
        이루어집니다. <code>AGE(date)</code>는 오늘과 그 날짜 사이의 기간을
        "몇 년 몇 개월 며칠" 형태의 <code>interval</code>로 돌려주고,
        <code>EXTRACT()</code>로 그 안에서 원하는 필드만 뽑아낼 수 있습니다.
      </p>
      ${codeBlock(COMMON_FUNCTIONS, "자주 쓰는 날짜/시간 함수")}

      <h2 id="interval">interval 산술</h2>
      <p>
        날짜에 <code>+</code>/<code>-</code>로 <code>INTERVAL</code>을 바로 더하고 뺄 수
        있어서, "입사 90일 후 수습 종료일" 같은 계산을 함수 호출 없이 표현식 한 줄로
        끝낼 수 있습니다. 두 날짜를 그냥 빼면(<code>date - date</code>) 일수 차이가
        정수로 나옵니다.
      </p>
      ${codeBlock(INTERVAL_ARITHMETIC, "날짜 + interval 연산")}

      <h2 id="truncate-format">DATE_TRUNC와 TO_CHAR</h2>
      <p>
        "월별/분기별/연도별로 묶어서 집계"할 때는 <code>DATE_TRUNC('month', date)</code>처럼
        날짜를 해당 단위의 시작일로 내림한 뒤 <code>GROUP BY</code>하는 패턴을 씁니다.
        화면에 보여줄 문자열 포맷이 필요하면 <code>TO_CHAR(date, 'YYYY-MM-DD')</code>처럼
        형식 문자열을 지정합니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>DATE_TRUNC('year', hire_date)</code>를
        <code>DATE_TRUNC('quarter', hire_date)</code>로 바꿔서 분기별 입사자 수로
        바꿔보거나, <code>TO_CHAR</code>의 포맷 문자열을 <code>'YYYY"년" MM"월"'</code>로
        바꿔보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "날짜/시간 함수",
    sql: PLAYGROUND,
  });
};
