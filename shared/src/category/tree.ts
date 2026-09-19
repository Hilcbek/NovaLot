// shared/src/category/tree.ts
import type { Category } from "../db/schema";

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export function buildCategoryTree(flatList: Category[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  flatList.forEach((cat) => nodeMap.set(cat.id, { ...cat, children: [] }));

  const roots: CategoryNode[] = [];

  nodeMap.forEach((node) => {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent id points at a row not in this list — treat as a root
        // defensively, rather than silently dropping the category.
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  const byOrder = (a: CategoryNode, b: CategoryNode) =>
    a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);

  function sortRecursive(nodes: CategoryNode[]) {
    nodes.sort(byOrder);
    nodes.forEach((n) => sortRecursive(n.children));
  }
  sortRecursive(roots);

  return roots;
}