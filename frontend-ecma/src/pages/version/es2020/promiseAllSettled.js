import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function delay(ms, value, shouldFail) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (shouldFail ? reject(new Error(value + " 실패")) : resolve(value)), ms),
  );
}

// Promise.all은 하나라도 실패하면 즉시 그 실패로 전체가 끝나버린다 —
// 나머지 성공한 결과는 알 방법이 없다
Promise.all([delay(10, "A", false), delay(20, "B", true), delay(30, "C", false)])
  .then((values) => console.log("모두 성공:", values))
  .catch((err) => console.log("하나라도 실패하면 전체 실패:", err.message));
`;

const AFTER = `
function delay(ms, value, shouldFail) {
  return new Promise((resolve, reject) =>
    setTimeout(() => (shouldFail ? reject(new Error(value + " 실패")) : resolve(value)), ms),
  );
}

async function loadAll() {
  const results = await Promise.allSettled([
    delay(10, "A", false),
    delay(20, "B", true),
    delay(30, "C", false),
  ]);

  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("성공:", result.value);
    } else {
      console.log("실패:", result.reason.message);
    }
  }
}

loadAll();
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Promise.allSettled <span class="badge">ES2020</span></h1>
      <p>
        <code>Promise.all()</code>은 "전부 성공해야만 의미 있는" 작업(모든 파일을 다 읽어야
        진행 가능 등)에는 적합하지만, "실패한 것과 별개로 성공한 결과도 알고 싶다"는 경우엔
        하나의 실패가 나머지 결과를 모두 가려버리는 문제가 있었습니다.
      </p>

      <h2 id="before">Promise.all — 하나라도 실패하면 전체 실패</h2>
      ${codeBlock(BEFORE, "Promise.all")}

      <h2 id="after">Promise.allSettled — 성공/실패를 모두 알려준다</h2>
      <p>
        <code>Promise.allSettled()</code>는 절대 reject되지 않고, 각 Promise의 결과를
        <code>{ status: "fulfilled", value }</code> 또는
        <code>{ status: "rejected", reason }</code> 형태로 모아 알려줍니다. "여러 API를
        동시에 호출하고 성공한 것만 골라 쓰기" 같은 경우에 유용합니다.
      </p>
      ${codeBlock(AFTER, "Promise.allSettled")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>results.filter(r => r.status === "fulfilled").map(r => r.value)</code>로 성공한
        값만 뽑아내는 코드를 추가해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2020",
    code: AFTER,
  });
};
