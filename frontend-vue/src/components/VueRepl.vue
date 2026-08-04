<script setup lang="ts">
import { ref } from "vue";
import { Repl, useStore } from "@vue/repl";
import CodeMirror from "@vue/repl/codemirror-editor";
// 이 CSS 안에 `.dark .vue-repl { --bg: ...; }` 같은 다크 테마 변수가 들어있다.
// theme="dark" prop만으로는 적용되지 않고, 이 스타일시트가 로드되어 있어야
// 그 prop이 실제로 어두운 배색으로 반영된다(공식 README의 "3.0부터 필요 없음" 안내는
// .dark 클래스를 직접 토글할 필요가 없다는 뜻이지, CSS 자체가 필요 없다는 뜻이 아니었다).
import "@vue/repl/style.css";

/**
 * 실제 @vue/compiler-sfc + Vue 런타임을 CDN에서 불러와 돌리는 진짜 Vue SFC 플레이그라운드
 * (play.vuejs.org와 같은 공식 컴포넌트). defineModel, Reactive Props Destructure처럼
 * 컴파일러 매크로가 필요한 기능은 이 방식이 아니면 정확히 재현할 수 없다.
 *
 * - vueVersion으로 정확한 마이너 버전(예: "3.4.38")을 고정해, 그 버전에서 실제로
 *   동작하는 모습 그대로 보여준다.
 * - 미리보기는 진짜 sandboxed iframe에서 실행되므로(react-live의 same-realm 실행과
 *   달리) 편집 코드가 우리 페이지의 DOM/전역에 접근할 수 없다.
 */
const props = defineProps<{
  files: Record<string, string>;
  mainFile?: string;
  vueVersion: string;
}>();

const store = useStore({
  vueVersion: ref(props.vueVersion),
});

store.setFiles(props.files, props.mainFile ?? "App.vue");

// @vue/repl은 Auto Save를 켜면 250ms debounce로 즉시 컴파일/실행하는데, 이게 타이핑
// 중간중간 튀는 느낌을 줘서 기본은 꺼둔다(수동으로 켤 수는 있음). Show Error도 기본은
// 접어둔다 - 이 라이브러리는 이 두 상태를 각각 다른 방식으로 관리한다:
// - autoSave는 Repl의 v-model(모델 값)로 컴포넌트 밖에서 직접 제어된다.
// - showError는 컴포넌트 내부 상태라 밖에서 prop으로 못 주고, localStorage의
//   "repl_show_error" 키를 초기값으로 읽는다(EditorContainer.vue 참고) - 그래서 마운트
//   전에 그 키를 미리 심어준다. 사용자가 이미 한 번이라도 토글을 만졌다면 그 선택을
//   존중해 덮어쓰지 않는다.
const autoSave = ref(false);
if (localStorage.getItem("repl_show_error") === null) {
  localStorage.setItem("repl_show_error", "false");
}

async function handleReset() {
  await store.setFiles(props.files, props.mainFile ?? "App.vue");
}
</script>

<template>
  <div class="vue-repl-wrapper dark">
    <div class="vue-repl-toolbar">
      <span class="vue-repl-label">
        코드를 직접 수정해보세요
        <span class="vue-repl-version-badge">Vue {{ vueVersion }}</span>
      </span>
      <button type="button" class="vue-repl-reset" @click="handleReset">
        ⟳ 초기 코드로 되돌리기
      </button>
    </div>
    <div class="vue-repl-body">
      <Repl
        v-model="autoSave"
        :store="store"
        :editor="CodeMirror"
        theme="dark"
        preview-theme
        :show-compile-output="false"
        :show-import-map="false"
        :show-ts-config="false"
        :clear-console="true"
        layout="horizontal"
      />
    </div>
  </div>
</template>
