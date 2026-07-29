import "./style.css";
import type { Person, PersonInput, PeoplePage } from "./types";

const PAGE_SIZE = 5;
const root = document.querySelector<HTMLDivElement>("#app")!;

let page = 1;
let selectedId: number | null = null;

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

async function fetchPeople(p: number): Promise<PeoplePage> {
  const res = await fetch(`/api/people?page=${p}&pageSize=${PAGE_SIZE}`);
  return res.json();
}

async function fetchPerson(id: number): Promise<Person> {
  const res = await fetch(`/api/people/${id}`);
  return res.json();
}

function personFormHtml(prefix: string, initial: PersonInput, submitLabel: string): string {
  const idValue = initial.id === 0 ? "" : String(initial.id);
  return `
    <form class="inline-form" id="${prefix}-form">
      <input id="${prefix}-id" type="number" min="1" placeholder="id (직접 지정)" required value="${idValue}" style="width: 5.5rem" />
      <input id="${prefix}-name" placeholder="이름" required value="${escapeHtml(initial.name)}" />
      <input id="${prefix}-age" type="number" min="0" placeholder="나이" required value="${initial.age}" style="width: 5rem" />
      <input id="${prefix}-job" placeholder="직업" required value="${escapeHtml(initial.job)}" />
      <input id="${prefix}-address" placeholder="주소 (선택)" value="${escapeHtml(initial.address ?? "")}" />
      <button type="submit">${submitLabel}</button>
    </form>
    <p class="error" id="${prefix}-error" hidden></p>
  `;
}

function readPersonForm(prefix: string): PersonInput {
  const id = document.querySelector<HTMLInputElement>(`#${prefix}-id`)!.value;
  const name = document.querySelector<HTMLInputElement>(`#${prefix}-name`)!.value;
  const age = document.querySelector<HTMLInputElement>(`#${prefix}-age`)!.value;
  const job = document.querySelector<HTMLInputElement>(`#${prefix}-job`)!.value;
  const address = document.querySelector<HTMLInputElement>(`#${prefix}-address`)!.value;
  return {
    id: Number(id),
    name,
    age: Number(age),
    job,
    address: address.trim() ? address.trim() : null,
  };
}

function showFormError(prefix: string, message: string | null) {
  const el = document.querySelector<HTMLParagraphElement>(`#${prefix}-error`)!;
  el.hidden = message === null;
  el.textContent = message ?? "";
}

async function renderList() {
  const peoplePage = await fetchPeople(page);

  root.innerHTML = `
    <main class="app">
      <h1>TypeScript CRUD Demo</h1>
      <a class="back" href="/">← 메뉴로</a>
      <p>백엔드의 Express + Drizzle ORM + Postgres 스택으로 만든 <code>/api/people</code>를 호출하는 데모입니다.</p>

      <h3>새 사람 추가</h3>
      <p class="hint">
        id는 자동 생성되지 않습니다 — 직접 원하는 번호를 지정하세요. 이미 존재하는 id를
        입력하면 중복 오류가 표시됩니다.
      </p>
      ${personFormHtml("create", { id: 0, name: "", age: 0, job: "", address: null }, "추가")}

      <ul class="item-list" id="people-list">
        ${peoplePage.data
          .map(
            (person) => `
              <li data-id="${person.id}">
                <div><span class="hint">#${person.id}</span> <strong>${escapeHtml(person.name)}</strong> (${person.age}세) — ${escapeHtml(person.job)}</div>
                <div style="display: flex; gap: 8px">
                  <button data-action="view" data-id="${person.id}">상세보기</button>
                  <button data-action="delete" data-id="${person.id}">삭제</button>
                </div>
              </li>
            `,
          )
          .join("")}
      </ul>

      <div class="inline-form">
        <button id="prev-page" type="button" ${peoplePage.page <= 1 ? "disabled" : ""}>이전</button>
        <span class="hint">${peoplePage.page} / ${peoplePage.totalPages} 페이지 (총 ${peoplePage.total}명)</span>
        <button id="next-page" type="button" ${peoplePage.page >= peoplePage.totalPages ? "disabled" : ""}>다음</button>
      </div>
    </main>
  `;

  document
    .querySelector<HTMLFormElement>("#create-form")!
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      showFormError("create", null);
      const input = readPersonForm("create");
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        showFormError("create", (await res.json()).error ?? "생성 실패");
        return;
      }
      page = 1;
      await renderList();
    });

  document
    .querySelector<HTMLUListElement>("#people-list")!
    .addEventListener("click", async (event) => {
      const target = event.target as HTMLElement;
      const id = target.dataset.id ? Number(target.dataset.id) : null;
      if (!id) return;
      if (target.dataset.action === "delete") {
        await fetch(`/api/people/${id}`, { method: "DELETE" });
        await renderList();
      } else if (target.dataset.action === "view") {
        selectedId = id;
        await renderDetail();
      }
    });

  document.querySelector<HTMLButtonElement>("#prev-page")!.addEventListener("click", async () => {
    page -= 1;
    await renderList();
  });
  document.querySelector<HTMLButtonElement>("#next-page")!.addEventListener("click", async () => {
    page += 1;
    await renderList();
  });
}

async function renderDetail() {
  if (selectedId === null) return;
  const person = await fetchPerson(selectedId);

  root.innerHTML = `
    <main class="app">
      <h1>TypeScript CRUD Demo</h1>
      <button type="button" id="back-to-list">← 목록으로</button>
      <h3>상세 정보 (id: ${person.id})</h3>
      <p class="hint">id를 바꿔서 저장하면 이 레코드의 기본키(PK) 자체가 바뀝니다.</p>
      ${personFormHtml(
        "edit",
        { id: person.id, name: person.name, age: person.age, job: person.job, address: person.address },
        "저장",
      )}
      <button type="button" id="delete-person" style="margin-top: 8px">이 사람 삭제</button>
    </main>
  `;

  document.querySelector<HTMLButtonElement>("#back-to-list")!.addEventListener("click", async () => {
    selectedId = null;
    await renderList();
  });

  document
    .querySelector<HTMLFormElement>("#edit-form")!
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      showFormError("edit", null);
      const input = readPersonForm("edit");
      const res = await fetch(`/api/people/${person.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        showFormError("edit", (await res.json()).error ?? "수정 실패");
        return;
      }
      const updated: Person = await res.json();
      // id를 바꿔서 저장한 경우 - 새 id로 상세 화면을 다시 그린다.
      selectedId = updated.id;
      await renderDetail();
    });

  document
    .querySelector<HTMLButtonElement>("#delete-person")!
    .addEventListener("click", async () => {
      await fetch(`/api/people/${person.id}`, { method: "DELETE" });
      selectedId = null;
      await renderList();
    });
}

renderList().catch((err) => {
  root.innerHTML = `<p class="error">${String(err)}</p>`;
});
