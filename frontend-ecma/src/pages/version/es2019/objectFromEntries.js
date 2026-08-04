import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var entries = [["a", 1], ["b", 2], ["c", 3]];

var obj = {};
entries.forEach(function (pair) {
  obj[pair[0]] = pair[1];
});
console.log(obj);

var map = new Map([["x", 10], ["y", 20]]);
var fromMap = {};
map.forEach(function (value, key) { fromMap[key] = value; });
console.log(fromMap);
`;

const AFTER = `
const entries = [["a", 1], ["b", 2], ["c", 3]];
console.log(Object.fromEntries(entries));

const map = new Map([["x", 10], ["y", 20]]);
console.log(Object.fromEntries(map)); // Map도 바로 넘길 수 있다 (엔트리를 만드는 이터러블이면 OK)

// entries -> fromEntries 왕복으로 값 변환하기
const prices = { apple: 1200, banana: 800 };
const discounted = Object.fromEntries(
  Object.entries(prices).map(([name, price]) => [name, Math.round(price * 0.9)]),
);
console.log(discounted);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Object.fromEntries <span class="badge">ES2019</span></h1>
      <p>
        ES2017의 <code>Object.entries()</code>는 객체를 <code>[key, value]</code> 쌍의
        배열로 바꿔줬지만, 반대로(엔트리 배열에서 객체를 만드는) 방향은 없어서 직접
        <code>reduce</code>나 <code>forEach</code>로 객체를 조립해야 했습니다.
      </p>

      <h2 id="before">forEach로 직접 조립</h2>
      ${codeBlock(BEFORE, "forEach + 직접 대입")}

      <h2 id="after">Object.fromEntries</h2>
      <p>
        <code>Object.fromEntries(iterable)</code>는 <code>[key, value]</code> 쌍을 만들어내는
        모든 이터러블(배열, <code>Map</code> 등)을 객체로 변환합니다. <code>entries()</code> →
        <code>map()</code> → <code>fromEntries()</code> 조합은 "객체의 값들을 변환한 새 객체
        만들기"에 자주 쓰이는 패턴입니다.
      </p>
      ${codeBlock(AFTER, "Object.fromEntries + entries/map 왕복")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>Object.entries(prices).filter(...)</code>로 특정 조건(예: 가격이 1000 이상인
        것만)을 만족하는 항목만 추린 뒤 <code>Object.fromEntries</code>로 다시 객체를 만들어
        "객체 필터링"을 구현해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2019",
    code: AFTER,
  });
};
