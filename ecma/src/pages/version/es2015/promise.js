import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function loadUser(id, onSuccess, onError) {
  fakeFetch("/users/" + id, function (err, user) {
    if (err) return onError(err);
    fakeFetch("/orders/" + user.id, function (err2, orders) {
      if (err2) return onError(err2);
      onSuccess({ user: user, orders: orders });
    });
  });
}
// 콜백이 중첩될수록 들여쓰기가 계속 깊어진다 ("콜백 지옥")
`;

const AFTER = `
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadUser(id) {
  return delay(100, { id, name: "Ada" })
    .then((user) => delay(50, { user, orders: [1, 2, 3] }))
    .then((result) => {
      console.log("불러온 결과:", result);
      return result;
    });
}

loadUser(1).catch((err) => console.error("실패:", err));

Promise.all([delay(30, "a"), delay(10, "b")]).then((values) => {
  console.log("Promise.all:", values);
});
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Promise <span class="badge">ES2015</span></h1>
      <p>
        비동기 작업을 콜백 함수로만 처리하면, 작업이 이어질수록 콜백 안에 콜백이 중첩되는
        "콜백 지옥"이 생기고 에러 처리도 각 콜백마다 따로 해야 했습니다.
      </p>

      <h2 id="before">콜백 기반 비동기</h2>
      ${codeBlock(BEFORE, "콜백 중첩")}

      <h2 id="after">Promise로 체이닝</h2>
      <p>
        <code>Promise</code>는 미래에 완료될 값을 나타내는 객체로, <code>.then()</code>으로
        성공 시 후속 작업을, <code>.catch()</code>로 실패 처리를 한 번만 연결하면 됩니다.
        여러 비동기 작업을 동시에 실행하고 모두 끝나길 기다리려면 <code>Promise.all()</code>을
        씁니다.
      </p>
      ${codeBlock(AFTER, "Promise 체이닝 + Promise.all")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>delay</code> 하나가 실패하도록 <code>reject(...)</code>를 호출하는 Promise를
        만들어 <code>Promise.all</code>에 섞어보고, 전체가 바로 실패로 끝나는지 확인해보세요.
        (ES2020의 <code>Promise.allSettled</code>는 이 문제를 다르게 다룹니다 — 해당 페이지 참고)
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2015",
    code: AFTER,
  });
};
