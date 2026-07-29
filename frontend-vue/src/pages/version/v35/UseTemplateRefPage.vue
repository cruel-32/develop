<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// 문자열 ref 이름으로 template ref를 얻는다 - 변수를 미리 선언해두고
// template의 ref="my-input"과 이름만 맞추면 컴파일러가 자동으로 연결해준다.
const inputRef = useTemplateRef('my-input')

function focusInput() {
  inputRef.value?.focus()
}

onMounted(() => {
  focusInput()
})
<\/script>

<template>
  <input ref="my-input" placeholder="페이지를 열면 자동으로 포커스됩니다" />
  <button @click="focusInput" style="margin-left: 8px;">다시 포커스</button>
</template>
`,
};
</script>

<template>
  <article>
    <h1>useTemplateRef</h1>
    <p>
      Vue 3.5에서 새로 추가된 Composition API 함수다. 기존에는 <code>const inputRef =
      ref(null)</code>을 선언하고 템플릿에서 <code>ref="inputRef"</code>로 이름을 맞춰야
      했는데, <code>useTemplateRef(name)</code>은 그 둘을 명시적으로 연결해준다 — 특히 동적으로
      생성되는 여러 엘리먼트 중 하나를 문자열 이름으로 참조하고 싶을 때, 컴파일 타임에
      정적으로 분석 가능한 속성이 아니어도 동작한다는 장점이 있다.
    </p>
    <p>
      시그니처: <code>const elRef = useTemplateRef&lt;T&gt;(name: string)</code>. 반환된
      <code>elRef</code>는 읽기 전용 ref이고, 마운트 이후 <code>elRef.value</code>에
      실제 DOM 엘리먼트(또는 컴포넌트 인스턴스)가 들어온다.
    </p>

    <section>
      <h2>직접 해보기 — 자동 포커스</h2>
      <p class="hint">
        페이지를 처음 열면(또는 되돌리기를 누르면) 입력창에 자동으로 포커스가 갑니다.
        <code>onMounted</code> 안의 로직을 지우거나 바꿔보며 동작을 확인해보세요.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.5.40" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. v-for로 렌더링된 목록에서 특정 항목 참조"
        code="const itemRefs = useTemplateRef<HTMLLIElement[]>('items')

function scrollToThird() {
  itemRefs.value?.[2]?.scrollIntoView({ behavior: 'smooth' })
}"
        language="typescript"
      />

      <CodeBlock
        title="2. 자식 컴포넌트 인스턴스 참조 (메서드 호출)"
        code="const childRef = useTemplateRef<InstanceType<typeof MyChild>>('child')

function callChildMethod() {
  childRef.value?.someExposedMethod()
}"
        language="typescript"
      />
    </section>
  </article>
</template>
