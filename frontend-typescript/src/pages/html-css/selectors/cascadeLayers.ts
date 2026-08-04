import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const NESTING_BEFORE_AFTER = `
/* 이전: 전처리기(Sass/Less)가 있어야만 가능했던 중첩 문법 */
.card {
  .title { font-weight: 600; }
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
}

/* 지금: 브라우저가 네이티브로 이해한다 - 빌드 도구 불필요 */
.card {
  & .title { font-weight: 600; }
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
}
`;

const LAYER_PROBLEM = `
/* 명세순으로 소스가 배치되어도, 명시도(specificity)가 낮으면 뒤에 와도 진다 */
.btn { background: blue; }                 /* 명시도 (0,1,0) */
#header .toolbar .btn { background: red; } /* 명시도 (0,3,0) - 항상 이긴다 */
/* 결국 !important 남발로 이어지는 흔한 패턴 */
`;

const LAYER_SOLUTION = `
/* 레이어의 "선언 순서"가 명시도보다 우선한다 - 나중에 선언된 레이어가 이긴다 */
@layer reset, base, components, utilities;

@layer components {
  #header .toolbar .btn { background: red; }  /* 명시도는 높지만 components 레이어 */
}

@layer utilities {
  .btn { background: blue; }  /* 명시도는 낮지만 utilities가 나중 레이어라서 이김 */
}
`;

const PLAYGROUND_HTML = `
<div id="header">
  <div class="toolbar">
    <button class="btn">저장</button>
  </div>
</div>
`;

const PLAYGROUND_CSS = `
/* 레이어 선언 순서 = 우선순위. utilities가 마지막이라 항상 이긴다 */
@layer reset, components, utilities;

@layer reset {
  .btn { border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
}

/* 명시도 (0,3,0)로 훨씬 높지만, components 레이어라서 진다 */
@layer components {
  #header .toolbar .btn {
    background: #ef4444;
    color: white;
  }
}

/* 명시도 (0,1,0)로 훨씬 낮지만, utilities가 마지막 레이어라서 이긴다 */
@layer utilities {
  .btn {
    background: #3b82f6;
    color: white;

    /* 네이티브 CSS 중첩(nesting) - 전처리기 없이 & 로 부모 참조 */
    &:hover {
      background: #2563eb;
    }
  }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>CSS Nesting + @layer(Cascade Layers)</h1>
      <p>
        Sass 같은 전처리기가 오랫동안 대신 해주던 두 가지 — 선택자 중첩과 우선순위
        제어 — 가 이제 순수 CSS 스펙에 들어왔습니다. 빌드 도구 없이도 <code>&</code>로
        중첩하고, <code>@layer</code>로 "누가 이길지"를 명시도 계산이 아니라 선언
        순서로 통제할 수 있습니다.
      </p>

      <h2 id="nesting">CSS Nesting</h2>
      <p>
        <code>&</code>는 전처리기에서와 똑같이 부모 선택자를 가리킵니다. 컴파일 단계
        없이 브라우저가 그대로 해석합니다.
      </p>
      ${codeBlock(NESTING_BEFORE_AFTER, "전처리기 없이도 되는 중첩")}

      <h2 id="specificity-war">!important 전쟁의 원인</h2>
      <p>
        전통적인 CSS의 우선순위는 <strong>명시도(specificity)</strong>가 소스 순서보다
        우선입니다. 그래서 나중에 작성한 규칙이라도 선택자의 명시도가 낮으면 앞서 작성된
        더 구체적인 선택자를 절대 못 이깁니다 — 결국 <code>!important</code>를 덧대는
        악순환으로 이어지기 쉽습니다.
      </p>
      ${codeBlock(LAYER_PROBLEM, "명시도가 소스 순서를 이겨버리는 문제")}

      <h2 id="layer-solution">@layer: 명시도보다 강한 "레이어 순서"</h2>
      <p>
        <code>@layer reset, base, components, utilities;</code>처럼 레이어 이름의
        순서를 미리 선언해두면, <strong>레이어 순서가 명시도보다 먼저 적용</strong>됩니다.
        같은 레이어 안에서는 기존처럼 명시도가 작동하지만, 서로 다른 레이어끼리는 무조건
        나중 레이어가 이깁니다. 그래서 "reset → base → components → utilities" 순으로
        레이어를 선언해두면, 명시도가 아무리 낮아도 유틸리티 클래스가 항상
        컴포넌트 스타일을 덮어쓰게 만들 수 있습니다 — <code>!important</code> 없이도요.
      </p>
      ${codeBlock(LAYER_SOLUTION, "@layer로 우선순위를 명시적으로 제어")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        버튼 배경이 파란색(<code>utilities</code> 레이어)으로 나오는 걸 확인하세요 —
        <code>#header .toolbar .btn</code>(명시도 0,3,0)이 <code>.btn</code>(명시도
        0,1,0)보다 훨씬 명시도가 높은데도 졌습니다. CSS 탭 맨 위의
        <code>@layer reset, components, utilities;</code> 순서를
        <code>reset, utilities, components</code>로 바꿔보면 이번엔 빨간색이 이기는
        걸 볼 수 있습니다 — 순서만 바꿨을 뿐 선택자는 그대로인데도요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
