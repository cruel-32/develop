import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
const roles = ["admin", "editor", "viewer"];

if (roles.indexOf("editor") !== -1) {
  console.log("editor 권한 있음");
}

const values = [1, NaN, 3];
console.log(values.indexOf(NaN)); // -1 — indexOf는 NaN을 못 찾는다 (=== 비교라서)
`;

const AFTER = `
const roles = ["admin", "editor", "viewer"];

if (roles.includes("editor")) {
  console.log("editor 권한 있음");
}

const values = [1, NaN, 3];
console.log(values.includes(NaN)); // true — includes는 SameValueZero 비교라서 NaN도 찾는다
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Array.prototype.includes <span class="badge">ES2016</span></h1>
      <p>
        배열에 특정 값이 있는지만 확인하고 싶을 때도 <code>indexOf(x) !== -1</code>처럼
        인덱스 비교로 우회해야 했습니다. 게다가 <code>indexOf</code>는 <code>===</code> 비교를
        쓰기 때문에 <code>NaN</code>은 절대 찾을 수 없다는 함정도 있었습니다.
      </p>

      <h2 id="before">indexOf로 우회</h2>
      ${codeBlock(BEFORE, "indexOf(x) !== -1")}

      <h2 id="after">includes</h2>
      <p>
        <code>Array.prototype.includes(value)</code>는 값이 있으면 <code>true</code>를 바로
        반환하고, <code>NaN</code>도 정상적으로 찾아냅니다(SameValueZero 알고리즘 사용).
      </p>
      ${codeBlock(AFTER, "includes")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>includes</code>의 두 번째 인자(fromIndex)를 음수로 넘겨 "뒤에서부터 n번째"부터
        검색하는 것도 실험해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2016",
    code: AFTER,
  });
};
