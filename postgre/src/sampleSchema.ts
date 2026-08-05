/**
 * 모든 실습 페이지가 공유하는 샘플 스키마. 각 플레이그라운드는 완전히 새로운 인메모리
 * Postgres 인스턴스에서 실행되므로(pgClient.ts 참고), 페이지마다 이 스키마를 처음부터
 * 다시 만든다 — react-live처럼 "실행 버튼을 누르면 그 스니펫 하나로 완결된 결과가 나온다"
 * 는 경험을 SQL에서도 그대로 재현하기 위해서다.
 *
 * departments 4개 중 "People Ops"는 소속 직원이 0명이고, employees 중 "Dana Yoon"은
 * department_id가 NULL이다 — OUTER JOIN에서 어느 쪽이 비는지 눈으로 보여주기 위해
 * 의도적으로 넣었다.
 */
export const SCHEMA_SQL = `
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  budget NUMERIC(12, 2) NOT NULL
);

INSERT INTO departments (name, budget) VALUES
  ('Engineering', 500000),
  ('Sales', 300000),
  ('Marketing', 150000),
  ('People Ops', 90000);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  salary NUMERIC(10, 2) NOT NULL,
  hire_date DATE NOT NULL,
  manager_id INTEGER REFERENCES employees(id)
);

INSERT INTO employees (name, department_id, salary, hire_date, manager_id) VALUES
  ('Ada Kim',      1, 95000, '2019-03-04', NULL),
  ('Grace Lee',    1, 82000, '2021-07-19', 1),
  ('Linus Park',   1, 78000, '2022-01-10', 1),
  ('Youngmi Choi', 2, 71000, '2020-11-02', NULL),
  ('Brian Han',    2, 64000, '2023-02-27', 4),
  ('Sunny Oh',     3, 60000, '2022-09-15', NULL),
  ('Dana Yoon',    NULL, 55000, '2023-06-01', NULL);
`.trim();

/** 스키마 설명용 다이어그램(정적 코드 블록에만 사용, 실행하지 않음) */
export const SCHEMA_DIAGRAM = `
departments                     employees
----------------                ------------------------------------
id (PK)                         id (PK)
name                            name
budget                          department_id (FK -> departments.id, NULL 가능)
                                 salary
                                 hire_date
                                 manager_id (FK -> employees.id, 자기 자신 참조)
`.trim();
