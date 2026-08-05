import { PGlite } from "@electric-sql/pglite";

/**
 * 실행할 때마다 완전히 새로운 인메모리 Postgres 인스턴스를 만든다.
 *
 * 각 페이지의 플레이그라운드 코드는 스키마 생성(CREATE TABLE)부터 샘플 데이터
 * 삽입, 실제 실습 쿼리까지 한 스크립트 안에 전부 들어있다. 같은 인스턴스를 계속
 * 재사용하면 "실행"을 두 번만 눌러도 `relation "employees" already exists` 같은
 * 오류가 나서 매번 처음부터 다시 실행한다는 학습 도구의 기대와 어긋난다. 그래서
 * 실행 버튼을 누를 때마다 깨끗한 데이터베이스를 새로 만들고, 이전 인스턴스는
 * 백그라운드에서 닫아 메모리를 정리한다.
 *
 * 이 인스턴스는 오직 사용자 브라우저 탭 안의 WASM 메모리에만 존재한다 — 실제
 * 서비스가 쓰는 백엔드 Postgres(`backend`의 `db` 서비스)와는 네트워크로 전혀
 * 연결되어 있지 않으므로, 여기서 어떤 SQL을 실행해도(DROP TABLE 포함) 이 탭을
 * 새로고침하면 그만이다.
 */
let previousDb: PGlite | null = null;

export async function createFreshDb(): Promise<PGlite> {
  const toClose = previousDb;
  const db = new PGlite();
  previousDb = db;
  if (toClose) {
    void toClose.close().catch(() => {});
  }
  return db;
}
