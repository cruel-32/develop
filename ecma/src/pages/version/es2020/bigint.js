import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
console.log(Number.MAX_SAFE_INTEGER);           // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);        // 9007199254740992 (아직 맞음)
console.log(Number.MAX_SAFE_INTEGER + 2);        // 9007199254740992 — 틀림! 정밀도 손실
console.log(9007199254740993 === 9007199254740992); // true — 두 값이 구분되지 않는다
`;

const AFTER = `
const big1 = 9007199254740993n; // 숫자 뒤 n을 붙이면 BigInt 리터럴
const big2 = BigInt("9007199254740993"); // 또는 함수 호출
console.log(big1 === big2);

console.log(big1 + 10n); // BigInt끼리는 임의 정밀도 정수 연산
console.log(2n ** 100n); // Number로는 절대 정확히 표현 못하는 큰 수

try {
  console.log(1n + 1); // TypeError — BigInt와 Number는 섞어 쓸 수 없다
} catch (err) {
  console.log(err.message);
}

console.log(1n + BigInt(1)); // 섞어 쓰려면 명시적으로 변환해야 한다
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>BigInt <span class="badge">ES2020</span></h1>
      <p>
        JS의 <code>Number</code>는 IEEE 754 배정밀도 부동소수점이라, 안전하게 표현 가능한
        정수 범위가 <code>±(2^53 - 1)</code>로 제한됩니다. 이 범위를 넘으면 서로 다른 정수가
        같은 값으로 뭉개지는 정밀도 손실이 생깁니다.
      </p>

      <h2 id="before">Number의 정밀도 한계</h2>
      ${codeBlock(BEFORE, "MAX_SAFE_INTEGER를 넘는 순간 부정확해진다")}

      <h2 id="after">BigInt</h2>
      <p>
        <code>BigInt</code>는 <code>Number</code>와 별개의 원시 타입으로, 리터럴 끝에
        <code>n</code>을 붙이거나 <code>BigInt(...)</code> 함수로 만듭니다. 임의 정밀도 정수
        연산이 가능하지만, <code>Number</code>와 자동으로 섞이지 않고 <code>===</code>도 서로
        다른 타입이라 항상 <code>false</code>입니다.
      </p>
      ${codeBlock(AFTER, "BigInt 리터럴과 연산")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>typeof 10n</code>이 무엇을 반환하는지, 그리고 <code>10n == 10</code>(느슨한
        비교)과 <code>10n === 10</code>(엄격한 비교)의 결과가 각각 어떻게 다른지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2020",
    code: AFTER,
  });
};
