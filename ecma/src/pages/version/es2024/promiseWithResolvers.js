import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function createDeferred() {
  var resolve, reject;
  var promise = new Promise(function (res, rej) {
    resolve = res; // executor 밖으로 resolve/reject를 "탈출"시키는 흔한 트릭
    reject = rej;
  });
  return { promise: promise, resolve: resolve, reject: reject };
}

var deferred = createDeferred();
someEventEmitter.on("done", function (value) { deferred.resolve(value); });
someEventEmitter.on("error", function (err) { deferred.reject(err); });
`;

const AFTER = `
// Promise.withResolvers()는 위 "deferred 패턴"을 표준 API로 제공한다
const { promise, resolve, reject } = Promise.withResolvers();

function fakeEventEmitter(shouldFail) {
  setTimeout(() => {
    if (shouldFail) reject(new Error("이벤트 처리 실패"));
    else resolve("이벤트 완료됨");
  }, 30);
}

fakeEventEmitter(false);
promise.then((v) => console.log("resolve:", v)).catch((e) => console.log("reject:", e.message));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>Promise.withResolvers <span class="badge">ES2024</span></h1>
      <p>
        이벤트 콜백처럼 executor 함수 바깥에서 <code>resolve</code>/<code>reject</code>를
        호출해야 하는 상황("deferred 패턴")은 아주 흔했지만, 표준 API가 없어 매번
        <code>resolve</code>/<code>reject</code> 변수를 <code>new Promise(...)</code> 콜백
        밖으로 직접 탈출시키는 보일러플레이트 함수를 각자 만들어 썼습니다.
      </p>

      <h2 id="before">직접 만든 deferred 헬퍼</h2>
      ${codeBlock(BEFORE, "resolve/reject를 executor 밖으로 탈출시키는 트릭")}

      <h2 id="after">Promise.withResolvers()</h2>
      <p>
        <code>Promise.withResolvers()</code>는
        <code>{ promise, resolve, reject }</code>를 한 번에 반환하는 표준 API로, 위 패턴을
        언어 차원에서 제공합니다. 더 이상 직접 헬퍼 함수를 구현하거나 라이브러리에 의존할
        필요가 없습니다.
      </p>
      ${codeBlock(AFTER, "Promise.withResolvers()")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        아주 최근(2024년) 표준화된 기능이라 오래된 브라우저에서는 지원되지 않을 수 있습니다.
        <code>fakeEventEmitter(true)</code>로 바꿔 <code>reject</code> 경로가 잘 동작하는지도
        확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2024",
    code: AFTER,
  });
};
