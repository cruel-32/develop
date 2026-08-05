import { NavLink } from "react-router-dom";
import type { MenuNode } from "../menu";

function MenuItem({ node }: { node: MenuNode }) {
  if (node.children) {
    return (
      <details className="menu-group" open>
        <summary>{node.label}</summary>
        <div className="menu-children">
          {node.children.map((child) => (
            <MenuItem key={child.id} node={child} />
          ))}
        </div>
      </details>
    );
  }

  return (
    <NavLink
      to={`/${node.path ?? ""}`}
      end
      className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}
    >
      {node.label}
    </NavLink>
  );
}

export default function Sidebar({ tree }: { tree: MenuNode[] }) {
  return (
    <nav className="sidebar">
      {tree.map((node) => (
        <MenuItem key={node.id} node={node} />
      ))}
    </nav>
  );
}
