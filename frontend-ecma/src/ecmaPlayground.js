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
 * 에디터는 CodeMirror 6(javascript 언어 지원)로 구성하되, 정적 코드 예시(codeBlock)와
 * react-live(CodeBlock/Playground)가 쓰는 prism-react-renderer의 vsDark 팔레트를 그대로
 * 옮겨써서, 세 프로젝트의 코드 색상이 완전히 동일하게 보이도록 한다.
 */

import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// prism-react-renderer의 themes.vsDark와 동일한 색상값(VS Code Dark+ 계열)
const vsDarkHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "rgb(106, 153, 85)" },
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: "rgb(86, 156, 214)" },
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
        lineNumbers(),
        vsDarkEditorTheme,
        syntaxHighlighting(vsDarkHighlightStyle),
        EditorView.lineWrapping,
      ],
    }),
  });

  async function run() {
    const code = view.state.doc.toString();
    const entries = [];
    const fakeConsole = {
      log: (...args) => entries.push({ level: "log", text: args.map(formatArg).join(" ") }),
      warn: (...args) => entries.push({ level: "warn", text: args.map(formatArg).join(" ") }),
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
