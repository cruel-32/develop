<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const props = defineProps<{ container: HTMLElement | null }>();

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "section";
}

const route = useRoute();
const headings = ref<HeadingItem[]>([]);
const activeId = ref<string | null>(null);

let mutationObserver: MutationObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;

function scan() {
  const container = props.container;
  if (!container) return;
  const nodes = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[];
  const used = new Set<string>();
  headings.value = nodes.map((node) => {
    let id = node.id;
    if (!id) {
      const base = slugify(node.textContent ?? "");
      id = base;
      let i = 2;
      while (used.has(id)) {
        id = `${base}-${i++}`;
      }
      node.id = id;
    }
    used.add(id);
    return { id, text: node.textContent ?? "", level: (node.tagName === "H2" ? 2 : 3) as 2 | 3 };
  });
}

function setupObservers() {
  mutationObserver?.disconnect();
  const container = props.container;
  if (!container) return;

  scan();
  mutationObserver = new MutationObserver(scan);
  mutationObserver.observe(container, { childList: true, subtree: true });
}

// lazy(Suspense)로 늦게 마운트되는 페이지도 잡아내기 위해 라우트/컨테이너가 바뀔 때마다 다시 스캔한다.
watch(
  () => [route.fullPath, props.container] as const,
  () => setupObservers(),
  { immediate: true },
);

watch(headings, (list) => {
  intersectionObserver?.disconnect();
  if (list.length === 0) return;
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        activeId.value = visible[0].target.id;
      }
    },
    { rootMargin: "-10% 0px -70% 0px" },
  );
  for (const { id } of list) {
    const el = document.getElementById(id);
    if (el) intersectionObserver.observe(el);
  }
});

onBeforeUnmount(() => {
  mutationObserver?.disconnect();
  intersectionObserver?.disconnect();
});
</script>

<template>
  <aside v-if="headings.length > 0" class="page-index">
    <span class="page-index-label">On this page</span>
    <ul>
      <li v-for="h in headings" :key="h.id" :class="`page-index-item level-${h.level}`">
        <a :href="`#${h.id}`" :class="{ active: activeId === h.id }">{{ h.text }}</a>
      </li>
    </ul>
  </aside>
</template>
