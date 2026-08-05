import { useId, useState } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
function PasswordField({ label }: { label: string }) {
  const id = useId(); // 이 컴포넌트 인스턴스마다 고유하고, 리렌더돼도 값이 바뀌지 않는 id
  return (
    <div style={{ marginBottom: 8 }}>
      <label htmlFor={id}>{label}: </label>
      <input id={id} type="password" />
      <div style={{ fontSize: 12, color: "#94a3b8" }}>id = {id}</div>
    </div>
  );
}

function Demo() {
  const [tick, setTick] = useState<number>(0);
  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>리렌더 트리거 ({tick})</button>
      <PasswordField label="비밀번호" />
      <PasswordField label="비밀번호 확인" />
    </div>
  );
}

render(<Demo />);
`;

export default function UseIdPage() {
  return (
    <article>
      <h1>useId</h1>
      <p>
        React 18에서 추가된 훅으로, 접근성 속성(<code>htmlFor</code>/<code>id</code>,{" "}
        <code>aria-describedby</code> 등)에 쓸 <strong>고유하고 안정적인 id</strong>를
        만들어준다. 컴포넌트가 여러 번 렌더링되는 재사용 컴포넌트(폼 필드 등)에서 id를
        하드코딩하면 중복되고, <code>Math.random()</code>이나 카운터로 만들면 서버/클라이언트
        렌더링 결과가 어긋날 수 있는데, <code>useId</code>는 이 두 문제를 모두 해결한다.
      </p>
      <p>
        <strong>주의</strong>: 리스트의 key로 쓰면 안 된다. key는 데이터의 정체성을 나타내야
        하는데, <code>useId</code>는 컴포넌트 트리 안에서의 위치를 나타낼 뿐이다.
      </p>

      <section>
        <h2>직접 해보기 — 재사용 가능한 폼 필드</h2>
        <p className="hint">
          두 <code>PasswordField</code>가 서로 다른 id를 갖는지, &quot;리렌더 트리거&quot;를
          눌러도 id가 그대로인지 확인해보세요.
        </p>
        <Playground code={demoCode} scope={{ useId, useState }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>
        <CodeBlock
          title="1. 여러 접근성 속성을 하나의 id에서 파생시키기"
          code={`
function Field({ label, hint }: { label: string; hint: string }) {
  const id = useId();
  const hintId = \`\${id}-hint\`;

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={hintId} />
      <p id={hintId}>{hint}</p>
    </>
  );
}
`}
        />
      </section>
    </article>
  );
}
