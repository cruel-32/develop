import { useEffect, useInsertionEffect, useLayoutEffect, useState } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
function OrderDemo() {
  const [count, setCount] = useState(0);

  useInsertionEffect(() => {
    console.log("1) useInsertionEffect 실행 — CSS 주입은 여기서");
  });
  useLayoutEffect(() => {
    console.log("2) useLayoutEffect 실행 — 레이아웃을 동기적으로 읽고 써야 할 때");
  });
  useEffect(() => {
    console.log("3) useEffect 실행 — 대부분의 일반적인 부수효과");
  });

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>리렌더 트리거 ({count})</button>
      <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
        오른쪽 콘솔 패널에서 항상 1 → 2 → 3 순서로 찍히는 걸 확인해보세요.
      </p>
    </div>
  );
}

render(<OrderDemo />);
`;

export default function UseInsertionEffectPage() {
  return (
    <article>
      <h1>useInsertionEffect</h1>
      <p>
        React 18에서 추가된 훅으로, 세 effect 훅 중 <strong>가장 먼저</strong> 실행된다
        (<code>useInsertionEffect</code> → <code>useLayoutEffect</code> → <code>useEffect</code>{" "}
        순서). 유일한 용도는 <strong>CSS-in-JS 라이브러리 작성자</strong>가 DOM에 스타일을
        주입하는 것 — 브라우저가 레이아웃을 계산하기 전에 <code>&lt;style&gt;</code> 태그를
        넣어야 <code>useLayoutEffect</code>에서 잘못된(스타일 적용 전) 레이아웃 값을 읽는 문제를
        피할 수 있다.
      </p>
      <p className="hint">
        일반적인 앱 코드에서는 거의 쓸 일이 없다. styled-components, emotion 같은 라이브러리
        내부에서 이미 이 훅을 사용하고 있으므로, 이런 라이브러리를 그냥 가져다 쓰는 입장이라면
        직접 호출할 필요는 없다.
      </p>

      <section>
        <h2>직접 해보기 — 세 effect의 실행 순서</h2>
        <p className="hint">
          버튼을 눌러 리렌더를 발생시키고, 오른쪽 콘솔 패널에 찍히는 순서를 확인해보세요.
          <code>console.log</code> 호출 순서를 바꾸거나 훅을 하나 지워보며 실험해도 좋습니다.
        </p>
        <Playground
          code={demoCode}
          scope={{ useState, useInsertionEffect, useLayoutEffect, useEffect }}
        />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>
        <CodeBlock
          title="1. CSS-in-JS 라이브러리 내부에서의 전형적인 사용"
          code={`
function useCSS(rule: string) {
  useInsertionEffect(() => {
    if (!document.head.querySelector(\`[data-rule="\${rule}"]\`)) {
      const style = document.createElement("style");
      style.setAttribute("data-rule", rule);
      style.textContent = rule;
      document.head.appendChild(style);
    }
  });
}
`}
        />
      </section>
    </article>
  );
}
