import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var count = 0;
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log("var i:", i); // 3, 3, 3 — 클로저가 공유하는 하나의 i
  }, 0);
}
`;

const AFTER = `
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log("let i:", i); // 0, 1, 2 — 반복마다 새 바인딩
  }, 0);
}

const MAX_RETRY = 3;
try {
  MAX_RETRY = 5; // TypeError: Assignment to constant variable.
} catch (err) {
  console.log(err.message);
}
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>let / const & 블록 스코프 <span class="badge">ES2015</span></h1>
      <p>
        ES5까지 변수 선언은 <code>var</code> 하나뿐이었고, <code>var</code>는 함수 스코프라
        블록({}) 안에서 선언해도 밖으로 값이 새어나가는 문제, 그리고 반복문 클로저가 마지막
        값 하나만 공유하는 문제가 흔했습니다.
      </p>

      <h2 id="before">var의 문제</h2>
      ${codeBlock(BEFORE, "var는 블록 스코프가 없고, 클로저가 i를 공유한다")}

      <h2 id="after">let / const로 블록 스코프</h2>
      <p>
        <code>let</code>과 <code>const</code>는 <strong>블록 스코프</strong>를 가지며, 반복문에서는
        매 반복마다 새로운 바인딩이 생깁니다. <code>const</code>는 재할당을 금지합니다
        (단, 객체/배열 내부 값 변경은 막지 않습니다 — "재할당 금지"이지 "불변"이 아닙니다).
      </p>
      ${codeBlock(AFTER, "let / const")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>const</code>로 선언한 객체의 프로퍼티는 바꿀 수 있는지, <code>let</code>을
        같은 스코프에서 두 번 선언하면 어떤 에러가 나는지 직접 바꿔서 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2015",
    code: AFTER,
  });
};
