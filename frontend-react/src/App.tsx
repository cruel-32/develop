import { lazy, Suspense, type ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

// react-live(+sucrase)는 번들이 꽤 크기 때문에, Playground를 쓰는 레슨 페이지들만
// 방문 시점에 lazy 로드한다. Home은 그 비용을 지불하지 않는다.
// lazy()는 반드시 모듈 스코프에서 한 번만 호출해야 한다 (렌더 중에 매번 호출하면
// 매번 새 컴포넌트 정체성이 생겨 리마운트/재요청이 반복된다).
const UseIdPage = lazy(() => import("./pages/version/v18/UseIdPage"));
const UseTransitionPage = lazy(() => import("./pages/version/v18/UseTransitionPage"));
const UseDeferredValuePage = lazy(() => import("./pages/version/v18/UseDeferredValuePage"));
const UseSyncExternalStorePage = lazy(() => import("./pages/version/v18/UseSyncExternalStorePage"));
const UseInsertionEffectPage = lazy(() => import("./pages/version/v18/UseInsertionEffectPage"));
const UseActionStatePage = lazy(() => import("./pages/version/v19/UseActionStatePage"));
const UseOptimisticPage = lazy(() => import("./pages/version/v19/UseOptimisticPage"));
const UsePage = lazy(() => import("./pages/version/v19/UsePage"));
const UseFormStatusPage = lazy(() => import("./pages/version/v19/UseFormStatusPage"));
const ZustandPage = lazy(() => import("./pages/external-module/store/ZustandPage"));
const TanStackQueryPage = lazy(() => import("./pages/external-module/data-fetching/TanStackQueryPage"));
const CrudDemoPage = lazy(() => import("./pages/crud/CrudDemoPage"));

function PageFallback() {
  return <p className="hint">불러오는 중...</p>;
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="version/v18/use-id" element={withSuspense(UseIdPage)} />
        <Route path="version/v18/use-transition" element={withSuspense(UseTransitionPage)} />
        <Route path="version/v18/use-deferred-value" element={withSuspense(UseDeferredValuePage)} />
        <Route
          path="version/v18/use-sync-external-store"
          element={withSuspense(UseSyncExternalStorePage)}
        />
        <Route path="version/v18/use-insertion-effect" element={withSuspense(UseInsertionEffectPage)} />
        <Route path="version/v19/use-action-state" element={withSuspense(UseActionStatePage)} />
        <Route path="version/v19/use-optimistic" element={withSuspense(UseOptimisticPage)} />
        <Route path="version/v19/use" element={withSuspense(UsePage)} />
        <Route path="version/v19/use-form-status" element={withSuspense(UseFormStatusPage)} />
        <Route path="external-module/store/zustand" element={withSuspense(ZustandPage)} />
        <Route
          path="external-module/data-fetching/tanstack-query"
          element={withSuspense(TanStackQueryPage)}
        />
        <Route path="crud-demo" element={withSuspense(CrudDemoPage)} />
      </Route>
    </Routes>
  );
}
