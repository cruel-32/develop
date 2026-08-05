import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const FLOAT_HELL = `
/* Grid 이전, 2차원 레이아웃을 흉내내던 방식 */
.column { float: left; width: 33.333%; }
.row::after { content: ""; display: table; clear: both; } /* clearfix */
`;

const TWO_AXIS_SYNTAX = `
/* display는 사실 "바깥 타입 + 안쪽 타입" 두 값으로 이루어진 속성이다 */
display: block flow;        /* 한 값짜리 display: block 과 동일 */
display: inline flow;       /* display: inline 과 동일 */
display: block flex;        /* display: flex 와 동일 - 블록처럼 배치되는 flex 컨테이너 */
display: inline flex;       /* display: inline-flex 와 동일 - 텍스트 옆에 낄 수 있는 flex 컨테이너 */
display: block grid;        /* display: grid 와 동일 */
display: inline grid;       /* display: inline-grid 와 동일 */
`;

const TABLE_CENTERING = `
/* Flexbox(2012) 이전, 세로 중앙 정렬을 위해 흔히 쓰던 트릭 */
.wrapper { display: table; width: 100%; }
.cell { display: table-cell; vertical-align: middle; }

/* 지금은 이 한 줄로 끝난다 */
.wrapper { display: flex; align-items: center; }
`;

const FLOW_ROOT = `
/* 옛날 clearfix: 가짜 요소를 만들어 float을 강제로 "정리"했다 */
.row::after {
  content: "";
  display: table;
  clear: both;
}

/* 지금: 부모에 새 BFC(블록 서식 맥락)를 만들어 float 자식의 높이를 저절로 품게 한다 */
.row {
  display: flow-root;
}
`;

const CONTENTS_EXAMPLE = `
<!-- 의미상 필요한 wrapper인데, grid 배치에는 방해가 된다 -->
<div class="grid">
  <div class="wrapper">
    <div class="item">A</div>
    <div class="item">B</div>
  </div>
  <div class="item">C</div>
</div>
`;

const CONTENTS_CSS = `
/* wrapper의 "박스"만 지워서, item A/B가 wrapper를 건너뛰고
   .grid의 직속 자식처럼 그리드 배치에 참여하게 만든다 */
.wrapper {
  display: contents;
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
      <h1>Flexbox / Grid / display 완전정리</h1>
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

      <h2 id="display-axes">display는 사실 두 축짜리 속성이다</h2>
      <p>
        <code>display: flex</code>, <code>display: grid</code>처럼 한 단어로 쓰는 게
        익숙하지만, CSS Display Module Level 3부터는 <code>display</code>가
        <strong>바깥 타입(outer)</strong>과 <strong>안쪽 타입(inner)</strong> 두 값으로
        이루어진 속성이라는 게 명확해졌습니다. 바깥 타입은 "이 요소가 주변 요소들과
        어떻게 배치되는가"(<code>block</code>인지 <code>inline</code>인지)를, 안쪽
        타입은 "이 요소의 자식들이 어떤 알고리즘으로 배치되는가"(<code>flow</code>,
        <code>flex</code>, <code>grid</code>, <code>table</code> 등)를 결정합니다.
        <code>inline-flex</code>가 사실은 <code>inline flex</code>의 줄임 키워드였다는
        뜻입니다.
      </p>
      ${codeBlock(TWO_AXIS_SYNTAX, "두 값 문법과 기존 한 값 키워드의 대응")}
      <p>
        그래서 <strong><code>flex</code>와 <code>grid</code>는 서로 자유롭게 짝을 이루는
        조합이 아니라, 이미 정해진 "바깥+안쪽" 조합에 붙는 이름</strong>입니다.
        <code>display: flex</code>인 요소 자체는(그 부모 입장에서 보면) 여전히 블록
        레벨 박스이고, <code>display: inline-flex</code>라야 텍스트 옆에 인라인처럼
        낄 수 있습니다. 마찬가지로 <code>grid</code>/<code>inline-grid</code>도 같은
        관계입니다.
      </p>

      <h2 id="table">표(table) 레이아웃 — Flexbox 이전의 유산</h2>
      <p>
        Flexbox가 없던 시절엔 세로 중앙 정렬이나 "높이가 제일 큰 칸에 나머지 칸도 맞춰
        늘어나는" 레이아웃을 만들려고 실제 <code>&lt;table&gt;</code> 태그 없이도
        <code>display: table</code>/<code>table-row</code>/<code>table-cell</code>을
        자주 활용했습니다. 표 알고리즘은 원래 <code>vertical-align</code>과 자동 높이
        맞춤을 기본으로 지원하기 때문입니다.
      </p>
      ${codeBlock(TABLE_CENTERING, "table-cell 트릭 vs 지금의 flex")}
      <p>
        지금은 대부분 <code>flex</code>/<code>grid</code>로 대체되었지만, "여러 칸의
        높이를 서로 맞추면서 자동으로 늘리기" 같은 표 특유의 동작이 필요한 아주 특수한
        경우엔 여전히 유효한 선택지입니다. 다만 실제 표 형태의 <em>데이터</em>라면
        접근성과 시맨틱을 위해 CSS 트릭이 아니라 진짜 <code>&lt;table&gt;</code> 엘리먼트를
        쓰는 게 맞습니다.
      </p>

      <h2 id="flow-root">flow-root — floats를 위한 새로운 clearfix</h2>
      <p>
        float으로 띄운 자식만 있는 부모는 높이가 0으로 계산되는 유명한 버그 같은
        동작이 있습니다. 오랫동안 가짜 <code>::after</code> 요소로 <code>clear</code>를
        걸어주는 clearfix 해킹으로 해결했는데, <code>display: flow-root</code>는 그
        해킹을 대체하는 정식 스펙입니다 — 이 값을 준 요소는 새로운
        <strong>블록 서식 맥락(BFC)</strong>을 만들어서, 내부의 float을 전부
        포함하도록 스스로 높이를 늘립니다.
      </p>
      ${codeBlock(FLOW_ROOT, "clearfix 해킹 vs flow-root")}

      <h2 id="contents">contents — 박스만 지우고 자식은 그대로</h2>
      <p>
        <code>display: contents</code>는 그 요소 자체의 박스(배경, 테두리, 크기)를
        렌더링에서 완전히 지워버리고, 자식들만 마치 그 요소가 없었던 것처럼 부모의
        레이아웃에 직접 참여시킵니다. 의미상으로는 감싸야 하는 wrapper인데, 그 wrapper가
        Grid/Flex 배치를 방해할 때 유용합니다.
      </p>
      ${codeBlock(CONTENTS_EXAMPLE, "grid 배치를 방해하는 wrapper")}
      ${codeBlock(CONTENTS_CSS, "wrapper의 박스만 지우기")}
      <p class="hint">
        주의: <code>display: contents</code>는 한때 스크린 리더 접근성 트리에서 요소가
        통째로 사라지는 버그가 있었습니다. 최신 브라우저 대부분이 고쳤지만, 접근성이
        중요한 프로덕션 코드라면 실제로 쓰기 전에 스크린 리더로 직접 확인해보는 걸
        권장합니다.
      </p>

      <h2 id="auto-fit">미디어 쿼리 없는 반응형 그리드</h2>
      <p>
        <code>grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr))</code>는
        컨테이너 너비를 보고 "최소 10rem은 보장하면서 들어갈 수 있는 만큼" 열 개수를
        자동으로 조절합니다. 화면 크기별로 열 개수를 하드코딩하는 미디어 쿼리 없이도
        반응형 카드 그리드가 완성됩니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        CSS 탭에서 <code>.cards</code>의 <code>display: grid</code>를 지워보세요 —
        <code>&lt;div&gt;</code>는 기본이 block이라, 그리드 배치가 사라지는 순간 카드
        5개가 진짜로 세로로 쭉 쌓입니다. 반대로 <code>.toolbar</code>의
        <code>display: flex</code>를 지우면 버튼은 원래도 inline-block이라 가로
        배치 자체는 유지되지만, <code>.spacer</code>의 <code>flex: 1</code>이
        무력화되면서 "더보기" 버튼이 더 이상 오른쪽 끝에 붙지 않고 "취소" 바로 옆으로
        붙습니다 — <code>gap</code>도 함께 사라져 버튼 사이 간격이 좁아지는 것도
        확인해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
