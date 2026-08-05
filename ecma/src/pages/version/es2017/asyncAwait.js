import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadUserOrders(id) {
  return delay(50, { id, name: "Ada" })
    .then((user) => {
      return delay(30, ["order-1", "order-2"]).then((orders) => {
        return { user, orders };
      });
    })
    .catch((err) => {
      console.error("실패:", err);
      throw err;
    });
}
`;

const AFTER = `
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function loadUserOrders(id) {
  try {
    const user = await delay(50, { id, name: "Ada" });
    const orders = await delay(30, ["order-1", "order-2"]);
    return { user, orders };
  } catch (err) {
    console.error("실패:", err);
    throw err;
  }
}

loadUserOrders(1).then((result) => console.log("결과:", result));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>async / await <span class="badge">ES2017</span></h1>
      <p>
        Promise 체이닝은 콜백 지옥보다 훨씬 낫지만, 여러 비동기 작업을 순차적으로 엮거나
        조건 분기와 함께 쓰면 여전히 <code>.then()</code>이 계속 중첩됩니다.
      </p>

      <h2 id="before">Promise 체이닝</h2>
      ${codeBlock(BEFORE, ".then() 체이닝")}

      <h2 id="after">async / await</h2>
      <p>
        <code>async</code> 함수 안에서 <code>await</code>는 Promise가 완료될 때까지
        "기다리는 것처럼" 코드를 동기 코드와 같은 모양으로 쓸 수 있게 해줍니다. 내부적으로는
        여전히 Promise이고, <code>try/catch</code>로 자연스럽게 에러를 처리할 수 있습니다.
      </p>
      ${codeBlock(AFTER, "async / await + try/catch")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>delay</code> 중 하나를 <code>Promise.reject(new Error("실패!"))</code>로
        바꿔서 <code>catch</code> 블록이 잡아내는지 확인해보세요. 또한 두 <code>await</code>를
        <code>Promise.all([...])</code> + 하나의 <code>await</code>로 바꾸면 두 delay가
        순차가 아니라 동시에 실행되어 더 빨리 끝나는 것도 실험해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2017",
    code: AFTER,
  });
};
