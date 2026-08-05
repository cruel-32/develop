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

/**
 * 브라우저 개발자 도구 콘솔이 값을 찍는 방식(Set(2) {'a', 'b'}, [1, 2], { a: 1 } 등)을
 * 최대한 흉내낸다. JSON.stringify는 Set/Map/함수/undefined/Symbol을 직렬화하지 못하거나
 * (Set·Map은 자체 열거 속성이 없어 "{}"가 되어버림) 아예 다른 값으로 바꿔버려서 실제
 * 브라우저 콘솔 출력과 딴판이 되는 문제가 있었다.
 */
function formatValue(value, seen = new Set()) {
  if (typeof value === "string") return `'${value}'`;
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "function") {
    const name = value.name || "anonymous";
    return value.prototype && /^class\s/.test(Function.prototype.toString.call(value))
      ? `class ${name}`
      : `ƒ ${name}()`;
  }
  if (typeof value === "symbol") return value.toString();
  if (value === null || typeof value !== "object") return String(value);

  if (seen.has(value)) return "[Circular]";
  seen = new Set(seen).add(value);

  if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();

  if (Array.isArray(value)) {
    return `[ ${value.map((v) => formatValue(v, seen)).join(", ")} ]`;
  }
  if (value instanceof Set) {
    const items = [...value].map((v) => formatValue(v, seen)).join(", ");
    return `Set(${value.size}) {${items ? ` ${items} ` : ""}}`;
  }
  if (value instanceof Map) {
    const items = [...value].map(([k, v]) => `${formatValue(k, seen)} => ${formatValue(v, seen)}`).join(", ");
    return `Map(${value.size}) {${items ? ` ${items} ` : ""}}`;
  }

  const ctorName = value.constructor && value.constructor !== Object ? `${value.constructor.name} ` : "";
  const entries = Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v, seen)}`);
  return `${ctorName}{${entries.length ? ` ${entries.join(", ")} ` : ""}}`;
}

function formatArg(arg) {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.stack ?? `${arg.name}: ${arg.message}`;
  try {
    return formatValue(arg);
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

  // setTimeout/Promise.then처럼 async 래퍼가 끝난 뒤에도 계속 들어오는 로그가 많다
  // (예: Promise.all(...).then(cb) 를 await 하지 않고 그냥 실행문으로 남겨둔 예제).
  // 그래서 "실행 완료 후 한 번에 렌더링"이 아니라 로그가 들어올 때마다 즉시 append한다.
  // runGeneration으로 리셋/재실행 이후에도 뒤늦게 도착하는 이전 실행의 로그를 걸러낸다.
  let runGeneration = 0;

  function appendConsoleEntry(generation, level, text) {
    if (generation !== runGeneration) return;
    if (consoleEl.dataset.empty === "true") {
      consoleEl.innerHTML = "";
      consoleEl.dataset.empty = "false";
    }
    const item = document.createElement("div");
    item.className = `ecma-console-item ${level}`;
    item.textContent = text;
    consoleEl.appendChild(item);
  }

  async function run() {
    const generation = ++runGeneration;
    const code = view.state.doc.toString();

    consoleEl.innerHTML = "";
    consoleEl.dataset.empty = "true";

    const fakeConsole = {
      log: (...args) => appendConsoleEntry(generation, "log", args.map(formatArg).join(" ")),
      warn: (...args) => appendConsoleEntry(generation, "warn", args.map(formatArg).join(" ")),
      error: (...args) => appendConsoleEntry(generation, "error", args.map(formatArg).join(" ")),
    };

    try {
      // eslint-disable-next-line no-new-func
      const runner = new Function("console", `"use strict"; return (async () => {\n${code}\n})();`);
      await runner(fakeConsole);
    } catch (err) {
      appendConsoleEntry(
        generation,
        "error",
        err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      );
    }

    if (generation === runGeneration && consoleEl.dataset.empty === "true") {
      consoleEl.innerHTML = `<p class="ecma-playground-console-empty">(콘솔 출력 없음 — console.log를 호출하는 코드를 실행해보세요)</p>`;
    }
  }

  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", () => {
    runGeneration++;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialCode },
    });
    consoleEl.innerHTML = `<p class="ecma-playground-console-empty">▶ 버튼을 눌러 실행해보세요.</p>`;
  });

  run();
}
