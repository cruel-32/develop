import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const OLD_WAY = `
<!-- position:fixed 오버레이 + 수동 포커스 트랩 + 수동 ESC 처리 + z-index 관리 -->
<div class="modal-overlay" id="overlay">
  <div class="modal" role="dialog" aria-modal="true">
    <p>정말 삭제하시겠습니까?</p>
    <button id="close">닫기</button>
  </div>
</div>
<script>
  // ESC 키, 바깥 클릭, 포커스 가두기를 전부 직접 구현해야 했다
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.style.display = "none";
  });
</script>
`;

const NEW_WAY = `
<dialog id="d">
  <p>정말 삭제하시겠습니까?</p>
  <form method="dialog"><button>닫기</button></form>
</dialog>
<button onclick="d.showModal()">열기</button>
`;

const PLAYGROUND_HTML = `
<button onclick="document.getElementById('confirm').showModal()">
  삭제하기
</button>

<dialog id="confirm">
  <h2>정말 삭제할까요?</h2>
  <p>이 작업은 되돌릴 수 없습니다.</p>
  <form method="dialog" class="actions">
    <button value="cancel">취소</button>
    <button value="confirm" class="danger">삭제</button>
  </form>
</dialog>
`;

const PLAYGROUND_CSS = `
dialog#confirm {
  border: none;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 22rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

/* backdrop도 CSS로 스타일링할 수 있다 */
dialog#confirm::backdrop {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.actions .danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>&lt;dialog&gt; 모달</h1>
      <p>
        모달 하나 띄우려고 <code>position: fixed</code> 오버레이, <code>z-index</code> 전쟁,
        ESC 키 처리, 포커스 가두기(focus trap)까지 직접 구현하던 시절은 끝났습니다.
        <code>&lt;dialog&gt;</code>는 이 모든 걸 브라우저가 네이티브로 해줍니다.
      </p>

      <h2 id="api">showModal() vs show()</h2>
      <p>
        <code>dialog.showModal()</code>은 <strong>모달</strong>로 엽니다 — 배경이
        <code>::backdrop</code>로 덮이고, 포커스가 다이얼로그 안에 갇히고(focus trap),
        <kbd>ESC</kbd>로 자동으로 닫힙니다. <code>dialog.show()</code>는 배경 상호작용이
        가능한 <strong>비모달</strong>로 엽니다. 닫을 때는 <code>dialog.close()</code>를
        직접 부르거나, <code>&lt;form method="dialog"&gt;</code> 안의 버튼을 누르면
        자동으로 닫히면서 그 버튼의 <code>value</code>가 <code>dialog.returnValue</code>로
        전달됩니다.
      </p>

      <h2 id="before-after">이전 방식과 비교</h2>
      ${codeBlock(OLD_WAY, "이전: 직접 구현한 모달")}
      ${codeBlock(NEW_WAY, "이후: <dialog> 하나로 끝")}

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        "삭제하기" 버튼을 눌러 모달을 열어보세요. <kbd>ESC</kbd>를 누르거나 배경을
        클릭해도 닫히는지 확인해보세요(배경 클릭으로 닫으려면 JS 없이는 안 되니, 우선
        버튼과 ESC부터 확인). CSS 탭에서 <code>::backdrop</code>의 색이나
        <code>backdrop-filter</code> 값을 바꿔보면 배경 스타일이 즉시 바뀝니다.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
