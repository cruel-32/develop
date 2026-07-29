import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
var admins = new Set(["ada", "grace", "linus"]);
var onlineUsers = new Set(["grace", "linus", "torvalds"]);

// Set끼리 교집합/합집합/차집합을 구하려면 배열로 변환해서 직접 계산해야 했다
var intersection = new Set([...admins].filter((x) => onlineUsers.has(x)));
var union = new Set([...admins, ...onlineUsers]);
var difference = new Set([...admins].filter((x) => !onlineUsers.has(x)));

console.log(intersection, union, difference);
`;

const AFTER = `
const admins = new Set(["ada", "grace", "linus"]);
const onlineUsers = new Set(["grace", "linus", "torvalds"]);

console.log(admins.intersection(onlineUsers)); // 온라인인 관리자
console.log(admins.union(onlineUsers));        // 관리자이거나 온라인인 사람
console.log(admins.difference(onlineUsers));   // 관리자인데 오프라인인 사람
console.log(admins.symmetricDifference(onlineUsers)); // 둘 중 한쪽에만 있는 사람

console.log(admins.isSubsetOf(new Set(["ada", "grace", "linus", "torvalds"])));
console.log(admins.isDisjointFrom(new Set(["torvalds"])));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Set 메서드 (union / intersection 등) <span class="badge">ES2025</span></h1>
      <p>
        <code>Set</code>은 ES2015부터 있었지만 집합 연산(합집합, 교집합, 차집합 등)은 표준
        메서드가 없어서 배열로 바꾼 뒤 <code>filter</code>/스프레드로 직접 계산해야 했습니다.
      </p>

      <h2 id="before">배열 변환 + filter로 직접 계산</h2>
      ${codeBlock(BEFORE, "[...set].filter(...) 로 집합 연산 흉내")}

      <h2 id="after">Set의 집합 연산 메서드</h2>
      <p>
        <code>union</code>, <code>intersection</code>, <code>difference</code>,
        <code>symmetricDifference</code>, <code>isSubsetOf</code>, <code>isSupersetOf</code>,
        <code>isDisjointFrom</code> — 수학의 집합 연산이 <code>Set</code>의 메서드로 바로
        제공됩니다.
      </p>
      ${codeBlock(AFTER, "Set.prototype.union / intersection 등")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        2025년에 표준화된 아주 최신 기능이라, 사용 중인 브라우저 버전에 따라 아직 지원되지
        않을 수 있습니다(대략 Chrome/Edge 122+, Firefox 127+, Safari 17+ 정도부터 지원).
        <code>TypeError: admins.intersection is not a function</code>이 뜬다면 그 때문입니다
        — 브라우저를 최신 버전으로 업데이트해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2025",
    code: AFTER,
  });
};
