import type { PageRender } from "../../../router";
import { mountHtmlCssPlayground } from "../../../htmlCssPlayground";
import { codeBlock } from "../../../pageHelpers";

const MANUAL_FLIP = `
// 이전: "레이아웃이 바뀌기 전/후 위치를 재서 transform으로 흉내내는"
// FLIP(First-Last-Invert-Play) 기법을 직접 구현해야 했다
const before = el.getBoundingClientRect();
applyNewLayout();
const after = el.getBoundingClientRect();
const dx = before.left - after.left;
const dy = before.top - after.top;
el.animate(
  [{ transform: \`translate(\${dx}px, \${dy}px)\` }, { transform: "none" }],
  { duration: 250, easing: "ease-out" },
);
`;

const START_VIEW_TRANSITION = `
// 이후: DOM을 바꾸는 콜백만 넘기면 브라우저가 알아서 전/후 스냅샷을 찍어
// 크로스페이드(또는 커스텀 애니메이션)로 전환해준다
document.startViewTransition(() => {
  el.classList.toggle("grid-view");
});
`;

const PLAYGROUND_HTML = `
<button id="toggle">뷰 전환</button>

<ul id="list" class="items">
  <li>🍎 사과</li>
  <li>🍌 바나나</li>
  <li>🍇 포도</li>
  <li>🍊 오렌지</li>
</ul>
`;

const PLAYGROUND_CSS = `
.items {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.items.grid-view {
  flex-direction: row;
  flex-wrap: wrap;
}

.items li {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.items.grid-view li {
  flex: 1 0 6rem;
  text-align: center;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #94a3b8;
  background: white;
  cursor: pointer;
}

/* View Transitions API가 만드는 가상 트리 - 여기서 애니메이션을 커스터마이즈한다.
   지정하지 않으면 기본값(부드러운 크로스페이드)이 자동으로 적용된다. */
::view-transition-old(root) {
  animation: 200ms ease-out both fade-out;
}
::view-transition-new(root) {
  animation: 200ms ease-in both fade-in;
}

@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } }
`;

const PLAYGROUND_SCRIPT = `
document.getElementById("toggle").addEventListener("click", () => {
  const apply = () => document.getElementById("list").classList.toggle("grid-view");
  if (document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply(); // 미지원 브라우저는 그냥 즉시 전환(점진적 향상)
  }
});
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>View Transitions API</h1>
      <p>
        리스트를 그리드로 바꾸거나 페이지를 전환할 때 "부드럽게 바뀌는" 느낌을 주려면,
        전에는 바뀌기 전/후 요소 위치를 직접 측정해서 <code>transform</code>으로
        흉내내는 FLIP 기법 같은 걸 손으로 구현해야 했습니다.
      </p>
      ${codeBlock(MANUAL_FLIP, "이전: 수동 FLIP 애니메이션")}

      <h2 id="api">document.startViewTransition()</h2>
      <p>
        DOM을 바꾸는 콜백 함수 하나를 <code>document.startViewTransition()</code>에
        넘기기만 하면 됩니다. 브라우저가 콜백 실행 전 상태를 스냅샷으로 찍어두고,
        콜백을 실행한 뒤 결과 상태도 스냅샷으로 찍은 다음, 둘 사이를 자동으로
        크로스페이드시켜 줍니다.
      </p>
      ${codeBlock(START_VIEW_TRANSITION, "startViewTransition()")}

      <h2 id="customize">::view-transition-old / ::view-transition-new</h2>
      <p>
        기본 동작은 부드러운 크로스페이드지만, <code>::view-transition-old(root)</code>와
        <code>::view-transition-new(root)</code> 가상 요소에 직접
        <code>animation</code>을 걸어서 슬라이드, 확대/축소 등 원하는 전환 효과로
        바꿀 수 있습니다. 특정 요소에 <code>view-transition-name</code>을 지정하면 그
        요소만 따로 "모핑(morphing)"되는 공유 요소 전환도 가능합니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        "뷰 전환" 버튼을 눌러 리스트 ↔ 그리드 배치를 전환해보세요. 레이아웃이 즉시
        바뀌는 게 아니라 옅게 사라졌다 나타나는 것을 볼 수 있습니다 — 이 페이드
        효과는 CSS 탭의 <code>::view-transition-old(root)</code>/
        <code>::view-transition-new(root)</code> 애니메이션을 지워보면 기본
        크로스페이드로 바뀌는 것도 비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: `${PLAYGROUND_HTML}\n<script>${PLAYGROUND_SCRIPT}</script>`,
    css: PLAYGROUND_CSS,
  });
};
