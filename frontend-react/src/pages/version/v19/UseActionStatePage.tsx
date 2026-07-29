import { useActionState } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface CreateState {
  message: string | null;
  error: string | null;
}

// CRUD Demo 메뉴와 완전히 같은 실제 API를 호출한다 - 여기서 등록하면 CRUD Demo 목록에도 그대로 나타난다.
async function createPerson(prevState: CreateState, formData: FormData): Promise<CreateState> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const age = Number(formData.get("age"));
  const job = String(formData.get("job") ?? "").trim();

  const res = await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, age, job, address: null }),
  });

  if (!res.ok) {
    const body = await res.json();
    return { message: null, error: body.error ?? "등록에 실패했습니다." };
  }
  const created = await res.json();
  return { message: \`"\${created.name}"님을 등록했습니다 (id: \${created.id}).\`, error: null };
}

function CreatePersonForm() {
  const [state, formAction, isPending] = useActionState<CreateState, FormData>(createPerson, {
    message: null,
    error: null,
  });

  return (
    <form action={formAction} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input name="id" type="number" placeholder="id (직접 지정)" required style={{ width: 90 }} />
      <input name="name" placeholder="이름" required />
      <input name="age" type="number" placeholder="나이" required style={{ width: 70 }} />
      <input name="job" placeholder="직업" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "등록 중..." : "실제로 등록"}
      </button>
      {state.error && <span style={{ color: "#f87171" }}>{state.error}</span>}
      {state.message && <span style={{ color: "#4ade80" }}>{state.message}</span>}
    </form>
  );
}

render(<CreatePersonForm />);
`;

export default function UseActionStatePage() {
  return (
    <article>
      <h1>useActionState</h1>
      <p>
        React 19에서 정식 도입된 훅이다. 폼 액션(비동기 함수)을 실행하고, 그 결과로 만들어지는
        상태값과 <code>isPending</code> 플래그를 함께 관리해준다. 기존에는 액션 실행 결과를
        직접 <code>useState</code>로 들고 있으면서 로딩 상태까지 손수 관리해야 했는데,
        <code>useActionState</code>는 이 둘을 한 번에 묶어준다.
      </p>
      <p>
        시그니처: <code>const [state, formAction, isPending] = useActionState(action, initialState)</code>
        . <code>action</code>은 <code>(previousState, formData) =&gt; newState</code> 형태의
        (보통 비동기) 함수이고, 반환된 <code>formAction</code>을 <code>&lt;form action=&#123;formAction&#125;&gt;</code>에
        그대로 꽂으면 폼 제출마다 자동으로 호출된다.
      </p>

      <section>
        <h2>직접 해보기 — 실제로 사람 등록하기</h2>
        <p className="hint">
          이 폼은 <strong>실제로 <code>/api/people</code>에 POST 요청을 보낸다</strong> — 즉 왼쪽
          메뉴의 <strong>CRUD Demo</strong>가 쓰는 것과 완전히 같은 데이터베이스다. 여기서 등록한
          사람은 CRUD Demo 목록에도 그대로 나타난다. id는 자동 생성되지 않으니 이미 존재하는
          id(예: CRUD Demo 목록에 있는 번호)를 넣어 <strong>중복 오류가 그대로 표시되는지</strong>도
          확인해보세요. 아래 코드를 직접 고쳐서 동작을 바꿔보세요.
          <code>import</code>은 지원하지 않고, 아래 스코프에 있는 <code>useActionState</code>만
          바로 사용할 수 있다(단, <code>fetch</code>는 일반 브라우저 API라 스코프 없이도 그대로
          쓸 수 있다). 문법 오류나 실행 에러가 나도 이 박스 안에서만 표시되고 페이지의 나머지
          부분은 그대로 동작합니다.
        </p>
        <Playground code={demoCode} scope={{ useActionState }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>

        <CodeBlock
          title="1. 폼 없이 직접 호출 — 이전 상태를 누적하는 좋아요 버튼"
          code={`
// action의 첫 인자는 "이전 state"다. formData 없이도 그냥 함수로 호출 가능.
const [likes, likeAction, isPending] = useActionState<number, void>(
  async (prevLikes: number): Promise<number> => {
    await saveLike();
    return prevLikes + 1;
  },
  0,
);

<button onClick={() => likeAction()} disabled={isPending}>
  👍 {likes}
</button>
`}
        />

        <CodeBlock
          title="2. 이전 상태를 이용한 누적 합계 (여러 번 제출)"
          code={`
const [total, addAction] = useActionState<number, FormData>(
  async (prevTotal: number, formData: FormData): Promise<number> => {
    const amount = Number(formData.get("amount"));
    await save(amount);
    return prevTotal + amount; // 매 제출마다 이전 합계에 더해감
  },
  0,
);

<form action={addAction}>
  <input name="amount" type="number" />
  <button>추가 (현재 합계: {total})</button>
</form>
`}
        />
      </section>
    </article>
  );
}
