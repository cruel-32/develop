import { useOptimistic, useState, useEffect } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface Person {
  id: number;
  name: string;
  job: string;
}

// CRUD Demo와 완전히 같은 실제 목록(첫 페이지 5명)을 불러와서 낙관적 삭제를 시연한다.
function PeopleOptimisticDemo() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [shouldFail, setShouldFail] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/people?page=1&pageSize=5")
      .then((res) => res.json())
      .then((body) => {
        setPeople(body.data);
        setLoaded(true);
      });
  }, []);

  const [optimisticPeople, removeOptimistic] = useOptimistic<Person[], number>(
    people,
    (state, id) => state.filter((p) => p.id !== id),
  );

  async function handleDelete(id: number) {
    removeOptimistic(id); // 목록에서 즉시 사라짐

    if (shouldFail) return; // 실제 삭제 요청을 보내지 않으면 people이 그대로라 자동으로 되돌아온다
    await fetch(\`/api/people/\${id}\`, { method: "DELETE" });
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }

  if (!loaded) return <p style={{ color: "#94a3b8" }}>로딩 중...</p>;

  return (
    <div>
      <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={shouldFail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShouldFail(e.target.checked)}
        />
        삭제 실패 시뮬레이션 (실제 CRUD Demo 데이터를 삭제하니 주의!)
      </label>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
        {optimisticPeople.map((p) => (
          <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>{p.name} — {p.job}</span>
            <button onClick={() => handleDelete(p.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

render(<PeopleOptimisticDemo />);
`;

export default function UseOptimisticPage() {
  return (
    <article>
      <h1>useOptimistic</h1>
      <p>
        비동기 작업이 끝나기 전에 &quot;성공할 것&quot;이라고 가정하고 UI를 먼저 업데이트해 보여주는
        훅이다. 실제 서버 응답이 오면 진짜 상태로 교체되고, 만약 실패하면 자동으로 원래 상태로
        되돌아간다.
      </p>
      <p>
        시그니처: <code>const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)</code>
        . <code>state</code>는 진짜(확정된) 상태이고, <code>addOptimistic(input)</code>을 호출하면
        <code>updateFn(state, input)</code>의 결과가 즉시 화면에 반영된다. 이후 진짜 <code>state</code>가
        바뀌면 낙관적 상태는 다시 그 값을 기준으로 계산된다.
      </p>

      <section>
        <h2>직접 해보기 — CRUD Demo 목록에서 낙관적 삭제</h2>
        <p className="hint">
          CRUD Demo와 같은 <code>/api/people</code> 목록(첫 페이지 5명)을 실제로 불러온다.
          체크박스를 켜면 삭제 요청을 아예 보내지 않아 실패 상황을 시뮬레이션하고, 낙관적으로
          사라졌던 항목이 되돌아오는 걸 확인할 수 있다. 체크박스를 끄면 실제로 삭제되어 CRUD
          Demo 목록에서도 사라진다.
        </p>
        <Playground code={demoCode} scope={{ useOptimistic, useState, useEffect }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>

        <CodeBlock
          title="1. 단일 값 토글 — 좋아요 버튼"
          code={`
interface LikeButtonProps {
  postId: string;
  liked: boolean;
  likeCount: number;
}

function LikeButton({ postId, liked, likeCount }: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic<boolean, boolean>(
    liked,
    (_current, next) => next,
  );

  async function toggleLike() {
    setOptimisticLiked(!optimisticLiked); // 클릭 즉시 하트 아이콘 반전
    await fetch(\`/api/posts/\${postId}/like\`, { method: "POST" });
  }

  return (
    <button onClick={toggleLike}>
      {optimisticLiked ? "❤️" : "🤍"} {likeCount}
    </button>
  );
}
`}
        />

        <CodeBlock
          title="2. 목록에서 낙관적 삭제"
          code={`
interface Todo {
  id: string;
  text: string;
}

const [optimisticTodos, removeOptimistic] = useOptimistic<Todo[], string>(
  todos,
  (state, id) => state.filter((todo) => todo.id !== id),
);

async function handleDelete(id: string) {
  removeOptimistic(id);      // 목록에서 즉시 사라짐
  await deleteTodo(id);      // 실패하면 todos가 그대로라 다시 나타남
}
`}
        />
      </section>
    </article>
  );
}
