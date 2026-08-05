import { mountEcmaPlayground } from "../../../ecmaPlayground";
import { codeBlock } from "../../../pageHelpers";

const BEFORE = `
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function loadAllPages(pages) {
  var results = [];
  var p = Promise.resolve();
  pages.forEach(function (page) {
    p = p.then(function () {
      return delay(20, "page-" + page + " 데이터");
    }).then(function (data) {
      results.push(data);
      console.log("받음:", data);
    });
  });
  return p.then(function () { return results; });
}
`;

const AFTER = `
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 비동기 제너레이터: 값을 하나씩 "비동기로" 만들어내는 이터러블
async function* fetchPages(pages) {
  for (const page of pages) {
    const data = await delay(20, \`page-\${page} 데이터\`);
    yield data;
  }
}

async function loadAllPages(pages) {
  const results = [];
  for await (const data of fetchPages(pages)) {
    console.log("받음:", data);
    results.push(data);
  }
  return results;
}

loadAllPages([1, 2, 3]).then((r) => console.log("전체:", r));
`;

/** @type {import("../../../router").PageRender} */
export const render = (container) => {
  container.innerHTML = `
    <article>
      <h1>비동기 반복 (for await...of) <span class="badge">ES2018</span></h1>
      <p>
        페이지네이션 API처럼 "비동기로 하나씩 값이 나오는" 시퀀스를 처리하려면 Promise 체인을
        수동으로 이어붙이며 순서를 맞춰야 했습니다.
      </p>

      <h2 id="before">수동 Promise 체이닝</h2>
      ${codeBlock(BEFORE, "reduce처럼 Promise를 직접 이어붙이기")}

      <h2 id="after">async generator + for await...of</h2>
      <p>
        <code>async function*</code>로 정의하는 <strong>비동기 제너레이터</strong>는
        <code>yield</code>로 값을 하나씩 비동기로 내보내는 이터러블을 만듭니다. 이걸 소비하는
        쪽은 <code>for await (const x of iterable)</code>로 마치 동기 <code>for...of</code>처럼
        자연스럽게 순회할 수 있습니다.
      </p>
      ${codeBlock(AFTER, "async function* + for await...of")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        <code>fetchPages</code> 안에서 특정 페이지일 때 <code>throw new Error(...)</code>를
        던져보고, 바깥 <code>for await</code>를 <code>try/catch</code>로 감싸면 어떻게
        전파되는지 확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountEcmaPlayground(container.querySelector("#playground-slot"), {
    badge: "ES2018",
    code: AFTER,
  });
};
