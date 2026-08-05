import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var defaults = { theme: "light", pageSize: 20 };
var overrides = { pageSize: 50 };

var merged = Object.assign({}, defaults, overrides);
console.log(merged);

var person = { name: "Ada", age: 30, city: "London" };
var name = person.name;
var others = {};
for (var key in person) {
  if (key !== "name") others[key] = person[key];
}
console.log(name, others);
`;

const AFTER = `
const defaults = { theme: "light", pageSize: 20 };
const overrides = { pageSize: 50 };

const merged = { ...defaults, ...overrides }; // 뒤에 오는 값이 덮어쓴다
console.log(merged);

const person = { name: "Ada", age: 30, city: "London" };
const { name, ...others } = person; // 객체 구조분해에서 나머지 프로퍼티 모으기
console.log(name, others);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>객체 스프레드 / 레스트 프로퍼티 <span class="badge">ES2018</span></h1>
      <p>
        배열은 ES2015부터 <code>...</code> 스프레드/레스트를 쓸 수 있었지만, 객체는
        <code>Object.assign()</code>이나 <code>for...in</code> 반복으로 병합/분리해야
        했습니다.
      </p>

      <h2 id="before">Object.assign / for...in</h2>
      ${codeBlock(BEFORE, "Object.assign + 수동 반복")}

      <h2 id="after">객체 스프레드 / 레스트</h2>
      <p>
        <code>{ ...obj }</code>는 얕은 복사와 병합을, 구조분해의 <code>{ a, ...rest }</code>는
        나머지 프로퍼티를 새 객체로 모아줍니다. 배열 스프레드와 마찬가지로 얕은 복사라는 점은
        주의해야 합니다 — 중첩된 객체/배열은 참조가 그대로 공유됩니다.
      </p>
      ${codeBlock(AFTER, "객체 스프레드 / 레스트")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>merged</code>에 <code>{ ...merged, pageSize: undefined }</code>처럼 값을
        <code>undefined</code>로 덮어쓰면 실제로 어떻게 되는지, 그리고 중첩 객체를 스프레드한
        뒤 원본을 변경하면 복사본도 함께 바뀌는지(얕은 복사) 실험해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2018",
    code: AFTER,
  });
};
