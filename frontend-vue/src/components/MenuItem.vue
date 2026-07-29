<script setup lang="ts">
import type { MenuNode } from "../menu";

defineProps<{ node: MenuNode }>();
</script>

<template>
  <details v-if="node.children" class="menu-group" open>
    <summary>{{ node.label }}</summary>
    <div class="menu-children">
      <MenuItem v-for="child in node.children" :key="child.id" :node="child" />
    </div>
  </details>
  <RouterLink v-else :to="`/${node.path ?? ''}`" class="menu-link" exact-active-class="active">
    {{ node.label }}
  </RouterLink>
</template>
