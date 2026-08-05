import { useEffect, useState, type FormEvent } from "react";
import type { Person, PersonInput, PeoplePage } from "../../types";

const PAGE_SIZE = 5;

async function fetchPeople(page: number): Promise<PeoplePage> {
  const res = await fetch(`/api/people?page=${page}&pageSize=${PAGE_SIZE}`);
  return res.json();
}

async function fetchPerson(id: number): Promise<Person> {
  const res = await fetch(`/api/people/${id}`);
  return res.json();
}

function PersonForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: PersonInput;
  submitLabel: string;
  onSubmit: (input: PersonInput) => Promise<void>;
}) {
  const [id, setId] = useState(initial.id === 0 ? "" : String(initial.id));
  const [name, setName] = useState(initial.name);
  const [age, setAge] = useState(String(initial.age));
  const [job, setJob] = useState(initial.job);
  const [address, setAddress] = useState(initial.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        id: Number(id),
        name,
        age: Number(age),
        job,
        address: address.trim() ? address.trim() : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="id (직접 지정)"
        type="number"
        min={1}
        required
        style={{ width: "5.5rem" }}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
      <input
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="나이"
        type="number"
        min={0}
        required
        style={{ width: "5rem" }}
      />
      <input value={job} onChange={(e) => setJob(e.target.value)} placeholder="직업" required />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="주소 (선택)"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "처리 중..." : submitLabel}
      </button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}

function PeopleList({ onSelect }: { onSelect: (id: number) => void }) {
  const [page, setPage] = useState(1);
  const [peoplePage, setPeoplePage] = useState<PeoplePage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      setPeoplePage(await fetchPeople(page));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    reload().catch((err) => setError(String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleCreate(input: PersonInput) {
    const res = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error((await res.json()).error ?? "생성 실패");
    }
    setPage(1);
    await reload();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div>
      <h3>새 사람 추가</h3>
      <p className="hint">
        id는 자동 생성되지 않습니다 — 직접 원하는 번호를 지정하세요. 이미 존재하는 id를
        입력하면 중복 오류가 표시됩니다.
      </p>
      <PersonForm
        initial={{ id: 0, name: "", age: 0, job: "", address: null }}
        submitLabel="추가"
        onSubmit={handleCreate}
      />

      {error && <p className="error">{error}</p>}

      <ul className="item-list">
        {peoplePage?.data.map((person) => (
          <li key={person.id}>
            <div>
              <span className="hint">#{person.id}</span>{" "}
              <strong>{person.name}</strong> ({person.age}세) — {person.job}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => onSelect(person.id)}>
                상세보기
              </button>
              <button type="button" onClick={() => handleDelete(person.id)}>
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>

      {peoplePage && (
        <div className="inline-form">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            이전
          </button>
          <span className="hint">
            {peoplePage.page} / {peoplePage.totalPages} 페이지 (총 {peoplePage.total}명)
          </span>
          <button
            type="button"
            disabled={page >= peoplePage.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function PersonDetail({
  id,
  onBack,
  onRenamed,
}: {
  id: number;
  onBack: () => void;
  onRenamed: (newId: number) => void;
}) {
  const [person, setPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      setPerson(await fetchPerson(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    reload().catch((err) => setError(String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(input: PersonInput) {
    const res = await fetch(`/api/people/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error((await res.json()).error ?? "수정 실패");
    }
    const updated: Person = await res.json();
    if (updated.id !== id) {
      // id를 바꿔서 저장한 경우 - 부모의 selectedId도 새 id로 옮겨준다.
      onRenamed(updated.id);
      return;
    }
    setPerson(updated);
  }

  async function handleDelete() {
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    onBack();
  }

  if (error) return <p className="error">{error}</p>;
  if (!person) return <p className="hint">불러오는 중...</p>;

  return (
    <div>
      <button type="button" onClick={onBack}>
        ← 목록으로
      </button>
      <h3>상세 정보 (id: {person.id})</h3>
      <p className="hint">id를 바꿔서 저장하면 이 레코드의 기본키(PK) 자체가 바뀝니다.</p>
      <PersonForm
        initial={{
          id: person.id,
          name: person.name,
          age: person.age,
          job: person.job,
          address: person.address,
        }}
        submitLabel="저장"
        onSubmit={handleUpdate}
      />
      <button type="button" onClick={handleDelete} style={{ marginTop: 8 }}>
        이 사람 삭제
      </button>
    </div>
  );
}

export default function CrudDemoPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <article>
      <h1>CRUD Demo</h1>
      <p>
        백엔드의 Express + Drizzle ORM + Postgres 스택으로 만든 <code>/api/people</code>를
        호출하는 데모입니다. 페이지네이션이 있는 목록과, 개별 레코드의 상세 조회/수정/삭제를
        지원합니다. id는 자동 생성이 아니라 직접 지정하는 값이라, 목록에서 원하는 id를 확인한
        뒤 <strong>use</strong> 레슨의 상세 조회 예제에 그대로 입력해볼 수 있습니다.
      </p>

      {selectedId === null ? (
        <PeopleList onSelect={setSelectedId} />
      ) : (
        <PersonDetail id={selectedId} onBack={() => setSelectedId(null)} onRenamed={setSelectedId} />
      )}
    </article>
  );
}
