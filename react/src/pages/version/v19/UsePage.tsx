import { createContext, use, Suspense, useState } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const promiseDemoCode = `
// CRUD Demo와 같은 실제 /api/people/:id를 호출한다.
function fetchPersonInfo(id: number): Promise<string> {
  return fetch(\`/api/people/\${id}\`).then((res) => {
    if (!res.ok) throw new Error(\`id \${id}인 사람을 찾을 수 없습니다.\`);
    return res.json();
  }).then((person) => \`\${person.name} (\${person.age}세, \${person.job})\`);
}

function PersonInfo({ resource }: { resource: Promise<string> }) {
  // use()는 Promise를 넘기면 resolve될 때까지 가장 가까운 <Suspense>를 보여준다.
  const info = use(resource);
  return <p style={{ color: "#4ade80" }}>{info}</p>;
}

function Demo() {
  const [id, setId] = useState<string>("1");
  const [resource, setResource] = useState<Promise<string>>(() => fetchPersonInfo(1));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setId(e.target.value)}
          placeholder="사람 id"
          style={{ width: 80 }}
        />
        <button onClick={() => setResource(fetchPersonInfo(Number(id)))}>실제 API로 조회</button>
      </div>
      <Suspense fallback={<p style={{ color: "#94a3b8" }}>로딩 중...</p>}>
        <PersonInfo resource={resource} />
      </Suspense>
    </div>
  );
}

render(<Demo />);
`;

const contextDemoCode = `
const ThemeContext = createContext<"light" | "dark">("light");

function ThemedBox({ show }: { show: boolean }) {
  if (!show) {
    return <p style={{ color: "#94a3b8" }}>체크박스를 켜면 컨텍스트 값을 조건부로 읽어옵니다.</p>;
  }
  // useContext와 달리 use()는 if 안에서, 즉 조건부로 호출할 수 있다.
  const theme = use(ThemeContext);
  return <p style={{ color: "#4ade80" }}>현재 테마 컨텍스트 값: {theme}</p>;
}

function Demo() {
  const [show, setShow] = useState<boolean>(false);
  return (
    <ThemeContext.Provider value="dark">
      <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={show}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShow(e.target.checked)}
        />
        조건 활성화
      </label>
      <ThemedBox show={show} />
    </ThemeContext.Provider>
  );
}

render(<Demo />);
`;

export default function UsePage() {
  return (
    <article>
      <h1>use</h1>
      <p>
        React 19에서 새로 추가된 API로, 다른 훅과 달리 <strong>조건문이나 반복문 안에서도 호출할
        수 있다</strong>. 두 가지 리소스를 읽을 수 있는데, 하나는 <strong>Promise</strong>(resolve될
        때까지 컴포넌트를 suspend시킴), 다른 하나는 <strong>Context</strong>(useContext처럼 값을
        읽되 조건부 호출이 허용됨)다.
      </p>

      <section>
        <h2>직접 해보기 1 — Promise 읽기</h2>
        <p className="hint">
          CRUD Demo와 같은 <code>/api/people/:id</code>를 실제로 호출합니다. 존재하는 id(예:
          1~12)를 넣으면 정보가 표시되고, 존재하지 않는 id를 넣으면 에러가 나는 것도
          확인해보세요(에러는 콘솔 패널에 표시되고 페이지는 멀쩡합니다).
        </p>
        <Playground code={promiseDemoCode} scope={{ use, Suspense, useState }} />
      </section>

      <section>
        <h2>직접 해보기 2 — 조건부로 Context 읽기</h2>
        <p className="hint">
          <code>use(ThemeContext)</code> 호출이 <code>if</code> 문 안에 있다는 점에 주목하세요.
          <code>useContext</code>였다면 문법 오류입니다.
        </p>
        <Playground code={contextDemoCode} scope={{ use, useState, createContext }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>

        <CodeBlock
          title="1. Promise 캐싱 패턴 (권장) — 매 렌더마다 새 Promise를 만들지 않기"
          code={`
interface User {
  id: string;
  name: string;
}

const cache = new Map<string, Promise<User>>();

function getUser(id: string): Promise<User> {
  if (!cache.has(id)) {
    cache.set(id, fetch(\`/api/users/\${id}\`).then((r) => r.json() as Promise<User>));
  }
  return cache.get(id)!; // 같은 id면 동일한 Promise 인스턴스를 재사용
}

function Profile({ id }: { id: string }) {
  const user = use(getUser(id));
  return <p>{user.name}</p>;
}
`}
        />

        <CodeBlock
          title="2. 반복문 안에서 여러 Context를 조건부로 읽기"
          code={`
function Panels({ visiblePanelKeys }: { visiblePanelKeys: string[] }) {
  return visiblePanelKeys.map((key) => {
    if (!PanelContexts[key]) return null;
    // 훅 규칙(항상 같은 순서로 호출)에 얽매이지 않고 배열 순회 중 호출 가능
    const value = use(PanelContexts[key]);
    return <Panel key={key} value={value} />;
  });
}
`}
        />
      </section>
    </article>
  );
}
