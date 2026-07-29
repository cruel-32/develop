<script setup lang="ts">
import VueRepl from "../../../components/VueRepl.vue";
import CodeBlock from "../../../components/CodeBlock.vue";

const files = {
  "App.vue": `<script setup lang="ts">
import { useId } from 'vue'

// 호출할 때마다 이 앱 안에서 유일하고 안정적인 id를 만들어준다.
const nameId = useId()
const emailId = useId()
<\/script>

<template>
  <div style="margin-bottom: 8px;">
    <label :for="nameId">이름</label>
    <input :id="nameId" style="margin-left: 6px;" />
    <div style="font-size: 12px; color: #94a3b8;">생성된 id: {{ nameId }}</div>
  </div>
  <div>
    <label :for="emailId">이메일</label>
    <input :id="emailId" type="email" style="margin-left: 6px;" />
    <div style="font-size: 12px; color: #94a3b8;">생성된 id: {{ emailId }}</div>
  </div>
</template>
`,
};
</script>

<template>
  <article>
    <h1>useId</h1>
    <p>
      Vue 3.5에서 새로 추가된 API로, 호출할 때마다 애플리케이션 안에서 유일하면서 서버/클라이언트
      렌더링 결과가 항상 같은(hydration mismatch가 나지 않는) id를 만들어준다. 폼 요소의
      <code>label</code>/<code>input</code> 연결(<code>for</code>/<code>id</code>) 같은
      접근성 속성에 id를 하드코딩하면 같은 컴포넌트를 여러 번 쓸 때 id가 중복되는데,
      <code>useId()</code>는 이 문제를 해결한다.
    </p>
    <p>
      시그니처: <code>const id = useId()</code>. 인자가 없고, 호출될 때마다 다른
      문자열(예: <code>"v-0"</code>, <code>"v-1"</code>)을 반환한다.
    </p>

    <section>
      <h2>직접 해보기 — 폼 필드에 안정적인 id 붙이기</h2>
      <p class="hint">
        같은 컴포넌트 안에서 <code>useId()</code>를 두 번 호출해 서로 다른 id가
        생성되는지 확인해보세요. 코드를 고쳐 <code>useId()</code> 호출을 하나 더
        추가해봐도 좋습니다.
      </p>
      <VueRepl :files="files" main-file="App.vue" vue-version="3.5.40" />
    </section>

    <section>
      <h2>다른 사용 패턴</h2>

      <CodeBlock
        title="1. 여러 접근성 속성을 하나의 id에서 파생시키기"
        code="const id = useId()
const hintId = `${id}-hint`

// <input :id=&quot;id&quot; :aria-describedby=&quot;hintId&quot; />
// <p :id=&quot;hintId&quot;>도움말 텍스트</p>"
        language="typescript"
      />

      <CodeBlock
        title="2. 재사용 컴포넌트 안에서 사용 (컴포넌트마다 다른 id)"
        code="// FormField.vue - 이 컴포넌트를 여러 번 써도 id가 절대 겹치지 않는다
const id = useId()"
        language="typescript"
      />
    </section>
  </article>
</template>
