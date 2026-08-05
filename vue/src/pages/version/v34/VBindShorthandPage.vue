<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { ref } from 'vue'

const id = ref('user-1')
const title = ref('프로필 카드')
const disabled = ref(false)
<\/script>

<template>
  <!-- 아래 세 속성을 직접 바꿔보세요. 값이 바뀌면 축약 문법도 그대로 반응합니다. -->
  <div :id :title style="border: 1px solid #999; padding: 8px; border-radius: 6px;">
    <p>id = {{ id }}</p>
    <p>title = {{ title }}</p>
    <button :disabled>{{ disabled ? '비활성' : '활성' }} 버튼</button>
  </div>
</template>
`,
};
</script>

<template>
  <article>
    <h1>v-bind 동일 이름 축약 문법</h1>
    <p>
      Vue 3.4부터, 바인딩할 값의 변수 이름과 속성 이름이 같을 때 <code>:속성="속성"</code>을
      <code>:속성</code>만 써서 줄일 수 있다. 객체 리터럴의 shorthand property(<code>{ id }</code>가
      <code>{ id: id }</code>와 같은 것)와 같은 발상이다.
    </p>
    <p>
      예: <code>&lt;img :id="id" :src="src" :alt="alt"&gt;</code> →
      <code>&lt;img :id :src :alt&gt;</code>. 동작은 완전히 동일하고, 타이핑만 줄어든다.
    </p>

    <section>
      <h2>직접 해보기 — 축약 문법으로 바인딩하기</h2>
      <p class="hint">
        <code>:id</code>, <code>:title</code>, <code>:disabled</code>가 각각
        <code>:id="id"</code>, <code>:title="title"</code>, <code>:disabled="disabled"</code>의
        축약형입니다. <code>ref</code> 초깃값을 바꾸거나 축약 문법을 원래 문법으로 되돌려서
        똑같이 동작하는지 확인해보세요.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.4.38" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. 여러 속성을 한 번에 축약"
        code="<!-- 이전 -->
<input :value=&quot;value&quot; :placeholder=&quot;placeholder&quot; :disabled=&quot;disabled&quot; />

<!-- 3.4+ -->
<input :value :placeholder :disabled />"
      />

      <CodeBlock
        title="2. 이름이 다르면 축약할 수 없다"
        code="<!-- userId와 id가 이름이 다르므로 축약 불가 - 그대로 :id=&quot;userId&quot; 써야 함 -->
<div :id=&quot;userId&quot;></div>"
      />
    </section>
  </article>
</template>
