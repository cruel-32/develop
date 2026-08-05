import { useDeferredValue, useState } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
function SlowItem({ text }: { text: string }) {
  const start = performance.now();
  while (performance.now() - start < 1) {}
  return <li>{text}</li>;
}

function SlowList({ query }: { query: string }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 200; i++) {
    if (!query || String(i).includes(query)) items.push(<SlowItem key={i} text={"항목 " + i} />);
  }
  return (
    <ul style={{ maxHeight: 160, overflowY: "auto", margin: "8px 0 0", paddingLeft: 20 }}>
      {items}
    </ul>
  );
}

function Demo() {
  const [query, setQuery] = useState<string>("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder="숫자 입력 (0~199 포함 검색)"
      />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <SlowList query={deferredQuery} />
      </div>
    </div>
  );
}

render(<Demo />);
`;

export default function UseDeferredValuePage() {
  return (
    <article>
      <h1>useDeferredValue</h1>
      <p>
        React 18에서 추가된 훅으로, 값의 &quot;지연된 버전&quot;을 만들어준다. 입력창 같은 긴급한
        UI는 즉시 갱신하고, 그 값에 의존하는 무거운 렌더링은 한 박자 늦게 따라오게 해서 타이핑이
        버벅이지 않게 한다. <code>useTransition</code>과 목적은 비슷하지만, 이쪽은{" "}
        <strong>값</strong> 자체를 감싸는 방식이라 상태 갱신 함수를 직접 감쌀 수 없는 상황(예:
        props로 받은 값)에 더 잘 맞는다.
      </p>
      <p>
        시그니처: <code>const deferredValue = useDeferredValue(value)</code>. 무거운 렌더링이
        끝나기 전까지 <code>deferredValue</code>는 이전 값을 유지하고, <code>value !==
        deferredValue</code>로 &quot;오래된 결과를 보여주는 중&quot;임을 알 수 있다.
      </p>

      <section>
        <h2>직접 해보기 — 입력은 즉시, 목록은 살짝 늦게</h2>
        <p className="hint">
          타이핑하는 동안 입력창은 항상 즉각 반응하고, 아래 목록만 흐려졌다가(오래된 결과) 잠시
          후 갱신됩니다.
        </p>
        <Playground code={demoCode} scope={{ useDeferredValue, useState }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>
        <CodeBlock
          title="1. props로 받은 값을 지연시키기 (상태 갱신 함수에 접근할 수 없을 때)"
          code={`
function SearchResults({ query }: { query: string }) {
  // query는 부모가 주는 props라서 useTransition으로 감쌀 수 없다.
  // 대신 이 값 자체를 지연시킨다.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => search(deferredQuery), [deferredQuery]);
  return <ResultList results={results} />;
}
`}
        />
      </section>
    </article>
  );
}
