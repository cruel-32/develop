import { useSyncExternalStore } from "react";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface Store<T> {
  getState: () => T;
  setState: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

// React 바깥에 있는 아주 단순한 pub-sub 스토어
function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (next: T) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const counterStore = createStore<number>(0);

function useExternalCounter(): number {
  // subscribe 함수와 현재 값을 읽는 함수만 넘기면, 이 값이 바뀔 때 React가 알아서 리렌더한다.
  return useSyncExternalStore(counterStore.subscribe, counterStore.getState);
}

function CounterDisplay() {
  const count = useExternalCounter();
  return <p style={{ color: "#4ade80" }}>외부 스토어 값: {count}</p>;
}

function CounterButton() {
  return (
    <button onClick={() => counterStore.setState(counterStore.getState() + 1)}>
      +1 (React 상태가 아니라 외부 스토어를 직접 변경)
    </button>
  );
}

function Demo() {
  return (
    <div>
      <CounterButton />
      <CounterDisplay />
    </div>
  );
}

render(<Demo />);
`;

export default function UseSyncExternalStorePage() {
  return (
    <article>
      <h1>useSyncExternalStore</h1>
      <p>
        React 18에서 추가된 훅으로, <strong>React 상태 관리 시스템 바깥에 있는 값</strong>(전역
        변수, 브라우저 API, 서드파티 스토어 등)을 안전하게 구독하기 위한 것이다. 동시성
        렌더링(concurrent rendering) 아래에서는 <code>useEffect</code>로 직접 구독을 흉내내면
        화면이 잠깐 어긋나는 tearing 문제가 생길 수 있는데, 이 훅은 그 문제를 프레임워크
        레벨에서 해결해준다.
      </p>
      <p>
        시그니처: <code>const value = useSyncExternalStore(subscribe, getSnapshot)</code>.{" "}
        <code>subscribe(callback)</code>은 값이 바뀔 때 <code>callback</code>을 호출하도록
        등록하고 구독 해제 함수를 반환해야 하고, <code>getSnapshot()</code>은 현재 값을
        동기적으로 반환해야 한다.
      </p>
      <p className="hint">
        이 훅은 보통 라이브러리 작성자가 쓴다 — 예를 들어 앞에서 배운{" "}
        <strong>Zustand</strong>도 내부적으로 <code>useSyncExternalStore</code>를 사용해서 각
        컴포넌트가 셀렉터로 고른 슬라이스만 안전하게 구독하게 만든다.
      </p>

      <section>
        <h2>직접 해보기 — React 밖의 스토어 직접 만들어보기</h2>
        <p className="hint">
          <code>CounterButton</code>은 React state가 아니라 평범한 JS 객체(<code>counterStore</code>)를
          직접 변경합니다. 그런데도 <code>CounterDisplay</code>가 정확히 리렌더되는 걸 확인해보세요.
        </p>
        <Playground code={demoCode} scope={{ useSyncExternalStore }} />
      </section>

      <section>
        <h2>다른 사용 패턴</h2>
        <CodeBlock
          title="1. 서버 렌더링 대비 초기값 지정 (세 번째 인자)"
          code={`
// 세 번째 인자는 서버 렌더링 시점의 스냅샷을 반환한다.
// (브라우저 전용 API는 서버에 존재하지 않으므로 안전한 기본값이 필요하다)
const isOnline = useSyncExternalStore(
  subscribeToOnlineStatus,
  () => navigator.onLine,
  () => true, // 서버에서는 일단 "온라인"으로 가정
);
`}
        />
      </section>
    </article>
  );
}
