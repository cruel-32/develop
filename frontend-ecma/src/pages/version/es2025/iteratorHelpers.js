import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function* naturalNumbers() {
  let n = 1;
  while (true) yield n++; // 무한 이터레이터
}

// 제너레이터가 만든 이터레이터에는 map/filter/take 같은 메서드가 없었다 —
// 배열로 통째로 바꾸는 건 무한 시퀀스라 불가능하고, 직접 반복하며 조합해야 했다
function takeMappedEvens(iterator, count) {
  var result = [];
  for (var value of iterator) {
    if (value % 2 === 0) {
      result.push(value * 10);
      if (result.length >= count) break;
    }
  }
  return result;
}

console.log(takeMappedEvens(naturalNumbers(), 3));
`;

const AFTER = `
function* naturalNumbers() {
  let n = 1;
  while (true) yield n++;
}

// 이터레이터 헬퍼: 배열 메서드처럼 이터레이터를 지연 평가로 조합할 수 있다
const result = naturalNumbers()
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .take(3)
  .toArray();

console.log(result);

// drop, flatMap, some, every, find, reduce 등도 동일하게 지원된다
const firstBigMultiple = naturalNumbers()
  .map((n) => n * 3)
  .find((n) => n > 100);
console.log(firstBigMultiple);
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>이터레이터 헬퍼 <span class="badge">ES2025</span></h1>
      <p>
        제너레이터/이터레이터는 무한 시퀀스도 표현할 수 있는 강력한 도구지만, 배열처럼
        <code>.map()</code>, <code>.filter()</code> 같은 메서드가 없어서 배열로 변환할 수
        없는(무한이거나 매우 큰) 경우엔 <code>for...of</code>로 직접 조합 로직을 짜야 했습니다.
      </p>

      <h2 id="before">for...of로 직접 조합</h2>
      ${codeBlock(BEFORE, "제너레이터를 직접 순회하며 필터+변환+제한을 한 번에 구현")}

      <h2 id="after">Iterator Helpers</h2>
      <p>
        모든 이터레이터(제너레이터가 만든 것 포함)는 이제 <code>.map()</code>,
        <code>.filter()</code>, <code>.take(n)</code>, <code>.drop(n)</code>,
        <code>.flatMap()</code>, <code>.reduce()</code>, <code>.toArray()</code> 등을 바로
        쓸 수 있습니다. 배열 메서드와 달리 <strong>지연 평가(lazy)</strong>라서 무한
        이터레이터에도 안전하게 <code>.take()</code>로 필요한 만큼만 꺼낼 수 있습니다.
      </p>
      ${codeBlock(AFTER, "제너레이터.filter().map().take().toArray()")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        2025년에 표준화된 아주 최신 기능이라, 사용 중인 브라우저 버전에 따라 아직 지원되지
        않을 수 있습니다. 지원되지 않으면 <code>naturalNumbers().filter is not a function</code>
        같은 에러가 콘솔에 나타납니다 — 그 경우 최신 Chrome/Edge/Firefox로 시도해보세요.
        <code>.take(3)</code>을 <code>.take(1000)</code>으로 바꾸면 지연 평가 덕분에도
        여전히 즉시 끝나는지(무한 시퀀스 전체를 미리 계산하지 않는다는 것) 살펴보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2025",
    code: AFTER,
  });
};
