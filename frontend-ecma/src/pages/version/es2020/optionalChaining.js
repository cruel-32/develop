import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function getCity(user) {
  return user && user.address && user.address.city
    ? user.address.city
    : "알 수 없음";
}

function getFirstOrder(user) {
  return user && user.orders && user.orders.length > 0 ? user.orders[0] : undefined;
}

function greet(user) {
  var name = (user && user.name) || "손님"; // 문제: name이 "" 이나 0이면 의도와 다르게 대체된다
  return "안녕하세요, " + name;
}
`;

const AFTER = `
function getCity(user) {
  return user?.address?.city ?? "알 수 없음";
}

function getFirstOrder(user) {
  return user?.orders?.[0]; // 배열 인덱스 접근에도 ?. 사용 가능
}

function callIfExists(user) {
  return user?.sendWelcomeEmail?.(); // 메서드 호출에도 사용 가능 — 함수가 없으면 undefined
}

function greet(user) {
  const name = user?.name ?? "손님"; // ??는 null/undefined일 때만 대체 ("", 0은 그대로 유지)
  return \`안녕하세요, \${name}\`;
}

console.log(getCity({ address: { city: "서울" } }));
console.log(getCity({}));
console.log(greet({ name: "" }));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>옵셔널 체이닝 / 널 병합 <span class="badge">ES2020</span></h1>
      <p>
        중첩된 객체의 깊은 프로퍼티에 접근할 때 중간 단계가 <code>null</code>/<code>undefined</code>일
        수 있으면, 매 단계를 <code>&amp;&amp;</code>로 확인해야 했습니다. 기본값을 줄 때 흔히
        쓰던 <code>||</code>도 <code>""</code>, <code>0</code>, <code>false</code>처럼 "값은
        있지만 falsy"인 경우까지 대체해버리는 함정이 있었습니다.
      </p>

      <h2 id="before">&amp;&amp; 체인 / || 기본값의 함정</h2>
      ${codeBlock(BEFORE, "user && user.address && user.address.city")}

      <h2 id="after">?. 옵셔널 체이닝 / ?? 널 병합</h2>
      <p>
        <code>?.</code>는 앞의 값이 <code>null</code>이나 <code>undefined</code>이면 즉시
        <code>undefined</code>를 반환하고 나머지 체인을 평가하지 않습니다. 프로퍼티 접근
        (<code>?.prop</code>), 배열 인덱스(<code>?.[0]</code>), 함수 호출(<code>?.()</code>)
        모두에 쓸 수 있습니다. <code>??</code>는 <code>null</code>/<code>undefined</code>일
        때만 오른쪽 값으로 대체하므로 <code>""</code>, <code>0</code>은 그대로 유지됩니다.
      </p>
      ${codeBlock(AFTER, "?. / ??")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>greet({ name: "" })</code>를 <code>||</code> 버전과 <code>??</code> 버전에서
        각각 실행해서 결과가 어떻게 다른지 비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2020",
    code: AFTER,
  });
};
