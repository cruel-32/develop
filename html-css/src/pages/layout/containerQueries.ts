import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const MEDIA_VS_CONTAINER = `
/* @media: 뷰포트(브라우저 창) 크기만 본다 - 이 카드가 좁은 사이드바 안에 있어도
   화면 자체가 넓으면 "넓은 레이아웃"으로 그려진다 - 컴포넌트 재사용이 어려워짐 */
@media (min-width: 40rem) {
  .card { flex-direction: row; }
}

/* @container: "이 컴포넌트를 담고 있는 컨테이너"의 크기를 본다.
   같은 .card가 사이드바에 있든 본문에 있든, 실제로 배치된 공간 기준으로 반응한다 */
.card-wrapper { container-type: inline-size; }
@container (min-width: 24rem) {
  .card { flex-direction: row; }
}
`;

const FLUID_UNITS = `
/* clamp(최소, 선호값, 최대): 미디어 쿼리 없는 유동적(fluid) 폰트 크기 */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }

/* dvh: 모바일 주소창이 늘었다 줄었다 해도 실제 보이는 높이를 따라간다.
   기존 vh는 주소창이 사라지기 전 최대 높이 기준이라 스크롤이 살짝 밀리는 문제가 있었다 */
.hero { height: 100dvh; }
`;

const PLAYGROUND_HTML = `
<p class="resize-hint">↔ 아래 박스의 오른쪽 아래 모서리를 드래그해서 너비를 바꿔보세요</p>

<div class="resizable">
  <div class="card">
    <img src="https://placehold.co/80x80" alt="" width="80" height="80">
    <div class="card-body">
      <h3>Container Queries</h3>
      <p>컨테이너 너비에 따라 세로/가로 배치가 바뀝니다.</p>
    </div>
  </div>
</div>
`;

const PLAYGROUND_CSS = `
.resize-hint { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }

.resizable {
  resize: horizontal;
  overflow: auto;
  min-width: 12rem;
  max-width: 100%;
  width: 14rem;
  border: 1px dashed #94a3b8;
  padding: 0.75rem;
  /* 이 요소를 기준 컨테이너로 등록한다 - 이 안의 후손이 @container를 쓸 수 있게 됨 */
  container-type: inline-size;
  container-name: card-wrapper;
}

.card {
  display: flex;
  flex-direction: column; /* 기본값: 좁을 때는 세로로 쌓기 */
  gap: 0.6rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.card img { border-radius: 8px; }
.card h3 { margin: 0 0 0.3rem; font-size: 1rem; }
.card p { margin: 0; font-size: 0.85rem; color: #475569; }

/* 컨테이너(.resizable) 너비가 20rem을 넘으면 가로 배치로 전환 */
@container card-wrapper (min-width: 20rem) {
  .card {
    flex-direction: row;
    align-items: center;
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>Container Queries + 반응형 단위</h1>
      <p>
        <code>@media</code>는 브라우저 창(뷰포트) 크기만 봅니다. 그래서 같은 카드
        컴포넌트라도 넓은 본문에 있을 때와 좁은 사이드바에 있을 때를 다르게 대응시키기가
        어려웠습니다 — 뷰포트 기준으로는 둘 다 "화면이 넓다"고 나오니까요.
        <code>@container</code>는 <strong>컴포넌트가 실제로 차지한 공간</strong>을
        기준으로 쿼리하기 때문에 이 문제를 해결합니다.
      </p>
      ${codeBlock(MEDIA_VS_CONTAINER, "@media vs @container")}

      <h2 id="how">사용법: container-type 선언이 먼저</h2>
      <p>
        아무 요소나 바로 <code>@container</code>의 대상이 되는 건 아닙니다. 부모 요소에
        <code>container-type: inline-size</code>를 선언해 "이 요소를 기준 컨테이너로
        쓰겠다"고 등록해야, 그 안의 후손 요소들이 <code>@container (min-width: ...)</code>로
        그 컨테이너의 너비를 쿼리할 수 있습니다.
      </p>

      <h2 id="fluid-units">clamp()와 dvh — 미디어 쿼리 없는 유동값</h2>
      <p>
        같은 맥락에서, 폰트 크기나 높이도 이제 미디어 쿼리 구간별로 여러 값을 나열하는
        대신 <code>clamp(최소, 선호값, 최대)</code> 하나로 화면 크기에 매끄럽게
        비례시킬 수 있습니다. 모바일 뷰포트 높이 단위도 <code>vh</code> 대신
        <code>dvh</code>(dynamic viewport height)를 쓰면 모바일 브라우저의 주소창이
        늘었다 줄었다 하는 동안에도 <em>실제로 보이는</em> 높이를 정확히 따라갑니다.
      </p>
      ${codeBlock(FLUID_UNITS, "clamp()와 dvh")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        프리뷰 안의 점선 박스는 <code>resize: horizontal</code>이 걸려 있어 오른쪽 아래
        모서리를 드래그해 너비를 바꿀 수 있습니다. 박스를 넓혀서 20rem을 넘기면 카드가
        세로 배치에서 가로 배치로 바뀝니다 — 브라우저 창 크기는 전혀 건드리지 않았는데도
        일어나는 변화입니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
