import { useState, useTransition } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
function SlowItem({ text }: { text: string }) {
  // 실제 앱의 "무거운 렌더링"을 흉내내기 위해 일부러 각 항목을 살짝 느리게 만든다.
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
  const [displayQuery, setDisplayQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [transitionOn, setTransitionOn] = useState<boolean>(true);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value); // 입력창 값은 항상 즉시(긴급) 갱신
    if (transitionOn) {
      startTransition(() => setDisplayQuery(value)); // 느린 목록 갱신은 급하지 않다고 표시
    } else {
      setDisplayQuery(value); // transition 없이 같은 커밋에서 처리 -> 타이핑이 버벅일 수 있음
    }
  }

  return (
    <div>
      <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={transitionOn}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransitionOn(e.target.checked)}
        />
        useTransition 사용 (꺼보면 타이핑이 버벅이는 걸 느낄 수 있어요)
      </label>
      <input value={query} onChange={handleChange} placeholder="숫자 입력 (0~199 포함 검색)" />
      {isPending && <p style={{ color: "#facc15", margin: "4px 0" }}>업데이트 중...</p>}
      <SlowList query={displayQuery} />
    </div>
  );
}

render(<Demo />);
`;

export default function UseTransitionPage() {
  return (
    <article>
      <h1>useTransition</h1>
      <p>
        React 18에서 추가된 훅으로, 상태 업데이트를 <strong>긴급(urgent)</strong>과{" "}
        <strong>비긴급(transition)</strong>으로 구분할 수 있게 해준다. 타이핑, 클릭 같은 즉각
        반응이 필요한 업데이트는 그대로 두고, 화면 전체를 다시 그리는 무거운 업데이트는
        transition으로 표시하면 React가 더 급한 업데이트를 먼저 처리하고 중단·재시작할 수 있다.
      </p>
      <p>
        시그니처: <code>const [isPending, startTransition] = useTransition()</code>.{" "}
        <code>startTransition(callback)</code> 안에서 호출한 상태 업데이트는 낮은 우선순위로
        처리되고, 진행 중일 때 <code>isPending</code>이 <code>true</code>가 된다.
      </p>

      <section>
        <h2>직접 해보기 — 무거운 목록 필터링</h2>
        <p className="hint">
          200개 항목이 각각 살짝 느리게 렌더링되도록 만들었습니다. 체크박스를 꺼서
          <code>useTransition</code> 없이 입력했을 때와 비교해보세요.
        </p>
        <Playground code={demoCode} scope={{ useState, useTransition }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>
        <CodeBlock
          title="1. 탭 전환 — 무거운 탭으로 이동해도 클릭 반응은 즉시"
          code={`
type Tab = "about" | "posts";

function TabContainer() {
  const [tab, setTab] = useState<Tab>("about");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: Tab) {
    startTransition(() => {
      setTab(nextTab); // PostsTab이 무거워도 탭 버튼 자체는 바로 눌린 것처럼 반응한다
    });
  }

  return (
    <>
      <button onClick={() => selectTab("about")}>About</button>
      <button onClick={() => selectTab("posts")}>Posts (무거움)</button>
      {isPending && <Spinner />}
      {tab === "about" ? <AboutTab /> : <PostsTab />}
    </>
  );
}
`}
        />
      </section>
    </article>
  );
}
