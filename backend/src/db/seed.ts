import { db } from "./client.js";
import { people } from "./schema.js";

const SEED_PEOPLE = [
  { id: 1, name: "김민준", age: 29, job: "프론트엔드 개발자", address: "서울시 강남구" },
  { id: 2, name: "이서연", age: 34, job: "백엔드 개발자", address: "서울시 마포구" },
  { id: 3, name: "박도윤", age: 41, job: "프로덕트 매니저", address: null },
  { id: 4, name: "최지우", age: 26, job: "디자이너", address: "부산시 해운대구" },
  { id: 5, name: "정하은", age: 37, job: "데이터 엔지니어", address: "경기도 성남시" },
  { id: 6, name: "강시우", age: 45, job: "테크 리드", address: "서울시 종로구" },
  { id: 7, name: "조유나", age: 31, job: "QA 엔지니어", address: null },
  { id: 8, name: "윤도현", age: 28, job: "DevOps 엔지니어", address: "인천시 연수구" },
  { id: 9, name: "임서준", age: 39, job: "백엔드 개발자", address: "서울시 송파구" },
  { id: 10, name: "한지호", age: 24, job: "주니어 개발자", address: null },
  { id: 11, name: "오채원", age: 33, job: "UX 리서처", address: "서울시 서초구" },
  { id: 12, name: "장동현", age: 50, job: "엔지니어링 매니저", address: "서울시 용산구" },
];

/** people 테이블이 비어있을 때만(최초 배포 시) 예시 데이터를 채운다. */
export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(people).limit(1);
  if (existing.length > 0) return;
  await db.insert(people).values(SEED_PEOPLE);
}
