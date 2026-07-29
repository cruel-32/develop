<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { ref, watch, onWatcherCleanup } from 'vue'

const query = ref('')
const status = ref('')

watch(query, (q) => {
  if (!q) {
    status.value = ''
    return
  }
  status.value = \`"\${q}" 검색 중...\`

  const timer = setTimeout(() => {
    status.value = \`"\${q}" 검색 완료!\`
  }, 800)

  // 이 watcher가 다시 실행되기 전(즉 query가 또 바뀌기 전) 또는 컴포넌트가 사라질 때 호출된다.
  // 빠르게 다시 타이핑하면 이전 setTimeout이 항상 취소되므로, "완료!" 메시지가
  // 마지막으로 입력한 값에 대해서만 표시된다.
  onWatcherCleanup(() => {
    clearTimeout(timer)
  })
})
<\/script>

<template>
  <input v-model="query" placeholder="빠르게 여러 번 타이핑해보세요" />
  <p>{{ status }}</p>
</template>
`,
};
</script>

<template>
  <article>
    <h1>onWatcherCleanup</h1>
    <p>
      Vue 3.5에서 새로 추가된 API로, <code>watch</code>/<code>watchEffect</code> 콜백 안에서
      "다음 실행 직전 또는 컴포넌트 언마운트 시" 정리(cleanup) 로직을 등록한다. 예전에는
      콜백의 세 번째 인자로 받는 <code>onCleanup</code> 함수를 써야 했는데, 이 API는 어디서든
      전역으로 import해서 쓸 수 있어 정리 로직을 별도 함수로 분리하기 쉬워졌다.
    </p>
    <p>
      대표적인 용도는 오래된 요청/타이머 취소다 — 사용자가 빠르게 값을 바꿀 때마다 이전
      비동기 작업을 취소해서, 느리게 도착한 응답이 최신 상태를 덮어쓰는 문제(race condition)를
      막는다.
    </p>

    <section>
      <h2>직접 해보기 — 검색 디바운스/취소</h2>
      <p class="hint">
        입력창에 빠르게 여러 글자를 타이핑해보세요. 매 타이핑마다 이전 0.8초 타이머가
        취소되고 새로 시작되기 때문에, 타이핑을 멈춘 마지막 값에 대해서만 "검색 완료!"가
        뜹니다.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.5.40" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. fetch 요청 취소 (AbortController)"
        code="watch(userId, (id) => {
  const controller = new AbortController()

  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => { user.value = data })

  onWatcherCleanup(() => controller.abort())
})"
        language="typescript"
      />

      <CodeBlock
        title="2. watchEffect와 함께 쓰기"
        code="watchEffect(() => {
  const id = setInterval(() => console.log(count.value), 1000)
  onWatcherCleanup(() => clearInterval(id))
})"
        language="typescript"
      />
    </section>
  </article>
</template>
