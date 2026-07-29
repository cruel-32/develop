import { create } from "zustand";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface Person {
  id: number;
  name: string;
  job: string;
}

interface PeopleState {
  people: Person[];
  loading: boolean;
  load: () => Promise<void>;
  remove: (id: number) => Promise<void>;
}

// CRUD Demo와 완전히 같은 실제 /api/people을 감싸는 스토어.
const usePeopleStore = create<PeopleState>((set, get) => ({
  people: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const res = await fetch("/api/people?page=1&pageSize=5");
    const body = await res.json();
    set({ people: body.data, loading: false });
  },
  remove: async (id) => {
    await fetch(\`/api/people/\${id}\`, { method: "DELETE" });
    set({ people: get().people.filter((p) => p.id !== id) });
  },
}));

// people 슬라이스만 구독한다. loading이 바뀌어도 이 컴포넌트는 리렌더되지 않는다.
function PeopleList() {
  const people = usePeopleStore((s) => s.people);
  const remove = usePeopleStore((s) => s.remove);
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
      {people.map((p) => (
        <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>{p.name} — {p.job}</span>
          <button onClick={() => remove(p.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}

// load/loading만 구독한다. people이 바뀌어도 이 컴포넌트는 리렌더되지 않는다.
function LoadButton() {
  const load = usePeopleStore((s) => s.load);
  const loading = usePeopleStore((s) => s.loading);
  return (
    <button onClick={load} disabled={loading}>
      {loading ? "불러오는 중..." : "실제 CRUD Demo 목록 불러오기"}
    </button>
  );
}

function Demo() {
  return (
    <div>
      <LoadButton />
      <PeopleList />
    </div>
  );
}

render(<Demo />);
`;

export default function ZustandPage() {
  return (
    <article>
      <h1>Store — Zustand</h1>
      <p>
        Zustand는 Redux처럼 Provider로 감쌀 필요 없이, <code>create()</code>로 만든 훅 하나로
        전역 상태를 공유하는 아주 가벼운 상태관리 라이브러리다. 컴포넌트는 셀렉터 함수로
        스토어의 <strong>일부 조각(slice)만</strong> 구독할 수 있어서, 관련 없는 상태가
        바뀌어도 리렌더되지 않는다.
      </p>

      <section>
        <h2>직접 해보기 — CRUD Demo 목록을 감싸는 스토어</h2>
        <p className="hint">
          <code>PeopleList</code>와 <code>LoadButton</code>은 서로 props를 주고받지 않는다.
          같은 스토어를 각자 다른 슬라이스로 구독할 뿐이다. &quot;불러오기&quot;를 누르면 CRUD
          Demo와 완전히 같은 실제 데이터가 표시되고, 여기서 삭제하면 CRUD Demo 목록에서도
          사라진다.
        </p>
        <Playground code={demoCode} scope={{ create }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>

        <CodeBlock
          title="1. 카운터처럼 간단한 로컬 상태 스토어"
          code={`
interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// count만 구독 — increment/reset을 쓰는 다른 컴포넌트가 리렌더되어도 영향 없음
function CounterDisplay() {
  const count = useCounterStore((s) => s.count);
  return <p>{count}</p>;
}
`}
        />

        <CodeBlock
          title="2. 배열 상태를 다루는 Todo 스토어"
          code={`
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const useTodoStore = create<{ todos: Todo[]; add: (text: string) => void; toggle: (id: number) => void }>(
  (set) => ({
    todos: [],
    add: (text) =>
      set((s) => ({ todos: [...s.todos, { id: Date.now(), text, done: false }] })),
    toggle: (id) =>
      set((s) => ({
        todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      })),
  }),
);
`}
        />

        <CodeBlock
          title="3. 셀렉터로 파생 상태(derived value) 계산"
          code={`
// todos 배열 자체가 아니라 "완료 안 된 개수"만 구독한다.
// done 여부가 바뀌어도 이 값이 그대로면 컴포넌트는 리렌더되지 않는다.
const remainingCount = useTodoStore((s) => s.todos.filter((t) => !t.done).length);
`}
        />
      </section>
    </article>
  );
}
