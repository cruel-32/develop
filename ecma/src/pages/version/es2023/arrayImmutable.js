import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var original = [3, 1, 2];

// sort/reverse는 원본을 직접 바꾼다 — 불변성을 지키려면 매번 복사부터 해야 했다
var sorted = original.slice().sort();
var reversed = original.slice().reverse();

var replaced = original.slice();
replaced[1] = 99;

console.log(original);  // 원본은 안전
console.log(sorted, reversed, replaced);
`;

const AFTER = `
const original = [3, 1, 2];

const sorted = original.toSorted();     // 정렬된 "새" 배열, 원본 불변
const reversed = original.toReversed(); // 뒤집힌 "새" 배열, 원본 불변
const replaced = original.with(1, 99);  // 인덱스 1만 바꾼 "새" 배열, 원본 불변

console.log("원본:", original);
console.log(sorted, reversed, replaced);

console.log(original === sorted); // false — 항상 새 배열
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>toSorted / toReversed / with <span class="badge">ES2023</span></h1>
      <p>
        <code>sort()</code>, <code>reverse()</code>, 인덱스 직접 대입(<code>arr[i] = x</code>)은
        모두 원본 배열을 <strong>제자리에서(in-place)</strong> 바꿉니다. React 등 불변성을
        기대하는 코드에서 실수로 원본을 건드리는 버그가 흔했고, 이를 피하려면 매번
        <code>slice()</code>로 미리 복사해야 했습니다.
      </p>

      <h2 id="before">복사 후 변형(slice + sort/reverse)</h2>
      ${codeBlock(BEFORE, "slice()로 미리 복사한 뒤 원본 변형 메서드 사용")}

      <h2 id="after">toSorted / toReversed / with — 불변 버전</h2>
      <p>
        <code>toSorted()</code>, <code>toReversed()</code>, <code>toSpliced()</code>,
        <code>with(index, value)</code>는 원본을 건드리지 않고 항상 <strong>새 배열</strong>을
        반환하는 불변 버전 메서드입니다. 복사 단계를 따로 신경 쓸 필요가 없어졌습니다.
      </p>
      ${codeBlock(AFTER, "toSorted / toReversed / with")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>original.toSpliced(1, 1, "x", "y")</code>(인덱스 1부터 1개를 제거하고 "x","y"를
        끼워 넣기)를 실행해서 <code>splice()</code>의 불변 버전이 어떻게 동작하는지, 그리고
        <code>original</code>이 여전히 그대로인지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2023",
    code: AFTER,
  });
};
