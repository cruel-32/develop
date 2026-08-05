/**
 * CheerpJ(WASM JVM)로 실제 javac + java를 브라우저 안에서 실행하는 라이브 실습창.
 * ecmaPlayground.js/pgPlayground.ts와 같은 CodeMirror + 실행 버튼 UI를 따르되,
 * 컴파일/실행은 javaClient.ts를 거쳐 CheerpJ가 처리한다.
 *
 * postgre의 PGlite와 달리 CheerpJ 초기화(OpenJDK 로딩)는 무거워서 실행마다 새로
 * 만들지 않고 세션당 한 번만 이루어진다 — 그래서 첫 실행은 몇 초 걸릴 수 있다는
 * 안내를 로딩 상태에 넣는다.
 */

import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { java } from "@codemirror/lang-java";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { compileAndRun } from "./javaClient";

// react/vue/typescript/ecma/html-css/postgre 학습실과 색상을 맞춘 vsDark 팔레트.
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

export interface JavaPlaygroundOptions {
  code: string;
  badge?: string;
}

let instanceCounter = 0;

export function mountJavaPlayground(container: HTMLElement, opts: JavaPlaygroundOptions): void {
  const id = `java-playground-${instanceCounter++}`;
  const initialCode = opts.code.trim();

  container.innerHTML = `
    <div class="java-playground-wrapper">
      <div class="java-playground-toolbar">
        <span class="java-playground-label">
          코드를 직접 수정하고 실행해보세요
          ${opts.badge ? `<span class="badge">${escapeHtml(opts.badge)}</span>` : ""}
        </span>
        <div class="java-playground-actions">
          <button type="button" class="java-playground-reset" id="${id}-reset">⟳ 초기 코드로</button>
          <button type="button" class="java-playground-run" id="${id}-run">▶ 실행 (Ctrl+Enter)</button>
        </div>
      </div>
      <div class="java-playground-body">
        <div class="java-playground-editor" id="${id}-editor"></div>
        <div class="java-playground-console">
          <div class="java-playground-console-header">
            <span>실행 결과</span>
          </div>
          <div class="java-playground-console-body" id="${id}-output">
            <p class="java-playground-console-empty">▶ 버튼을 눌러 실행해보세요.</p>
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
        java(),
        lineNumbers(),
        vsDarkEditorTheme,
        syntaxHighlighting(vsDarkHighlightStyle),
        EditorView.lineWrapping,
      ],
    }),
  });

  let runGeneration = 0;

  function showLoading(text: string) {
    outputEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "java-playground-console-empty";
    p.textContent = text;
    outputEl.appendChild(p);
  }

  function showResult(status: "ok" | "warn" | "error", header: string, text: string) {
    outputEl.innerHTML = "";
    const headerEl = document.createElement("p");
    headerEl.className = `java-result-header ${status}`;
    headerEl.textContent = header;
    outputEl.appendChild(headerEl);

    const pre = document.createElement("pre");
    pre.className = "java-result-output";
    pre.textContent = text || "(콘솔 출력 없음)";
    outputEl.appendChild(pre);
  }

  async function run() {
    const generation = ++runGeneration;
    const code = view.state.doc.toString();

    showLoading("⏳ 컴파일하고 실행하는 중입니다... (처음 한 번은 Java 컴파일러를 불러오느라 몇 초 걸릴 수 있어요)");

    try {
      const result = await compileAndRun(code);
      if (generation !== runGeneration) return;

      if (result.compileExitCode !== 0) {
        showResult("error", "❌ 컴파일 오류", result.consoleText);
      } else if (result.runExitCode !== 0) {
        showResult("warn", `⚠ 실행 중 예외가 발생했습니다 (종료 코드 ${result.runExitCode})`, result.consoleText);
      } else {
        showResult("ok", "✅ 실행 완료", result.consoleText);
      }
    } catch (err) {
      if (generation !== runGeneration) return;
      showResult("error", "❌ 오류가 발생했습니다", err instanceof Error ? err.message : String(err));
    }
  }

  runBtn.addEventListener("click", run);
  resetBtn.addEventListener("click", () => {
    runGeneration++;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialCode },
    });
    outputEl.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "java-playground-console-empty";
    empty.textContent = "▶ 버튼을 눌러 실행해보세요.";
    outputEl.appendChild(empty);
  });

  run();
}
