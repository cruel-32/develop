import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "section";
}

/**
 * 현재 페이지(article) 안의 h2/h3를 스캔해 "On this page" 목차를 만든다.
 * 페이지마다 목차 데이터를 손으로 유지할 필요 없이 실제 렌더링된 제목에서 자동으로 뽑아낸다.
 * lazy(Suspense)로 늦게 마운트되는 페이지도 잡아내기 위해 MutationObserver로 다시 스캔한다.
 */
export default function PageIndex({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function scan() {
      const nodes = Array.from(container!.querySelectorAll("h2, h3")) as HTMLElement[];
      const used = new Set<string>();
      const items = nodes.map((node): HeadingItem => {
        let id = node.id;
        if (!id) {
          const base = slugify(node.textContent ?? "");
          id = base;
          let i = 2;
          while (used.has(id)) {
            id = `${base}-${i++}`;
          }
          node.id = id;
        }
        used.add(id);
        return { id, text: node.textContent ?? "", level: node.tagName === "H2" ? 2 : 3 };
      });
      setHeadings(items);
    }

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, containerRef]);

  useEffect(() => {
    if (headings.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );
    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="page-index">
      <span className="page-index-label">On this page</span>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={`page-index-item level-${h.level}`}>
            <a href={`#${h.id}`} className={activeId === h.id ? "active" : undefined}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
