interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

let intersectionObserver: IntersectionObserver | null = null;

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "section";
}

/** 현재 콘텐츠 안의 h2/h3를 스캔해 "On this page" 목차를 그리고 스크롤 스파이를 건다. */
export function updatePageIndex(contentEl: HTMLElement, pageIndexEl: HTMLElement): void {
  intersectionObserver?.disconnect();

  const nodes = Array.from(contentEl.querySelectorAll("h2, h3")) as HTMLElement[];
  if (nodes.length === 0) {
    pageIndexEl.hidden = true;
    pageIndexEl.innerHTML = "";
    return;
  }

  const used = new Set<string>();
  const headings: HeadingItem[] = nodes.map((node) => {
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

  pageIndexEl.hidden = false;
  pageIndexEl.innerHTML = `
    <span class="page-index-label">On this page</span>
    <ul>
      ${headings
        .map(
          (h) =>
            `<li class="page-index-item level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`,
        )
        .join("")}
    </ul>
  `;

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) return;
      const id = visible[0].target.id;
      pageIndexEl.querySelectorAll("a").forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
      });
    },
    { rootMargin: "-10% 0px -70% 0px" },
  );
  for (const h of headings) {
    const el = document.getElementById(h.id);
    if (el) intersectionObserver.observe(el);
  }
}
