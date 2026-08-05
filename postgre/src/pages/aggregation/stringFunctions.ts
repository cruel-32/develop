import type { PageRender } from "../../router";
import { mountPgPlayground } from "../../pgPlayground";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL } from "../../sampleSchema";

const COMMON_FUNCTIONS = `
UPPER(name)                     -- 대문자로
LOWER(name)                     -- 소문자로
LENGTH(name)                    -- 문자 길이
name || ' <' || email || '>'    -- 문자열 이어붙이기(표준 SQL 연산자)
CONCAT(name, ' <', email, '>')  -- 이어붙이기 함수(NULL을 빈 문자열로 취급)
SUBSTRING(name FROM 1 FOR 3)    -- 부분 문자열(1부터 3글자)
TRIM('  hi  ')                  -- 앞뒤 공백 제거
REPLACE(name, 'a', '@')         -- 문자열 치환
SPLIT_PART(email, '@', 1)       -- 구분자로 자른 n번째 조각
`;

const CONCAT_NULL_NOTE = `
-- || 는 피연산자 중 하나라도 NULL이면 전체 결과가 NULL이 된다
'Dana' || NULL  -- => NULL

-- CONCAT()은 NULL을 빈 문자열처럼 건너뛴다
CONCAT('Dana', NULL, ' Yoon')  -- => 'Dana Yoon'
`;

const PLAYGROUND = `
${SCHEMA_SQL}

-- 실습: 이메일 만들기 + 이니셜 뽑기 + 이름 길이순 정렬
SELECT
  name,
  LOWER(REPLACE(name, ' ', '.')) || '@develop.cloudish.cloud' AS email,
  UPPER(SUBSTRING(name FROM 1 FOR 1)) AS initial,
  LENGTH(name) AS name_length
FROM employees
ORDER BY name_length DESC, name;
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>문자열 함수 <span class="badge">함수</span></h1>
      <p>
        Postgres는 표준 SQL 문자열 함수 대부분을 지원하면서, <code>||</code>
        연산자로 문자열을 이어붙이는 것도 지원합니다. 실무에서 이름/이메일 포맷팅,
        검색용 정규화(소문자 변환), 리포트용 요약 문자열을 만들 때 자주 조합해서
        씁니다.
      </p>
      ${codeBlock(COMMON_FUNCTIONS, "자주 쓰는 문자열 함수")}

      <h2 id="null-handling">이어붙이기와 NULL</h2>
      <p>
        <code>||</code>는 산술 연산과 비슷하게 동작해서, 피연산자 중 하나라도
        <code>NULL</code>이면 결과 전체가 <code>NULL</code>이 됩니다. 반면
        <code>CONCAT()</code> 함수는 <code>NULL</code>을 빈 문자열처럼 무시하고
        나머지를 이어붙입니다 — 어느 쪽이 원하는 동작인지에 따라 골라 써야 합니다.
      </p>
      ${codeBlock(CONCAT_NULL_NOTE, "|| vs CONCAT()의 NULL 처리 차이")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>REPLACE(name, ' ', '.')</code>를 <code>REPLACE(name, ' ', '_')</code>로
        바꿔보거나, <code>SUBSTRING(name FROM 1 FOR 1)</code>을
        <code>FROM 1 FOR 2</code>로 바꿔 이니셜을 두 글자로 늘려보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountPgPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    badge: "문자열 함수",
    sql: PLAYGROUND,
  });
};
