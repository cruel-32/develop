import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface CreateState {
  message: string | null;
  error: string | null;
}

// useActionState 페이지와 같은 실제 API. CRUD Demo 목록에도 그대로 반영된다.
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

// useFormStatus는 이 컴포넌트를 렌더링하는 <form>과 "같은 컴포넌트"가 아니라
// 그 form의 자식 컴포넌트 안에서 호출해야 한다.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "등록 중..." : "실제로 등록"}
    </button>
  );
}

function Demo() {
  const [state, formAction] = useActionState<CreateState, FormData>(createPerson, {
    message: null,
    error: null,
  });

  return (
    <div>
      <form action={formAction} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input name="id" type="number" placeholder="id (직접 지정)" required style={{ width: 90 }} />
        <input name="name" placeholder="이름" required />
        <input name="age" type="number" placeholder="나이" required style={{ width: 70 }} />
        <input name="job" placeholder="직업" required />
        <SubmitButton />
      </form>
      {state.error && <p style={{ color: "#f87171", marginTop: 8 }}>{state.error}</p>}
      {state.message && <p style={{ color: "#4ade80", marginTop: 8 }}>{state.message}</p>}
    </div>
  );
}

render(<Demo />);
`;

export default function UseFormStatusPage() {
  return (
    <article>
      <h1>useFormStatus</h1>
      <p>
        <code>react-dom</code>에서 제공하는 훅으로, 가장 가까운 부모 <code>&lt;form&gt;</code>의
        제출 상태(<code>pending</code>, <code>data</code>, <code>method</code>, <code>action</code>)를
        읽는다. 중요한 제약: <strong>form을 렌더링하는 컴포넌트 자신이 아니라, 그 form의 자식
        컴포넌트에서만</strong> 값이 채워진다. 그래서 보통 제출 버튼을 별도 컴포넌트로 분리해
        어디서든 재사용한다.
      </p>

      <section>
        <h2>직접 해보기 — 제출 버튼 상태</h2>
        <p className="hint">
          useActionState 페이지와 같은 <code>/api/people</code> 등록 폼을 재사용했다 — 실제
          네트워크 요청이 걸리는 동안 <code>SubmitButton</code>이 <code>pending</code> 상태를
          정확히 반영하는지 확인해보세요.
        </p>
        <Playground code={demoCode} scope={{ useActionState, useFormStatus }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>

        <CodeBlock
          title="1. 제출 중인 데이터 미리 보여주기 (data)"
          code={`
function PendingHint() {
  const { pending, data } = useFormStatus();
  if (!pending) return null;
  return <p>전송 중: {data?.get("message")}</p>;
}

<form action={formAction}>
  <input name="message" />
  <SubmitButton />
  <PendingHint />
</form>
`}
        />

        <CodeBlock
          title="2. 여러 소비자 컴포넌트가 동시에 상태를 공유"
          code={`
function FormButtons() {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" disabled={pending}>제출</button>
      <button type="reset" disabled={pending}>초기화</button>
    </>
  );
}
`}
        />
      </section>
    </article>
  );
}
