# PostgreSQL 학습실

`/postgre` 경로에서 서빙되는 이 앱은 SQL을 브라우저 안에서 직접 실행하며 배우는 학습실입니다.
다른 학습실(react/vue/typescript/ecma/html-css)과 같은 설계 철학(대/중/소 메뉴, 사이드바+
콘텐츠+목차 3단 레이아웃, 편집 가능한 라이브 예제)을 SQL에 맞게 옮겼습니다.

## 실습창이 동작하는 방식

서버에 쿼리를 보내는 대신 [PGlite](https://pglite.dev/)(Postgres를 WASM으로 컴파일한
프로젝트)로 진짜 Postgres 엔진을 이 브라우저 탭 안에서 그대로 실행합니다
(`src/pgPlayground.ts`, `src/pgClient.ts`). 그래서:

- 실제 서비스가 쓰는 백엔드 Postgres(`backend`의 `db` 서비스)와는 네트워크로 전혀 연결되어
  있지 않습니다 — `DROP TABLE`, `DELETE` 같은 구문도 안전하게 실습할 수 있습니다.
- "실행" 버튼을 누를 때마다 완전히 새로운 인메모리 DB에서 시작하므로, 스크립트를 몇 번을
  다시 실행해도 `relation already exists` 같은 오류 없이 항상 깨끗한 상태로 돌아갑니다.
- 쿼리 결과 셀 값은 (사용자가 `INSERT`한 임의 문자열을 포함해서) 항상 `textContent`로만
  DOM에 넣습니다 — `innerHTML`로 조립하지 않으므로 결과 테이블을 통한 XSS 여지가 없습니다.

## 다루는 주제

기초 문법(SELECT/INSERT/UPDATE/DELETE) → JOIN(INNER/LEFT·RIGHT·FULL OUTER/CROSS/SELF) →
집계 & 함수(GROUP BY, 문자열/날짜/윈도우 함수) → 함수 & 프로시저(PL/pgSQL 함수, PROCEDURE,
트리거) 순으로 구성되어 있고(`src/menu.ts`), 모든 페이지는 `src/sampleSchema.ts`의 공통
`departments`/`employees` 샘플 데이터를 기반으로 실행 가능한 완결된 스크립트를 제공합니다.
