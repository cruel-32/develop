<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { ref } from 'vue'
import Greeting from './Greeting.vue'

const name = ref('철수')
<\/script>

<template>
  <input v-model="name" placeholder="이름 입력" />
  <Greeting :name="name" />
  <Greeting greeting="반가워요" />
</template>
`,
  "Greeting.vue": `<script setup lang="ts">
// defineProps()에서 바로 구조 분해해도 반응성이 살아있다 (3.5부터 안정화).
// 컴파일러가 사용하는 곳마다 자동으로 props.name, props.greeting으로 바꿔준다.
const { name = '손님', greeting = '안녕하세요' } = defineProps<{
  name?: string
  greeting?: string
}>()
<\/script>

<template>
  <p>{{ greeting }}, {{ name }}님!</p>
</template>
`,
};
</script>

<template>
  <article>
    <h1>Reactive Props Destructure</h1>
    <p>
      Vue 3.5에서 정식(stable) 도입됐다. 원래 <code>defineProps()</code>의 반환값을 그대로
      구조 분해하면 반응성이 끊어졌다(구조 분해 시점의 값이 스냅샷으로 복사되기 때문). 그래서
      <code>props.name</code>처럼 항상 <code>props.</code>를 붙여 접근해야 했는데, 3.5부터는
      컴파일러가 구조 분해된 변수를 쓰는 자리마다 자동으로 <code>props.xxx</code>로
      바꿔치기해줘서, 구조 분해해도 반응성이 그대로 유지된다.
    </p>
    <p>
      기본값 지정도 자연스러운 JS 문법(<code>= 기본값</code>)으로 가능해져서, 예전의
      <code>withDefaults(defineProps&lt;...&gt;(), { ... })</code> 보일러플레이트가 필요 없다.
    </p>

    <section>
      <h2>직접 해보기 — 구조 분해된 props로 인사말 만들기</h2>
      <p class="hint">
        <code>Greeting.vue</code>는 <code>props.name</code>이 아니라 구조 분해한
        <code>name</code>을 바로 쓰고 있는데도 부모의 입력값이 실시간으로 반영됩니다. 두 번째
        <code>&lt;Greeting greeting="반가워요" /&gt;</code>처럼 name을 안 넘기면 기본값(&quot;손님&quot;)이
        쓰이는 것도 확인해보세요.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.5.40" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. 구조 분해한 props를 watch할 때는 getter로 감싸기"
        code="const { count } = defineProps<{ count: number }>()

// 잘못된 예: count는 구조 분해 시점 값이라 반응성 추적이 안 됨
// watch(count, () => {})

// 올바른 예: getter 함수로 감싸서 넘긴다
watch(() => count, (newCount) => {
  console.log('count가', newCount, '로 바뀜')
})"
        language="typescript"
      />

      <CodeBlock
        title="2. 변수명이 겹칠 때 (섀도잉)는 자동 변환에서 제외된다"
        code="const { count } = defineProps<{ count: number }>()

function log(count: number) {
  // 이 count는 함수 매개변수이므로 props.count로 바뀌지 않는다
  console.log(count)
}"
        language="typescript"
      />
    </section>
  </article>
</template>
