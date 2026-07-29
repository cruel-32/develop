/**
 * 실제 브라우저의 최신 JS 엔진으로 코드를 그대로 실행하는 라이브 실습창.
 *
 * TypeScript 학습실이 CDN에서 특정 버전의 컴파일러를 불러와 "타입 검사"를 재현하는 것과
 * 달리, ECMAScript는 표준화되면 곧 각 브라우저 엔진에 반영되는 실행 가능한 스펙이라
 * 별도 컴파일러/트랜스파일러 없이 브라우저 자체 엔진으로 실행하는 것이 가장 정확하다.
 * (단, 아주 최근 stage 제안은 이 브라우저가 아직 지원하지 않을 수 있다 — 그런 경우 해당
 * 페이지에서 별도로 안내한다.)
 *
 * 코드는 async 함수 본문으로 감싸 실행하므로 top-level await 스타일 코드를 그대로 쓸 수
 * 있고, 실행 중 호출된 console.log/error/warn을 가로채 콘솔 패널에 그대로 보여준다.
 *
 * 에디터는 CodeMirror 6(javascript 언어 지원 + oneDark 테마)로 구성해, react-live나
 * @vue/repl의 CodeMirror 에디터와 동일한 수준의 신택스 하이라이팅을 갖춘다.
 */

import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatArg(arg) {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.stack ?? `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(
      arg,
      (_key, value) => (typeof value === "bigint" ? `${value}n` : value),
      2,
    );
  } catch {
    return String(arg);
  }
}

let instanceCounter = 0;

/**
 * @param {HTMLElement} container
 * @param {{ code: string, badge?: string }} opts
 */
export function mountEcmaPlayground(container, opts) {
  const id = `ecma-playground-${instanceCounter++}`;
  const initialCode = opts.code.trim();

  container.innerHTML = `
    <div class="ecma-playground-wrapper">
      <div class="ecma-playground-toolbar">
        <span class="ecma-playground-label">
          코드를 직접 수정하고 실행해보세요
          ${opts.badge ? `<span class="badge">${escapeHtml(opts.badge)}</span>` : ""}
        </span>
        <div class="ecma-playground-actions">
          <button type="button" class="ecma-playground-reset" id="${id}-reset">⟳ 초기 코드로</button>
          <button type="button" class="ecma-playground-run" id="${id}-run">▶ 실행 (Ctrl+Enter)</button>
        </div>
      </div>
      <div class="ecma-playground-body">
        <div class="ecma-playground-editor" id="${id}-editor"></div>
        <div class="ecma-playground-console">
          <div class="ecma-playground-console-header">
            <span>콘솔 출력</span>
          </div>
          <div class="ecma-playground-console-body" id="${id}-console">
            <p class="ecma-playground-console-empty">▶ 버튼을 눌러 실행해보세요.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const editorHost = container.querySelector(`#${id}-editor`);
  const consoleEl = container.querySelector(`#${id}-console`);
  const runBtn = container.querySelector(`#${id}-run`);
  const resetBtn = container.querySelector(`#${id}-reset`);

  const view = new EditorView({
    parent: editorHost,
    state: EditorState.create({
      doc: initialCode,
      extensions: [
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          { key: "Mod-Enter", run: () => (run(), true) },
        ]),
        javascript(),
        oneDark,
        EditorView.lineWrapping,
      ],
    }),
  });

  async function run() {
    const code = view.state.doc.toString();
    const entries = [];
    const fakeConsole = {
      log: (...args) => entries.push({ level: "log", text: args.map(formatArg).join(" ") }),
      warn: (...args) => entries.push({ level: "log", text: args.map(formatArg).join(" ") }),
      error: (...args) => entries.push({ level: "error", text: args.map(formatArg).join(" ") }),
    };

    try {
      // eslint-disable-next-line no-new-func
      const runner = new Function("console", `"use strict"; return (async () => {\n${code}\n})();`);
      await runner(fakeConsole);
    } catch (err) {
      entries.push({ level: "error", text: err instanceof Error ? `${err.name}: ${err.message}` : String(err) });
    }

    consoleEl.innerHTML =
      entries.length === 0
        ? `<p class="ecma-playground-console-empty">(콘솔 출력 없음 — console.log를 호출하는 코드를 실행해보세요)</p>`
        : entries
            .map((e) => `<div class="ecma-console-item ${e.level}">${escapeHtml(e.text)}</div>`)
            .join("");
  }

  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", () => {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialCode },
    });
    consoleEl.innerHTML = `<p class="ecma-playground-console-empty">▶ 버튼을 눌러 실행해보세요.</p>`;
  });

  run();
}
