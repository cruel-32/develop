import { pgTable, integer, text } from "drizzle-orm/pg-core";

// id는 자동 증가가 아니라 클라이언트가 직접 지정한다 (CRUD Demo/예제에서 id를 눈으로 보고
// 골라 쓰거나, 중복 id로 등록을 시도해 충돌 처리를 확인할 수 있게 하기 위함).
export const people = pgTable("people", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  job: text("job").notNull(),
  address: text("address"),
});
