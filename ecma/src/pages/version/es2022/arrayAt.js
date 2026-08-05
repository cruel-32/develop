import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var items = ["a", "b", "c", "d"];

var last = items[items.length - 1]; // 배열 이름을 두 번 써야 했다
console.log(last);

var text = "hello";
var lastChar = text[text.length - 1];
console.log(lastChar);

// 음수 인덱스는 그냥 배열 인덱싱으로는 동작하지 않는다
console.log(items[-1]); // undefined — 기대와 다름
`;

const AFTER = `
const items = ["a", "b", "c", "d"];

console.log(items.at(-1));  // "d" — 뒤에서 첫 번째
console.log(items.at(-2));  // "c" — 뒤에서 두 번째
console.log(items.at(0));   // "a" — 양수는 일반 인덱싱과 동일

const text = "hello";
console.log(text.at(-1));   // "o" — 문자열에도 동일하게 사용 가능

// TypedArray에도 동일하게 지원된다
const nums = new Int32Array([10, 20, 30]);
console.log(nums.at(-1));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Array.at / String.at <span class="badge">ES2022</span></h1>
      <p>
        배열이나 문자열의 마지막 요소에 접근하려면 <code>arr[arr.length - 1]</code>처럼
        길이를 직접 계산해야 했고, <code>arr[-1]</code> 같은 음수 인덱스는 (Python 등과
        달리) 그냥 <code>undefined</code>를 반환할 뿐 "뒤에서부터"로 해석되지 않았습니다.
      </p>

      <h2 id="before">length - 1 계산 / 음수 인덱스의 함정</h2>
      ${codeBlock(BEFORE, "arr[arr.length - 1]")}

      <h2 id="after">.at(index)</h2>
      <p>
        <code>.at(index)</code>는 배열, 문자열, TypedArray에 모두 추가된 메서드로, 음수를
        넘기면 뒤에서부터 센 위치의 값을 반환합니다. <code>.at(-1)</code>은
        "마지막 요소"를 가장 짧고 명확하게 표현하는 관용구가 되었습니다.
      </p>
      ${codeBlock(AFTER, ".at(-1)로 마지막 요소 접근")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>items.at(-10)</code>처럼 범위를 벗어나는 인덱스를 넘기면 (일반 인덱싱처럼)
        <code>undefined</code>가 나오는지 확인해보세요 — 에러를 던지지 않습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2022",
    code: AFTER,
  });
};
