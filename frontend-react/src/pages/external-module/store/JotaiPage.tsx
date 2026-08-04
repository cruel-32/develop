import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface Person {
  id: number;
  name: string;
  job: string;
}

// atom()은 "상태 조각" 하나를 정의한다. Zustand의 store 전체와 달리,
// 필요한 만큼 잘게 쪼개서 여러 개를 만들 수 있다.
const peopleAtom = atom<Person[]>([]);
const loadingAtom = atom(false);

// 파생 atom: 다른 atom의 값을 읽어 계산되는 값. 의존하는 atom이 바뀔 때만 다시 계산된다.
const countAtom = atom((get) => get(peopleAtom).length);

// 쓰기 전용 atom(액션): get으로 현재 상태를 읽고 set으로 다른 atom을 갱신한다.
// CRUD Demo와 같은 실제 /api/people을 호출한다.
const loadPeopleAtom = atom(null, async (get, set) => {
  set(loadingAtom, true);
  const res = await fetch("/api/people?page=1&pageSize=5");
  const body = await res.json();
  set(peopleAtom, body.data);
  set(loadingAtom, false);
});

const removePersonAtom = atom(null, async (get, set, id: number) => {
  await fetch(\`/api/people/\${id}\`, { method: "DELETE" });
  set(peopleAtom, get(peopleAtom).filter((p) => p.id !== id));
});

// people만 구독한다. loading이 바뀌어도 이 컴포넌트는 리렌더되지 않는다.
function PeopleList() {
  const people = useAtomValue(peopleAtom);
  const removePerson = useSetAtom(removePersonAtom);
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
      {people.map((p) => (
        <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>{p.name} — {p.job}</span>
          <button onClick={() => removePerson(p.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}

// count 파생 atom만 구독한다. people 배열 자체가 바뀌어도 length가 같으면 리렌더되지 않는다.
function PeopleCount() {
  const count = useAtomValue(countAtom);
  return <p style={{ color: "#94a3b8", margin: "8px 0 0" }}>총 {count}명</p>;
}

// loading/load 액션만 구독한다. people이 바뀌어도 이 컴포넌트는 리렌더되지 않는다.
function LoadButton() {
  const loading = useAtomValue(loadingAtom);
  const loadPeople = useSetAtom(loadPeopleAtom);
  return (
    <button onClick={loadPeople} disabled={loading}>
      {loading ? "불러오는 중..." : "실제 CRUD Demo 목록 불러오기"}
    </button>
  );
}

function Demo() {
  return (
    <div>
      <LoadButton />
      <PeopleCount />
      <PeopleList />
    </div>
  );
}

render(<Demo />);
`;

export default function JotaiPage() {
  return (
    <article>
      <h1>Store — Jotai</h1>
      <p>
        Jotai는 Recoil에서 영감을 받은 원자(atom) 기반 상태관리 라이브러리다. Zustand가 스토어
        하나에 여러 필드를 두고 셀렉터로 일부만 구독하는 방식이라면, Jotai는 처음부터 상태를
        <code>atom()</code> 단위로 잘게 쪼갠 뒤 필요한 atom만 구독한다. 컴포넌트는 자신이
        구독한 atom이 바뀔 때만 리렌더되므로, 별도의 셀렉터 함수 없이도 자연스럽게 세밀한
        구독이 만들어진다.
      </p>

      <section>
        <h2>직접 해보기 — CRUD Demo 목록을 atom으로</h2>
        <p className="hint">
          <code>peopleAtom</code>은 목록을, <code>loadingAtom</code>은 로딩 상태를,{" "}
          <code>countAtom</code>은 <code>peopleAtom</code>에서 파생된 개수를 각각 별도의
          atom으로 관리한다. Zustand/TanStack Query 예제와 마찬가지로 CRUD Demo와 같은 실제{" "}
          <code>/api/people</code>을 호출하므로, 여기서 삭제하면 CRUD Demo 목록에서도 사라진다.
        </p>
        <Playground code={demoCode} scope={{ atom, useAtom, useAtomValue, useSetAtom }} />
      </section>

      <section>
        <h2>주요 개념 / API</h2>

        <CodeBlock
          title="1. atom — 기본 단위"
          code={`
// 원시 atom: useState의 값 하나를 전역으로 꺼내놓은 것과 같다.
const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

// Provider 없이도 동작한다 (기본은 모듈 스코프의 전역 store를 공유).
// 테스트나 위젯별로 격리하고 싶을 때만 <Provider>로 감싸면 된다.
`}
        />

        <CodeBlock
          title="2. useAtom vs useAtomValue vs useSetAtom"
          code={`
const textAtom = atom("");

// 읽기 + 쓰기 둘 다 필요할 때
const [text, setText] = useAtom(textAtom);

// 읽기만 필요할 때 — setText를 안 쓰는 컴포넌트가 실수로 즉시
// 리렌더 대상이 되는 걸 타입 레벨에서부터 막아준다.
const value = useAtomValue(textAtom);

// 쓰기만 필요할 때 — 이 컴포넌트는 textAtom 값이 바뀌어도 리렌더되지 않는다.
const setValue = useSetAtom(textAtom);
`}
        />

        <CodeBlock
          title="3. 파생 atom(derived atom) — 계산된 값"
          code={`
const todosAtom = atom<Todo[]>([]);

// 읽기 전용 파생 atom: 의존하는 todosAtom이 바뀔 때만 다시 계산된다.
const remainingCountAtom = atom((get) => get(todosAtom).filter((t) => !t.done).length);

// 여러 atom을 조합하는 것도 가능하다.
const summaryAtom = atom((get) => {
  const todos = get(todosAtom);
  return { total: todos.length, remaining: get(remainingCountAtom) };
});
`}
        />

        <CodeBlock
          title="4. 쓰기 전용 atom(액션) — 비동기 로직 캡슐화"
          code={`
const peopleAtom = atom<Person[]>([]);

// 첫 번째 인자(read)는 null, 두 번째 인자(write)에 실행 로직을 담는다.
// 컴포넌트에서 fetch 로직을 직접 쓰지 않고 액션 atom 하나로 노출할 수 있다.
const createPersonAtom = atom(null, async (get, set, input: PersonInput) => {
  const res = await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const created = await res.json();
  set(peopleAtom, [...get(peopleAtom), created]);
});

function CreateButton() {
  const createPerson = useSetAtom(createPersonAtom);
  return (
    <button onClick={() => createPerson({ id: 10, name: "홍길동", age: 30, job: "개발자", address: null })}>
      추가
    </button>
  );
}
`}
        />

        <CodeBlock
          title="5. atomFamily — 파라미터화된 atom 재사용"
          code={`
import { atomFamily } from "jotai/utils";

// id별로 독립된 atom을 자동으로 만들어 캐싱해준다.
// 같은 id로 다시 호출하면 이전에 만든 atom을 그대로 재사용한다.
const personAtomFamily = atomFamily((id: number) =>
  atom(async () => {
    const res = await fetch(\`/api/people/\${id}\`);
    return res.json() as Promise<Person>;
  }),
);

function PersonCard({ id }: { id: number }) {
  const person = useAtomValue(personAtomFamily(id));
  return <p>{person.name}</p>;
}
`}
        />
      </section>
    </article>
  );
}
