import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
const square = Math.pow(4, 2);
const cube = Math.pow(4, 3);
console.log(square, cube);
`;

const AFTER = `
const square = 4 ** 2;
const cube = 4 ** 3;
console.log(square, cube);

// 우결합(right-associative): 2 ** 3 ** 2 는 2 ** (3 ** 2) = 2 ** 9
console.log(2 ** 3 ** 2);

let base = 2;
base **= 10; // 거듭제곱 할당 연산자
console.log(base);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>지수 연산자 ** <span class="badge">ES2016</span></h1>
      <p>
        거듭제곱을 계산하려면 <code>Math.pow(base, exponent)</code> 함수 호출이 유일한
        방법이었습니다.
      </p>

      <h2 id="before">Math.pow</h2>
      ${codeBlock(BEFORE, "Math.pow(base, exponent)")}

      <h2 id="after">** 연산자</h2>
      <p>
        <code>**</code>는 다른 언어(Python 등)에도 있는 익숙한 지수 연산자 문법이며,
        <code>**=</code> 복합 할당 연산자도 함께 추가되었습니다. 우결합이라는 점에 주의하세요.
      </p>
      ${codeBlock(AFTER, "** 연산자")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>(-2) ** 2</code>와 <code>-2 ** 2</code>를 각각 실행해보세요 — 후자는 실제로
        문법 에러(SyntaxError)입니다. 단항 <code>-</code> 뒤에 바로 <code>**</code>를 쓰는 것은
        모호해서 금지되어 있고, 반드시 괄호로 감싸야 합니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2016",
    code: AFTER,
  });
};
