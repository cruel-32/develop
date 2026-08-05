<script setup lang="ts">
import { computed } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup";

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    title?: string;
  }>(),
  { language: "markup" },
);

const highlighted = computed(() => {
  const grammar = Prism.languages[props.language] ?? Prism.languages.markup;
  return Prism.highlight(props.code.trim(), grammar, props.language);
});
</script>

<template>
  <div class="code-block-wrapper">
    <p v-if="title" class="code-title">{{ title }}</p>
    <pre class="code-block"><code v-html="highlighted"></code></pre>
  </div>
</template>
