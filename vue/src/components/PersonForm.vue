<script setup lang="ts">
import { ref, watch } from "vue";
import type { PersonInput } from "../types";

const props = defineProps<{
  initial: PersonInput;
  submitLabel: string;
}>();

const emit = defineEmits<{
  submit: [input: PersonInput];
}>();

const id = ref(props.initial.id === 0 ? "" : String(props.initial.id));
const name = ref(props.initial.name);
const age = ref(String(props.initial.age));
const job = ref(props.initial.job);
const address = ref(props.initial.address ?? "");

watch(
  () => props.initial,
  (next) => {
    id.value = next.id === 0 ? "" : String(next.id);
    name.value = next.name;
    age.value = String(next.age);
    job.value = next.job;
    address.value = next.address ?? "";
  },
);

function handleSubmit() {
  emit("submit", {
    id: Number(id.value),
    name: name.value,
    age: Number(age.value),
    job: job.value,
    address: address.value.trim() ? address.value.trim() : null,
  });
}
</script>

<template>
  <form class="inline-form" @submit.prevent="handleSubmit">
    <input v-model="id" type="number" min="1" placeholder="id (직접 지정)" required style="width: 5.5rem" />
    <input v-model="name" placeholder="이름" required />
    <input v-model="age" type="number" min="0" placeholder="나이" required style="width: 5rem" />
    <input v-model="job" placeholder="직업" required />
    <input v-model="address" placeholder="주소 (선택)" />
    <button type="submit">{{ submitLabel }}</button>
  </form>
</template>
