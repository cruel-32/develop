<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "./Sidebar.vue";
import PageIndex from "./PageIndex.vue";
import ErrorBoundary from "./ErrorBoundary.vue";
import { menuTree } from "../menu";

const route = useRoute();
const contentEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <a class="back" href="/">← 전체 메뉴로</a>
      <span class="topbar-title">Vue 학습실</span>
    </header>
    <div class="body">
      <Sidebar :tree="menuTree" />
      <main class="content" ref="contentEl">
        <!-- route별로 key를 줘서 페이지를 옮기면 이전 페이지의 크래시 상태가 남지 않게 한다 -->
        <ErrorBoundary :key="route.fullPath">
          <RouterView />
        </ErrorBoundary>
      </main>
      <PageIndex :container="contentEl" />
    </div>
  </div>
</template>
