import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
const prices = { apple: 1200, banana: 800, cherry: 5000 };

var keys = Object.keys(prices);
var values = [];
for (var i = 0; i < keys.length; i++) {
  values.push(prices[keys[i]]);
}
console.log(values);

for (var j = 0; j < keys.length; j++) {
  console.log(keys[j] + ": " + prices[keys[j]]);
}
`;

const AFTER = `
const prices = { apple: 1200, banana: 800, cherry: 5000 };

console.log(Object.values(prices)); // [1200, 800, 5000]

for (const [name, price] of Object.entries(prices)) {
  console.log(\`\${name}: \${price}\`);
}

const total = Object.values(prices).reduce((sum, p) => sum + p, 0);
console.log("합계:", total);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Object.entries / Object.values <span class="badge">ES2017</span></h1>
      <p>
        ES2015부터 <code>Object.keys()</code>는 있었지만, 값만 필요하거나 키-값 쌍을 함께
        순회하려면 <code>keys</code>를 얻은 뒤 직접 인덱스로 값을 다시 조회해야 했습니다.
      </p>

      <h2 id="before">Object.keys + 인덱스 조회</h2>
      ${codeBlock(BEFORE, "keys를 얻은 뒤 다시 값을 찾는 우회")}

      <h2 id="after">Object.entries / Object.values</h2>
      <p>
        <code>Object.values(obj)</code>는 값 배열을, <code>Object.entries(obj)</code>는
        <code>[key, value]</code> 쌍의 배열을 바로 반환합니다. <code>entries()</code>는
        구조분해와 함께 <code>for...of</code>에서 특히 자연스럽습니다.
      </p>
      ${codeBlock(AFTER, "Object.values / Object.entries")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Object.entries(prices)</code>의 결과를 <code>Object.fromEntries()</code>
        (ES2019)로 다시 객체로 되돌려보세요 — 이번 페이지의 실습창은 최신 브라우저이므로
        <code>fromEntries</code>도 이미 사용할 수 있습니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2017",
    code: AFTER,
  });
};
