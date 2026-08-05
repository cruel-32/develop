import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ErrorBoundary from "./ErrorBoundary";
import PageIndex from "./PageIndex";
import { menuTree } from "../menu";

export default function Layout() {
  const { pathname } = useLocation();
  const contentRef = useRef<HTMLElement>(null);

  return (
    <div className="layout">
      <header className="topbar">
        <a className="back" href="/">
          ← 전체 메뉴로
        </a>
        <span className="topbar-title">React 학습실</span>
      </header>
      <div className="body">
        <Sidebar tree={menuTree} />
        <main className="content" ref={contentRef}>
          {/* pathname을 key로 줘서 페이지를 옮기면 이전 페이지의 크래시 상태가 남지 않게 한다 */}
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <PageIndex containerRef={contentRef} />
      </div>
    </div>
  );
}
