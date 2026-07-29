<script setup lang="ts">
import { ref } from "vue";
import { Repl, useStore } from "@vue/repl";
import CodeMirror from "@vue/repl/codemirror-editor";

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

async function handleReset() {
  await store.setFiles(props.files, props.mainFile ?? "App.vue");
}
</script>

<template>
  <div class="vue-repl-wrapper">
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
        :store="store"
        :editor="CodeMirror"
        theme="dark"
        :show-compile-output="false"
        :show-import-map="false"
        :show-ts-config="false"
        :clear-console="true"
        layout="horizontal"
      />
    </div>
  </div>
</template>
