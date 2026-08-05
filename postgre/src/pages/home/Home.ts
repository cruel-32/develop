import type { PageRender } from "../../router";
import { codeBlock } from "../../pageHelpers";
import { SCHEMA_SQL, SCHEMA_DIAGRAM } from "../../sampleSchema";

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>PostgreSQL 학습실</h1>
      <p>
        왼쪽 사이드바에서 배우고 싶은 항목을 선택하세요. 각 페이지는 개념 설명과 함께,
        진짜 Postgres 엔진을 브라우저 안에서 그대로 실행하는 실습창(에디터 + 실행 결과
        테이블)으로 구성되어 있습니다.
      </p>
      <p>
        실습창은 <a href="https://pglite.dev/" target="_blank" rel="noreferrer">PGlite</a>
        (Postgres를 WASM으로 컴파일한 프로젝트)로 만들어져 있어, 여러분이 입력한 SQL이
        서버가 아니라 <strong>이 브라우저 탭 안에서만</strong> 실행됩니다. 그래서
        <code>DROP TABLE</code>, <code>DELETE</code> 같은 되돌리기 어려운 구문도 걱정 없이
        마음껏 실행해볼 수 있습니다 — 실제 서비스가 쓰는 데이터베이스와는 전혀 연결되어
        있지 않고, "실행" 버튼을 누를 때마다 매번 깨끗한 데이터베이스에서 새로 시작합니다.
      </p>

      <h2 id="sample-schema">공통 샘플 스키마</h2>
      <p>
        모든 실습 페이지는 아래와 같은 <code>departments</code>/<code>employees</code> 두
        테이블을 기본으로 깔고 시작합니다. <code>employees.department_id</code>는
        NULL을 허용하고(부서 미배정 직원 1명 포함), <code>employees.manager_id</code>는
        같은 테이블을 스스로 참조합니다 — SELF JOIN 실습에 쓰입니다.
      </p>
      ${codeBlock(SCHEMA_DIAGRAM, "테이블 구조")}
      ${codeBlock(SCHEMA_SQL, "스키마 생성 + 샘플 데이터 (모든 실습창의 시작 코드)")}

      <h2 id="learning-path">학습 순서</h2>
      <p>
        <strong>기초 문법</strong>(SELECT/INSERT/UPDATE/DELETE) →
        <strong>JOIN</strong>(INNER/OUTER/CROSS/SELF) →
        <strong>집계 & 함수</strong>(GROUP BY, 문자열/날짜 함수, 윈도우 함수) →
        <strong>함수 & 프로시저</strong>(PL/pgSQL, PROCEDURE, 트리거) 순으로 읽으면
        됩니다. 각 페이지의 실습창 코드는 항상 스키마 생성부터 시작하는 완결된
        스크립트라, 아무 페이지에서나 바로 실행해도 됩니다.
      </p>
    </article>
  `;
};
