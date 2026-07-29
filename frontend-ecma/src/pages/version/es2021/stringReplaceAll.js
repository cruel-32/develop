import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var text = "2024-01-15";
console.log(text.replace(/-/g, "/")); // 정규식 + g 플래그가 필요했다

var text2 = "2024-01-15";
console.log(text2.replace("-", "/")); // replace(문자열, ...)은 첫 번째 매치만 바꾼다
`;

const AFTER = `
const text = "2024-01-15";
console.log(text.replaceAll("-", "/")); // 정규식 없이도 전체 치환

const csv = "a,b,,c";
console.log(csv.replaceAll(",", " | "));

// 여전히 정규식(g 플래그 필수)도 그대로 쓸 수 있다 — 패턴 매칭이 필요할 때
console.log(text.replaceAll(/\\d+/g, (match) => \`[\${match}]\`));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>String.prototype.replaceAll <span class="badge">ES2021</span></h1>
      <p>
        <code>String.replace(searchValue, replacement)</code>에 문자열을 넘기면 첫 번째로
        일치하는 부분만 바뀝니다. 문자열 전체에서 모두 바꾸려면 <code>/pattern/g</code>처럼
        전역 플래그가 있는 정규식을 만들어야 했습니다 — 단순 문자열 치환에도 정규식 특수문자
        이스케이프를 신경 써야 하는 번거로움이 있었습니다.
      </p>

      <h2 id="before">replace + 정규식(g 플래그)</h2>
      ${codeBlock(BEFORE, "replace(/pattern/g, ...) 로 우회")}

      <h2 id="after">replaceAll</h2>
      <p>
        <code>replaceAll(searchValue, replacement)</code>은 문자열을 그대로 넘기면 정규식
        없이도 일치하는 모든 부분을 바꿔줍니다. 패턴 매칭이 필요하면 여전히 <code>g</code>
        플래그가 있는 정규식도 넘길 수 있습니다(플래그가 없으면 <code>TypeError</code>).
      </p>
      ${codeBlock(AFTER, "replaceAll")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>text.replaceAll(/\\d+/, ...)</code>처럼 <code>g</code> 플래그를 빼고 실행해서
        <code>TypeError: replaceAll must be called with a global RegExp</code> 에러를
        직접 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2021",
    code: AFTER,
  });
};
