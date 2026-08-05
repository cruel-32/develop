/**
 * 실제 Postgres를 WASM으로 컴파일한 PGlite로 SQL을 브라우저 안에서 그대로 실행하는
 * 라이브 실습창. ecmaPlayground.js의 "코드를 실제 엔진으로 실행하고 콘솔을 가로챈다"는
 * 아이디어를 SQL에 맞게 옮긴 것이다 — 다만 console.log 대신 각 statement의 결과 테이블을
 * 그대로 보여준다.
 *
 * 에디터는 CodeMirror 6(@codemirror/lang-sql, PostgreSQL dialect)로 구성하고, 정적 코드
 * 예시와 색이 맞도록 ecma/html-css와 동일한 vsDark 팔레트를 그대로 옮겨쓴다.
 *
 * 중요: 쿼리 결과의 셀 값(사용자가 INSERT한 문자열 포함)은 DB에 그대로 저장된 임의
 * 문자열일 수 있으므로, 절대 innerHTML로 꽂지 않고 반드시 textContent로만 렌더링한다
 * (그래야 예를 들어 '<img src=x onerror=alert(1)>'를 INSERT해도 그냥 문자열로만 보인다).
 */

import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Results } from "@electric-sql/pglite";
import { createFreshDb } from "./pgClient";

// prism-react-renderer의 themes.vsDark와 동일한 색상값(VS Code Dark+ 계열).
// react/vue/typescript/ecma/html-css 학습실과 색상을 맞추기 위해 그대로 옮겨썼다.
const vsDarkHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "rgb(106, 153, 85)" },
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword], color: "rgb(86, 156, 214)" },
  { tag: [t.number, t.bool, t.null], color: "rgb(181, 206, 168)" },
  { tag: [t.string, t.special(t.string)], color: "rgb(206, 145, 120)" },
  { tag: [t.propertyName, t.attributeName], color: "rgb(156, 220, 254)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "rgb(220, 220, 170)" },
  { tag: [t.className, t.typeName], color: "rgb(78, 201, 176)" },
  { tag: [t.punctuation, t.operator], color: "rgb(212, 212, 212)" },
  { tag: t.variableName, color: "rgb(156, 220, 254)" },
]);

const vsDarkEditorTheme = EditorView.theme(
  {
    "&": { backgroundColor: "#1e1e1e", color: "#9cdcfe" },
    ".cm-content": { caretColor: "#e2e8f0" },
    ".cm-gutters": { backgroundColor: "#1e1e1e", color: "#6b7280", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(96, 165, 250, 0.25)",
    },
  },
  { dark: true },
);

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const MAX_DISPLAY_ROWS = 200;

/** result.rows를 <table>로 그린다. 셀 값은 textContent로만 넣어 XSS 여지를 남기지 않는다. */
function buildResultTable(result: Results): HTMLElement {
  const table = el("table", "pg-result-table");
  const thead = el("thead");
  const headRow = el("tr");
  for (const field of result.fields) {
    const th = el("th");
    th.textContent = field.name;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody");
  const rows = result.rows.slice(0, MAX_DISPLAY_ROWS);
  for (const row of rows) {
    const tr = el("tr");
    for (const field of result.fields) {
      const td = el("td");
      const value = (row as Record<string, unknown>)[field.name];
      if (value === null || value === undefined) {
        td.className = "pg-null";
      }
      td.textContent = formatCellValue(value);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  if (result.rows.length > MAX_DISPLAY_ROWS) {
    const note = el("p", "pg-result-truncated");
    note.textContent = `... 외 ${result.rows.length - MAX_DISPLAY_ROWS}행 더 (${MAX_DISPLAY_ROWS}행까지만 표시)`;
    const wrapper = el("div");
    wrapper.appendChild(table);
    wrapper.appendChild(note);
    return wrapper;
  }
  return table;
}

function buildResultBlock(index: number, result: Results): HTMLElement {
  const block = el("div", "pg-result-block");
  const header = el("p", "pg-result-header");
  if (result.fields.length > 0) {
    header.textContent = `쿼리 ${index} — ${result.rows.length}행 반환`;
  } else if (typeof result.affectedRows === "number") {
    header.textContent = `쿼리 ${index} — ${result.affectedRows}행 반영됨`;
  } else {
    header.textContent = `쿼리 ${index} — 완료`;
  }
  block.appendChild(header);

  if (result.fields.length > 0 && result.rows.length > 0) {
    block.appendChild(buildResultTable(result));
  }
  return block;
}

function buildErrorBlock(err: unknown): HTMLElement {
  const block = el("div", "pg-error-block");
  const title = el("p", "pg-error-title");
  title.textContent = "오류가 발생했습니다";
  const message = el("p", "pg-error-message");
  message.textContent = err instanceof Error ? err.message : String(err);
  block.appendChild(title);
  block.appendChild(message);
  return block;
}

export interface PgPlaygroundOptions {
  /** CREATE TABLE / INSERT 시드 데이터부터 실습 쿼리까지, 실행 가능한 전체 SQL 스크립트 */
  sql: string;
  badge?: string;
}

let instanceCounter = 0;

export function mountPgPlayground(container: HTMLElement, opts: PgPlaygroundOptions): void {
  const id = `pg-playground-${instanceCounter++}`;
  const initialCode = opts.sql.trim();

  container.innerHTML = `
    <div class="pg-playground-wrapper">
      <div class="pg-playground-toolbar">
        <span class="pg-playground-label">
          SQL을 직접 수정하고 실행해보세요
          ${opts.badge ? `<span class="badge">${escapeHtml(opts.badge)}</span>` : ""}
        </span>
        <div class="pg-playground-actions">
          <button type="button" class="pg-playground-reset" id="${id}-reset">⟳ 초기 코드로</button>
          <button type="button" class="pg-playground-run" id="${id}-run">▶ 실행 (Ctrl+Enter)</button>
        </div>
      </div>
      <div class="pg-playground-body">
        <div class="pg-playground-editor" id="${id}-editor"></div>
        <div class="pg-playground-output">
          <div class="pg-playground-output-header">
            <span>실행 결과</span>
          </div>
          <div class="pg-playground-output-body" id="${id}-output">
            <p class="pg-playground-output-empty">▶ 버튼을 눌러 실행해보세요.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const editorHost = container.querySelector<HTMLElement>(`#${id}-editor`)!;
  const outputEl = container.querySelector<HTMLElement>(`#${id}-output`)!;
  const runBtn = container.querySelector<HTMLButtonElement>(`#${id}-run`)!;
  const resetBtn = container.querySelector<HTMLButtonElement>(`#${id}-reset`)!;

  const view = new EditorView({
    parent: editorHost,
    state: EditorState.create({
      doc: initialCode,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, { key: "Mod-Enter", run: () => (run(), true) }]),
        sql({ dialect: PostgreSQL, upperCaseKeywords: true }),
        lineNumbers(),
        vsDarkEditorTheme,
        syntaxHighlighting(vsDarkHighlightStyle),
        EditorView.lineWrapping,
      ],
    }),
  });

  // 실행 도중 Reset이나 재실행이 들어오면 이전 실행 결과가 뒤늦게 그려지지 않도록 막는다.
  let runGeneration = 0;

  async function run() {
    const generation = ++runGeneration;
    const code = view.state.doc.toString();

    outputEl.innerHTML = "";
    const loading = el("p", "pg-playground-output-empty");
    loading.textContent = "⏳ Postgres 엔진을 실행하는 중입니다...";
    outputEl.appendChild(loading);

    try {
      const db = await createFreshDb();
      const results = await db.exec(code);
      if (generation !== runGeneration) return;

      outputEl.innerHTML = "";
      if (results.length === 0) {
        const empty = el("p", "pg-playground-output-empty");
        empty.textContent = "(반환된 결과 없음)";
        outputEl.appendChild(empty);
      } else {
        results.forEach((result, i) => outputEl.appendChild(buildResultBlock(i + 1, result)));
      }
    } catch (err) {
      if (generation !== runGeneration) return;
      outputEl.innerHTML = "";
      outputEl.appendChild(buildErrorBlock(err));
    }
  }

  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", () => {
    runGeneration++;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialCode },
    });
    outputEl.innerHTML = "";
    const empty = el("p", "pg-playground-output-empty");
    empty.textContent = "▶ 버튼을 눌러 실행해보세요.";
    outputEl.appendChild(empty);
  });

  run();
}
