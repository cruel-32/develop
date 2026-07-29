<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err));
  console.error("[ErrorBoundary]", err);
  return false; // 에러가 상위 컴포넌트 트리로 계속 전파되지 않게 막는다
});

function reset() {
  error.value = null;
}
</script>

<template>
  <div v-if="error" class="crash-box">
    <h2>페이지를 표시하는 중 문제가 발생했습니다</h2>
    <p class="error">{{ error.message }}</p>
    <button type="button" @click="reset">다시 시도</button>
  </div>
  <slot v-else />
</template>
