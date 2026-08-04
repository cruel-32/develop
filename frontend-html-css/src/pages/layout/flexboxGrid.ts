import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const FLOAT_HELL = `
/* Grid 이전, 2차원 레이아웃을 흉내내던 방식 */
.column { float: left; width: 33.333%; }
.row::after { content: ""; display: table; clear: both; } /* clearfix */
`;

const AUTO_FIT_GRID = `
.cards {
  display: grid;
  /* 컨테이너 너비에 맞춰 열 개수가 자동으로 늘고 주는, 미디어 쿼리 없는 반응형 그리드 */
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}
`;

const PLAYGROUND_HTML = `
<div class="toolbar">
  <button>저장</button>
  <button>취소</button>
  <span class="spacer"></span>
  <button>더보기</button>
</div>

<div class="cards">
  <div class="card">카드 1</div>
  <div class="card">카드 2</div>
  <div class="card">카드 3</div>
  <div class="card">카드 4</div>
  <div class="card">카드 5</div>
</div>
`;

const PLAYGROUND_CSS = `
/* Flexbox: 1차원(가로 한 줄) 정렬에 적합 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.toolbar .spacer {
  flex: 1; /* 남는 공간을 밀어내 "더보기"를 오른쪽으로 붙인다 */
}

.toolbar button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

/* Grid: 2차원(행+열) 배치에 적합. auto-fit + minmax로 반응형 카드 그리드 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.75rem;
}

.card {
  padding: 1.2rem;
  border-radius: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  text-align: center;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Flexbox vs Grid — 언제 무엇을</h1>
      <p>
        <code>float</code>과 <code>clearfix</code>로 레이아웃을 짜던 시절엔 2차원 배치가
        사실상 불가능에 가까웠습니다. Flexbox와 Grid는 각각 다른 문제를 풀도록 설계된
        두 개의 독립된 레이아웃 모드입니다 — 서로 대체재가 아니라 상호보완적입니다.
      </p>
      ${codeBlock(FLOAT_HELL, "이전: float + clearfix")}

      <h2 id="rule-of-thumb">한 줄 요약</h2>
      <p>
        <strong>Flexbox는 1차원</strong>(한 방향 — 가로 <em>또는</em> 세로) 정렬에,
        <strong>Grid는 2차원</strong>(가로 <em>와</em> 세로를 동시에) 배치에 적합합니다.
        툴바, 내비게이션 바처럼 한 줄에 아이템을 늘어놓고 정렬할 땐 Flexbox가 자연스럽고,
        카드 그리드나 페이지 전체 레이아웃(헤더/사이드바/본문/푸터)처럼 행과 열이 모두
        의미 있을 땐 Grid가 자연스럽습니다. 두 모드 모두 <code>gap</code> 속성을
        공유하므로 여백 계산을 위해 마지막 아이템에 <code>margin</code>을 빼주는 식의
        땜질이 필요 없습니다.
      </p>

      <h2 id="auto-fit">미디어 쿼리 없는 반응형 그리드</h2>
      <p>
        <code>grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr))</code>는
        컨테이너 너비를 보고 "최소 10rem은 보장하면서 들어갈 수 있는 만큼" 열 개수를
        자동으로 조절합니다. 화면 크기별로 열 개수를 하드코딩하는 미디어 쿼리 없이도
        반응형 카드 그리드가 완성됩니다.
      </p>
      ${codeBlock(AUTO_FIT_GRID, "auto-fit + minmax")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        프리뷰 너비를 넓혔다 좁혔다 하면서(브라우저 창 크기 조절) 카드 그리드의 열
        개수가 자동으로 바뀌는지 확인해보세요. CSS 탭에서 <code>.toolbar</code>의
        <code>display: flex</code>를 지우면 버튼들이 세로로 쌓이는 것도 비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
