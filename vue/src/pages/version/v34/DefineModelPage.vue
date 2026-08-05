<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

const text = ref('안녕하세요')
<\/script>

<template>
  <CustomInput v-model="text" />
  <p>부모가 가진 값: {{ text }}</p>
</template>
`,
  "CustomInput.vue": `<script setup lang="ts">
// defineModel()이 곧 "v-model을 지원하는 props+emit 쌍"을 한 번에 만들어준다.
const model = defineModel<string>()
<\/script>

<template>
  <input v-model="model" placeholder="입력해보세요" />
</template>
`,
};
</script>

<template>
  <article>
    <h1>defineModel</h1>
    <p>
      Vue 3.4에서 정식(stable) 도입된 <code>&lt;script setup&gt;</code> 매크로다. 컴포넌트가
      <code>v-model</code>을 지원하도록 만들려면 원래 <code>props.modelValue</code> +
      <code>emit("update:modelValue", ...)</code> 쌍을 손으로 다 연결해야 했는데,
      <code>defineModel()</code>은 이 둘을 하나의 반응형 ref처럼 다룰 수 있게 묶어준다.
    </p>
    <p>
      시그니처: <code>const model = defineModel&lt;T&gt;()</code>. 반환된 <code>model</code>은
      부모가 <code>v-model="x"</code>로 넘긴 값을 읽고, <code>model.value = ...</code>로
      대입하면 자동으로 부모 쪽 값도 갱신된다(내부적으로 <code>update:modelValue</code> 이벤트를
      발생시킨다).
    </p>

    <section>
      <h2>직접 해보기 — 커스텀 input 컴포넌트</h2>
      <p class="hint">
        <code>CustomInput.vue</code>에 입력하면 <code>App.vue</code>의
        <code>text</code>가 실시간으로 바뀌는 걸 확인해보세요. 파일 탭을 눌러 두 파일을
        오갈 수 있습니다. 실제 <code>@vue/compiler-sfc</code>가 이 코드를 컴파일하므로,
        <code>defineModel</code> 같은 매크로도 진짜 동작 그대로 확인할 수 있습니다.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.4.38" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. 기본값과 필수 여부 지정"
        code="const model = defineModel<string>({ default: '', required: false })"
      />

      <CodeBlock
        title="2. 여러 개의 v-model (이름 붙은 모델)"
        code="const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')

// 부모: <UserName v-model:first-name=&quot;first&quot; v-model:last-name=&quot;last&quot; />"
        language="typescript"
      />

      <CodeBlock
        title="3. modifiers 읽기 (v-model.trim 같은 수식어)"
        code="const [model, modifiers] = defineModel<string>({
  set(value) {
    return modifiers.trim ? value.trim() : value
  },
})"
        language="typescript"
      />
    </section>
  </article>
</template>
