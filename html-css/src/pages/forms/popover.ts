import type { PageRender } from "../../router";
import { mountHtmlCssPlayground } from "../../htmlCssPlayground";
import { codeBlock } from "../../pageHelpers";

const OLD_WAY = `
// 드롭다운 하나 만드는 데 필요했던 것들:
// - z-index 값 관리 (다른 컴포넌트와 충돌 안 나게)
// - 바깥 클릭 감지해서 닫기 (document에 클릭 리스너 등록/해제)
// - ESC 키로 닫기
// - 스크롤 시 위치 재계산
menuButton.addEventListener("click", () => {
  menu.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target !== menuButton) {
    menu.classList.remove("open");
  }
});
`;

const NEW_WAY = `
<!-- popovertarget이 버튼과 popover 요소를 연결한다. JS 0줄. -->
<button popovertarget="menu">메뉴 열기</button>
<div id="menu" popover>
  <a href="#">프로필</a>
  <a href="#">설정</a>
  <a href="#">로그아웃</a>
</div>
`;

const PLAYGROUND_HTML = `
<button popovertarget="menu" class="trigger">사용자 메뉴 ▾</button>

<div id="menu" popover class="menu">
  <a href="#">프로필</a>
  <a href="#">설정</a>
  <a href="#">로그아웃</a>
</div>
`;

const PLAYGROUND_CSS = `
.trigger {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  cursor: pointer;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  margin: 0;
}

.menu a {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  text-decoration: none;
  color: #1e293b;
}

.menu a:hover {
  background: #f1f5f9;
}

/* popover가 열려 있을 때만 걸리는 상태 선택자 */
.menu:popover-open {
  animation: fade-in 0.12s ease-out;
}

/* top layer에 뜨는 배경(popover에도 ::backdrop이 있다, dialog보다 옅게 쓰는 게 보통) */
.menu::backdrop {
  background: transparent;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export const render: PageRender = (container) => {
  container.innerHTML = `
    <article>
      <h1>popover 속성 / Popover API</h1>
      <p>
        드롭다운, 툴팁, 알림 토스트처럼 "다른 요소 위에 잠깐 떠 있다가 바깥을 클릭하면
        닫히는" UI는 오랫동안 <code>z-index</code>와 바깥 클릭 감지를 직접 관리해야
        했습니다. <code>popover</code> 속성은 이걸 선언 한 줄로 끝냅니다.
      </p>
      ${codeBlock(OLD_WAY, "이전: 수동으로 열고 닫는 드롭다운")}
      ${codeBlock(NEW_WAY, "이후: popovertarget만으로 끝")}

      <h2 id="how">동작 원리</h2>
      <p>
        <code>popover</code> 속성이 붙은 요소는 브라우저의 <strong>top layer</strong>에
        렌더링됩니다 — 그래서 <code>z-index</code>를 신경 쓸 필요가 없습니다. 트리거
        버튼에 <code>popovertarget="아이디"</code>를 주면 클릭 시 자동으로 열리고,
        <strong>바깥을 클릭하거나 ESC를 누르면 자동으로 닫힙니다.</strong> 이 "가벼운
        경량 dismiss" 동작이 항상 포커스를 가두는 <code>&lt;dialog&gt;</code>와의 가장 큰
        차이입니다.
      </p>

      <h2 id="css-hooks">:popover-open과 ::backdrop</h2>
      <p>
        열려 있는 popover는 <code>:popover-open</code> 가상 클래스로 선택해서 열림
        애니메이션을 줄 수 있고, <code>&lt;dialog&gt;</code>와 마찬가지로
        <code>::backdrop</code>로 뒷배경도 스타일링할 수 있습니다.
      </p>

      <h2 id="playground">직접 실습해보기</h2>
      <p class="hint">
        "사용자 메뉴" 버튼을 눌러 메뉴를 연 다음, 메뉴 바깥의 빈 공간을 클릭해보세요 —
        JS 코드가 하나도 없는데 자동으로 닫힙니다. HTML 탭에서 <code>popover</code>
        속성을 <code>popover="manual"</code>로 바꾸면 바깥 클릭으로 안 닫히는 것도
        비교해보세요.
      </p>
      <div id="playground-slot"></div>
    </article>
  `;

  mountHtmlCssPlayground(container.querySelector<HTMLElement>("#playground-slot")!, {
    html: PLAYGROUND_HTML,
    css: PLAYGROUND_CSS,
  });
};
