<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Person, PersonInput, PeoplePage } from "./types";
import PersonForm from "./components/PersonForm.vue";

const PAGE_SIZE = 5;

const page = ref(1);
const peoplePage = ref<PeoplePage | null>(null);
const selectedId = ref<number | null>(null);
const selectedPerson = ref<Person | null>(null);
const error = ref<string | null>(null);

const emptyPerson: PersonInput = { id: 0, name: "", age: 0, job: "", address: null };

async function loadList() {
  const res = await fetch(`/api/people?page=${page.value}&pageSize=${PAGE_SIZE}`);
  peoplePage.value = await res.json();
}

async function loadDetail(id: number) {
  const res = await fetch(`/api/people/${id}`);
  selectedPerson.value = await res.json();
}

watch(page, () => {
  loadList().catch((err) => (error.value = String(err)));
});

watch(selectedId, (id) => {
  if (id !== null) {
    loadDetail(id).catch((err) => (error.value = String(err)));
  }
});

loadList().catch((err) => (error.value = String(err)));

async function handleCreate(input: PersonInput) {
  error.value = null;
  const res = await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    error.value = (await res.json()).error ?? "생성 실패";
    return;
  }
  page.value = 1;
  await loadList();
}

async function handleUpdate(input: PersonInput) {
  if (selectedId.value === null) return;
  error.value = null;
  const res = await fetch(`/api/people/${selectedId.value}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    error.value = (await res.json()).error ?? "수정 실패";
    return;
  }
  const updated: Person = await res.json();
  if (updated.id !== selectedId.value) {
    // id를 바꿔서 저장한 경우 - selectedId도 새 id로 옮겨준다.
    selectedId.value = updated.id;
    return;
  }
  selectedPerson.value = updated;
}

async function handleDelete(id: number) {
  await fetch(`/api/people/${id}`, { method: "DELETE" });
  if (selectedId.value === id) {
    selectedId.value = null;
  }
  await loadList();
}

const detailInitial = computed<PersonInput>(() =>
  selectedPerson.value
    ? {
        id: selectedPerson.value.id,
        name: selectedPerson.value.name,
        age: selectedPerson.value.age,
        job: selectedPerson.value.job,
        address: selectedPerson.value.address,
      }
    : emptyPerson,
);
</script>

<template>
  <main class="app">
    <h1>Vue CRUD Demo</h1>
    <a class="back" href="/">← 메뉴로</a>
    <p>
      백엔드의 Express + Drizzle ORM + Postgres 스택으로 만든 <code>/api/people</code>를
      호출하는 데모입니다. 페이지네이션이 있는 목록과, 개별 레코드의 상세 조회/수정/삭제를
      지원합니다. id는 자동 생성이 아니라 직접 지정하는 값입니다.
    </p>

    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="selectedId === null">
      <h3>새 사람 추가</h3>
      <p class="hint">
        id는 자동 생성되지 않습니다 — 직접 원하는 번호를 지정하세요. 이미 존재하는 id를
        입력하면 중복 오류가 표시됩니다.
      </p>
      <PersonForm :initial="emptyPerson" submit-label="추가" @submit="handleCreate" />

      <ul class="item-list">
        <li v-for="person in peoplePage?.data ?? []" :key="person.id">
          <div>
            <span class="hint">#{{ person.id }}</span>
            <strong>{{ person.name }}</strong> ({{ person.age }}세) — {{ person.job }}
          </div>
          <div style="display: flex; gap: 8px">
            <button type="button" @click="selectedId = person.id">상세보기</button>
            <button type="button" @click="handleDelete(person.id)">삭제</button>
          </div>
        </li>
      </ul>

      <div v-if="peoplePage" class="inline-form">
        <button type="button" :disabled="page <= 1" @click="page -= 1">이전</button>
        <span class="hint">
          {{ peoplePage.page }} / {{ peoplePage.totalPages }} 페이지 (총 {{ peoplePage.total }}명)
        </span>
        <button type="button" :disabled="page >= peoplePage.totalPages" @click="page += 1">
          다음
        </button>
      </div>
    </section>

    <section v-else>
      <button type="button" @click="selectedId = null">← 목록으로</button>
      <h3 v-if="selectedPerson">상세 정보 (id: {{ selectedPerson.id }})</h3>
      <PersonForm
        v-if="selectedPerson"
        :initial="detailInitial"
        submit-label="저장"
        @submit="handleUpdate"
      />
      <button
        v-if="selectedPerson"
        type="button"
        style="margin-top: 8px"
        @click="handleDelete(selectedPerson.id)"
      >
        이 사람 삭제
      </button>
    </section>
  </main>
</template>

<style scoped>
.app {
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.back {
  color: #93c5fd;
  text-decoration: none;
  font-size: 0.875rem;
}

.inline-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 0.75rem 0;
}

.inline-form input {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #334155;
  background: #1e293b;
  color: inherit;
}

.inline-form button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.hint {
  color: #94a3b8;
  font-size: 0.875rem;
}

.error {
  color: #f87171;
}

.item-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #1e293b;
}

.item-list button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #ef4444;
  background: transparent;
  color: #f87171;
  cursor: pointer;
}
</style>
