import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import CodeBlock from "../../../components/CodeBlock";
import Playground from "../../../components/Playground";

const demoCode = `
interface Person {
  id: number;
  name: string;
  job: string;
}

interface PeoplePage {
  data: Person[];
  page: number;
  totalPages: number;
  total: number;
}

async function fetchPeople(page: number): Promise<PeoplePage> {
  const res = await fetch(\`/api/people?page=\${page}&pageSize=5\`);
  return res.json();
}

async function deletePerson(id: number): Promise<void> {
  await fetch(\`/api/people/\${id}\`, { method: "DELETE" });
}

// Playground는 매번 새 QueryClient를 만든다. 실제 앱에서는 모듈 스코프에서
// 딱 한 번만 만들어 최상단 QueryClientProvider 하나에만 물린다.
const queryClient = new QueryClient();

function PeopleList() {
  const [page, setPage] = useState(1);

  // queryKey가 바뀌면(page가 바뀌면) 자동으로 다시 fetch한다.
  // 같은 queryKey를 쓰는 다른 컴포넌트와 결과가 캐시로 공유된다.
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["people", page],
    queryFn: () => fetchPeople(page),
  });

  const queryClientRef = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      // people로 시작하는 모든 쿼리(모든 페이지)를 무효화 -> 자동 refetch
      queryClientRef.invalidateQueries({ queryKey: ["people"] });
    },
  });

  if (isPending) return <p>불러오는 중...</p>;
  if (isError) return <p style={{ color: "tomato" }}>에러: {String(error)}</p>;

  return (
    <div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.data.map((p) => (
          <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>#{p.id} {p.name} — {p.job}</span>
            <button
              onClick={() => removeMutation.mutate(p.id)}
              disabled={removeMutation.isPending}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>이전</button>
        <span>{page} / {data.totalPages} 페이지 {isFetching ? "(갱신 중...)" : ""}</span>
        <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>다음</button>
      </div>
    </div>
  );
}

function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PeopleList />
    </QueryClientProvider>
  );
}

render(<Demo />);
`;

export default function TanStackQueryPage() {
  return (
    <article>
      <h1>Data Fetching — TanStack Query</h1>
      <p>
        TanStack Query(구 React Query)는 서버 상태를 위한 라이브러리다. <code>useState</code> +{" "}
        <code>useEffect</code>로 직접 fetch/loading/에러를 관리하는 대신, <code>queryKey</code>
        기준으로 캐싱, 자동 재요청, 중복 요청 제거, 백그라운드 갱신을 대신 해준다. 여러
        컴포넌트가 같은 <code>queryKey</code>를 구독하면 네트워크 요청은 한 번만 일어나고 결과를
        공유한다.
      </p>

      <section>
        <h2>직접 해보기 — CRUD Demo 목록을 useQuery/useMutation으로</h2>
        <p className="hint">
          <code>useQuery</code>는 <code>queryKey: ["people", page]</code>로 목록을 가져오고,{" "}
          <code>useMutation</code>은 삭제 요청을 보낸 뒤 <code>invalidateQueries</code>로 목록을
          자동 갱신한다. Zustand 예제와 마찬가지로 CRUD Demo와 같은 실제 <code>/api/people</code>
          을 호출하므로, 여기서 삭제하면 CRUD Demo 목록에서도 사라진다.
        </p>
        <Playground
          code={demoCode}
          scope={{ useState, QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient }}
        />
      </section>

      <section>
        <h2>주요 메서드 / 옵션</h2>

        <CodeBlock
          title="1. useQuery — 기본 조회"
          code={`
function usePerson(id: number) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => {
      const res = await fetch(\`/api/people/\${id}\`);
      if (!res.ok) throw new Error("조회 실패");
      return res.json();
    },
    // id가 없을 때는 요청 자체를 보내지 않는다.
    enabled: id > 0,
    // 5초 동안은 "신선한" 데이터로 취급 -> 재마운트해도 재요청하지 않음
    staleTime: 5000,
  });
}

// data: 성공 시 응답 값 (기본 undefined)
// isPending: 캐시도 없고 아직 첫 응답도 안 옴
// isFetching: 캐시가 있어도 백그라운드에서 재요청 중이면 true
// isError / error: 실패 시 에러 상태
const { data, isPending, isFetching, isError, error } = usePerson(1);
`}
        />

        <CodeBlock
          title="2. useMutation — 생성/수정/삭제 + 캐시 무효화"
          code={`
const queryClient = useQueryClient();

const createPerson = useMutation({
  mutationFn: (input: PersonInput) =>
    fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((res) => {
      if (!res.ok) throw new Error("생성 실패");
      return res.json();
    }),
  onSuccess: () => {
    // 목록 쿼리를 무효화해서 useQuery가 자동으로 다시 fetch하게 만든다.
    queryClient.invalidateQueries({ queryKey: ["people"] });
  },
});

// mutate: 결과를 기다리지 않고 실행 (콜백으로 처리)
createPerson.mutate({ id: 10, name: "홍길동", age: 30, job: "개발자", address: null });

// mutateAsync: await 가능한 버전 - try/catch로 에러 처리할 때 유용
async function handleSubmit(input: PersonInput) {
  try {
    await createPerson.mutateAsync(input);
  } catch (err) {
    console.error(err);
  }
}
`}
        />

        <CodeBlock
          title="3. 낙관적 업데이트 (Optimistic Update)"
          code={`
const queryClient = useQueryClient();

const removePerson = useMutation({
  mutationFn: (id: number) => fetch(\`/api/people/\${id}\`, { method: "DELETE" }),

  // 요청이 서버에 도달하기 전에 UI를 먼저 바꾼다.
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["people"] });
    const previous = queryClient.getQueryData(["people"]);

    queryClient.setQueryData(["people"], (old: PeoplePage | undefined) =>
      old ? { ...old, data: old.data.filter((p) => p.id !== id) } : old,
    );

    // onError로 넘겨줄 롤백용 컨텍스트
    return { previous };
  },

  // 실패하면 onMutate에서 저장해둔 이전 데이터로 되돌린다.
  onError: (_err, _id, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["people"], context.previous);
    }
  },

  // 성공/실패 여부와 무관하게 서버 상태와 최종 동기화.
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["people"] });
  },
});
`}
        />

        <CodeBlock
          title="4. useInfiniteQuery — 무한 스크롤 / 더 보기"
          code={`
const {
  data,       // { pages: PeoplePage[], pageParams: number[] }
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["people", "infinite"],
  queryFn: ({ pageParam }) => fetchPeople(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage) =>
    lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
});

// data.pages는 지금까지 불러온 페이지들의 배열이다.
const allPeople = data?.pages.flatMap((page) => page.data) ?? [];

<button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
</button>
`}
        />

        <CodeBlock
          title="5. QueryClient 전역 설정"
          code={`
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30초간 캐시를 신선한 것으로 취급
      retry: 1,                // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 끄기
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PeopleList />
    </QueryClientProvider>
  );
}
`}
        />
      </section>
    </article>
  );
}
