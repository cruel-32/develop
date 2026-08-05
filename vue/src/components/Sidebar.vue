<script setup lang="ts">
import MenuItem from "./MenuItem.vue";
import type { MenuNode } from "../menu";

defineProps<{ tree: MenuNode[] }>();
</script>

<template>
  <nav class="sidebar">
    <MenuItem v-for="node in tree" :key="node.id" :node="node" />
  </nav>
</template>
