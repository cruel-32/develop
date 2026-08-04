import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var logs = [
  { level: "info", msg: "start" },
  { level: "error", msg: "timeout" },
  { level: "info", msg: "retry" },
  { level: "error", msg: "connection lost" },
];

// 마지막 error 로그를 찾으려면 배열을 뒤집거나 역방향으로 직접 순회해야 했다
var lastError = null;
for (var i = logs.length - 1; i >= 0; i--) {
  if (logs[i].level === "error") {
    lastError = logs[i];
    break;
  }
}
console.log(lastError);
`;

const AFTER = `
const logs = [
  { level: "info", msg: "start" },
  { level: "error", msg: "timeout" },
  { level: "info", msg: "retry" },
  { level: "error", msg: "connection lost" },
];

const lastError = logs.findLast((log) => log.level === "error");
const lastErrorIndex = logs.findLastIndex((log) => log.level === "error");
console.log(lastError, lastErrorIndex);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>findLast / findLastIndex <span class="badge">ES2023</span></h1>
      <p>
        ES2015의 <code>find</code>/<code>findIndex</code>는 항상 앞에서부터 찾았습니다.
        "조건을 만족하는 마지막 요소"를 찾으려면 배열을 <code>reverse()</code>로 뒤집거나
        (원본이 바뀌는 부작용 위험), 인덱스를 거꾸로 도는 <code>for</code>문을 직접 써야
        했습니다.
      </p>

      <h2 id="before">역방향 for문으로 직접 순회</h2>
      ${codeBlock(BEFORE, "배열을 뒤에서부터 직접 순회")}

      <h2 id="after">findLast / findLastIndex</h2>
      <p>
        <code>arr.findLast(fn)</code>과 <code>arr.findLastIndex(fn)</code>은 배열을 뒤에서
        앞으로 검사하며 조건을 만족하는 첫 요소(즉, 원래 순서 기준 마지막 요소)와 그 인덱스를
        반환합니다. <code>find</code>/<code>findIndex</code>와 짝을 이루는 자연스러운 API입니다.
      </p>
      ${codeBlock(AFTER, "findLast / findLastIndex")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        조건을 만족하는 요소가 없을 때 <code>findLast</code>는 무엇을 반환하는지(힌트:
        <code>find</code>와 동일하게 <code>undefined</code>), <code>findLastIndex</code>는
        무엇을 반환하는지 실험해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2023",
    code: AFTER,
  });
};
