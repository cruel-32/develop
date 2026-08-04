import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var nested = [1, [2, 3], [4, [5, 6]]];

// 한 단계만 평탄화하는 흔한 우회
var flat1 = [].concat.apply([], nested);
console.log(flat1); // [1, 2, 3, 4, [5, 6]]

var words = ["hello world", "foo bar"];
var allWords = [];
words.forEach(function (s) {
  s.split(" ").forEach(function (w) { allWords.push(w); });
});
console.log(allWords);
`;

const AFTER = `
const nested = [1, [2, 3], [4, [5, 6]]];

console.log(nested.flat());        // 깊이 1: [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2));       // 깊이 2: [1, 2, 3, 4, 5, 6]
console.log(nested.flat(Infinity)); // 완전 평탄화

const words = ["hello world", "foo bar"];
const allWords = words.flatMap((s) => s.split(" ")); // map 후 flat(1)을 한 번에
console.log(allWords);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Array.flat / flatMap <span class="badge">ES2019</span></h1>
      <p>
        중첩 배열을 평탄화(flatten)하거나, "각 요소를 배열로 변환한 뒤 합치는" 패턴은
        <code>concat.apply</code> 트릭이나 이중 <code>forEach</code>로 직접 구현해야 했습니다.
      </p>

      <h2 id="before">concat.apply 트릭 / 이중 반복</h2>
      ${codeBlock(BEFORE, "concat.apply([], arr) 로 흉내 낸 평탄화")}

      <h2 id="after">flat / flatMap</h2>
      <p>
        <code>arr.flat(depth)</code>는 지정한 깊이만큼 중첩 배열을 평탄화합니다(기본값 1,
        <code>Infinity</code>로 완전 평탄화). <code>arr.flatMap(fn)</code>은
        <code>map(fn).flat(1)</code>과 같지만 중간 배열을 만들지 않아 더 효율적입니다.
      </p>
      ${codeBlock(AFTER, "flat / flatMap")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>flatMap</code>의 콜백에서 조건에 따라 빈 배열 <code>[]</code>을 반환하면 그
        요소가 결과에서 사라지는 것을 이용해, 배열을 "필터링하면서 변환"하는 예제를
        만들어보세요 (map + filter를 한 번에).
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2019",
    code: AFTER,
  });
};
