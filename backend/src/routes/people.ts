import { Router, type Request, type Response } from "express";
import { count, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { people } from "../db/schema.js";

const router = Router();

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

interface PersonInput {
  id: number;
  name: string;
  age: number;
  job: string;
  address: string | null;
}

/** Postgres unique_violation (id 중복) 여부. */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

function parsePersonInput(body: unknown): PersonInput | { error: string } {
  const { id, name, age, job, address } = (body ?? {}) as Record<string, unknown>;

  const parsedId = typeof id === "number" ? id : Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return { error: "id는 1 이상의 정수여야 합니다." };
  }
  if (typeof name !== "string" || name.trim() === "") {
    return { error: "name은 비어있지 않은 문자열이어야 합니다." };
  }
  if (typeof job !== "string" || job.trim() === "") {
    return { error: "job은 비어있지 않은 문자열이어야 합니다." };
  }
  const parsedAge = typeof age === "number" ? age : Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 0) {
    return { error: "age는 0 이상의 정수여야 합니다." };
  }
  if (address !== undefined && address !== null && typeof address !== "string") {
    return { error: "address는 문자열이거나 비어있어야 합니다." };
  }

  return {
    id: parsedId,
    name: name.trim(),
    age: parsedAge,
    job: job.trim(),
    address: address ? String(address).trim() : null,
  };
}

router.get("/", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

  const [{ value: total }] = await db.select({ value: count() }).from(people);

  const data = await db
    .select()
    .from(people)
    .orderBy(people.id)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  res.json({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(people).where(eq(people.id, id));
  if (!row) {
    res.status(404).json({ error: "Person not found" });
    return;
  }
  res.json(row);
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = parsePersonInput(req.body);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const [row] = await db.insert(people).values(parsed).returning();
    res.status(201).json(row);
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({ error: `id ${parsed.id}는 이미 사용 중입니다.` });
      return;
    }
    throw err;
  }
});

// id 자체도 body로 바꿀 수 있다(= PK 변경). URL의 :id는 "현재 어떤 레코드를 수정할지"만 가리킨다.
router.put("/:id", async (req: Request, res: Response) => {
  const currentId = Number(req.params.id);
  const parsed = parsePersonInput(req.body);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const [row] = await db.update(people).set(parsed).where(eq(people.id, currentId)).returning();
    if (!row) {
      res.status(404).json({ error: "Person not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({ error: `id ${parsed.id}는 이미 사용 중입니다.` });
      return;
    }
    throw err;
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [row] = await db.delete(people).where(eq(people.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "Person not found" });
    return;
  }
  res.status(204).send();
});

export default router;
